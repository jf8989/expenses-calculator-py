# migrate_user_data.py
import os
import sqlite3
import logging
from datetime import datetime

# Firebase Admin SDK
import firebase_admin
from firebase_admin import credentials, firestore

# --- Configuration ---
SQLITE_DB_PATH = 'expense_sharing.db'
TARGET_USER_EMAIL = 'askjfma@gmail.com'
TARGET_FIREBASE_UID = 'Yeefwtp2lze3LHJ4IwKPIcOJvI72' # The Firebase UID for the target user

# --- Logging Setup ---
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()] # Log to console for script execution
)
logger = logging.getLogger(__name__)

# --- Helper Functions ---
def connect_sqlite():
    """Connects to the SQLite database."""
    if not os.path.exists(SQLITE_DB_PATH):
        logger.error(f"SQLite database not found at: {SQLITE_DB_PATH}")
        return None
    try:
        conn = sqlite3.connect(SQLITE_DB_PATH)
        conn.row_factory = sqlite3.Row
        logger.info(f"Connected to SQLite database: {SQLITE_DB_PATH}")
        return conn
    except sqlite3.Error as e:
        logger.error(f"Error connecting to SQLite DB: {e}")
        return None

def initialize_firebase():
    """Initializes the Firebase Admin SDK."""
    try:
        cred_path = os.environ.get('FIREBASE_SERVICE_ACCOUNT_KEY')
        if not cred_path:
            logger.error("FATAL: FIREBASE_SERVICE_ACCOUNT_KEY environment variable not set.")
            return None
        if not os.path.exists(cred_path):
            logger.error(f"FATAL: Firebase service account key file not found at: {cred_path}")
            return None

        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        logger.info("Firebase Admin SDK initialized successfully.")
        return db
    except Exception as e:
        logger.exception("FATAL: Failed to initialize Firebase Admin SDK.")
        return None

def parse_assigned_to(assigned_str):
    """Parses the comma-separated assigned_to string into a list."""
    if not assigned_str:
        return []
    return [p.strip() for p in assigned_str.split(',') if p.strip()]

# --- Main Migration Logic ---
def migrate_data(sqlite_conn, firestore_db):
    """Performs the data migration."""
    logger.info(f"Starting migration for user email: {TARGET_USER_EMAIL} -> Firebase UID: {TARGET_FIREBASE_UID}")

    cursor = sqlite_conn.cursor()

    # 1. Find SQLite User ID
    cursor.execute('SELECT id FROM users WHERE email = ?', (TARGET_USER_EMAIL,))
    user_row = cursor.fetchone()
    if not user_row:
        logger.error(f"User with email {TARGET_USER_EMAIL} not found in SQLite database.")
        return False
    sqlite_user_id = user_row['id']
    logger.info(f"Found SQLite user ID: {sqlite_user_id} for email {TARGET_USER_EMAIL}")

    # Get Firestore references
    user_doc_ref = firestore_db.collection('users').document(TARGET_FIREBASE_UID)
    sessions_collection_ref = user_doc_ref.collection('sessions')

    # Use a Firestore batch for atomic writes
    batch = firestore_db.batch()
    migration_successful = True
    sessions_migrated_count = 0
    participants_migrated = []

    try:
        # 2. Migrate Participants
        cursor.execute('SELECT name FROM participants WHERE user_id = ?', (sqlite_user_id,))
        participants_rows = cursor.fetchall()
        participants_migrated = sorted([p['name'] for p in participants_rows])
        if participants_migrated:
            batch.set(user_doc_ref, {'participants': participants_migrated}, merge=True)
            logger.info(f"Migrating {len(participants_migrated)} participants: {participants_migrated}")
        else:
            logger.info("No participants found in SQLite for this user.")

        # 3. Migrate Sessions and their Transactions
        cursor.execute('SELECT id, name, description, created_at FROM sessions WHERE user_id = ?', (sqlite_user_id,))
        sessions_rows = cursor.fetchall()
        logger.info(f"Found {len(sessions_rows)} sessions in SQLite for user {sqlite_user_id}.")

        for session_row in sessions_rows:
            sqlite_session_id = session_row['id']
            session_name = session_row['name']
            logger.info(f"Processing session ID: {sqlite_session_id}, Name: '{session_name}'")

            # Fetch transactions for this session
            cursor.execute(
                'SELECT date, description, amount, currency, assigned_to FROM session_transactions WHERE session_id = ?',
                (sqlite_session_id,)
            )
            transactions_rows = cursor.fetchall()
            logger.info(f"Found {len(transactions_rows)} transactions for session {sqlite_session_id}")

            transactions_list = []
            for tx_row in transactions_rows:
                transactions_list.append({
                    'date': tx_row['date'],
                    'description': tx_row['description'],
                    'amount': float(tx_row['amount']), # Ensure amount is float
                    'currency': tx_row['currency'] or "", # Handle NULL currency
                    'assigned_to': parse_assigned_to(tx_row['assigned_to']) # Parse string to list
                })

            # Prepare session data for Firestore
            # Use SQLite session ID as Firestore document ID for traceability, or let Firestore auto-generate
            # Using SQLite ID: session_doc_ref = sessions_collection_ref.document(str(sqlite_session_id))
            # Using Auto-ID:
            session_doc_ref = sessions_collection_ref.document()

            # Convert SQLite timestamp string to datetime object if needed, then Firestore handles it
            try:
                created_at_dt = datetime.fromisoformat(session_row['created_at'])
            except ValueError:
                 logger.warning(f"Could not parse created_at timestamp '{session_row['created_at']}' for session {sqlite_session_id}. Using current time.")
                 created_at_dt = datetime.now() # Fallback or handle as needed

            session_data = {
                'name': session_name,
                'description': session_row['description'] or "",
                'transactions': transactions_list,
                'participants': participants_migrated, # Snapshot of participants at time of migration
                'currencies': {'main': 'PEN', 'secondary': 'USD'}, # Default/Placeholder - Add logic if stored in SQLite
                'createdAt': created_at_dt, # Use parsed or fallback datetime
                'lastUpdatedAt': firestore.SERVER_TIMESTAMP, # Set initial update time
                'migratedFromSqliteId': sqlite_session_id # Optional: track original ID
            }

            batch.set(session_doc_ref, session_data)
            sessions_migrated_count += 1

        # 4. Set Metadata Timestamp
        batch.set(user_doc_ref, {'metadata': {'lastUpdatedAt': firestore.SERVER_TIMESTAMP}}, merge=True)
        logger.info("Adding final metadata timestamp update to batch.")

        # 5. Commit the Batch
        batch.commit()
        logger.info(f"Firestore batch commit successful. Migrated {sessions_migrated_count} sessions.")

    except Exception as e:
        logger.exception(f"Error during migration process: {e}")
        migration_successful = False

    return migration_successful

# --- Script Execution ---
if __name__ == "__main__":
    logger.info("--- Starting SQLite to Firestore User Data Migration ---")

    firestore_db_client = initialize_firebase()
    sqlite_connection = connect_sqlite()

    if firestore_db_client and sqlite_connection:
        try:
            success = migrate_data(sqlite_connection, firestore_db_client)
            if success:
                logger.info("--- Migration completed successfully! ---")
            else:
                logger.error("--- Migration failed. Check logs for details. ---")
        finally:
            sqlite_connection.close()
            logger.info("Closed SQLite database connection.")
    else:
        logger.error("Migration aborted due to initialization errors.")

    logger.info("--- Migration script finished ---")