# sessions.py
import logging
from datetime import datetime
from flask import Blueprint, request, jsonify, session, current_app
from werkzeug.utils import escape
from database import get_db

logger = logging.getLogger(__name__)

sessions_bp = Blueprint('sessions', __name__, url_prefix='/api/sessions')

@sessions_bp.before_request
def check_user_session():
    if 'user_id' not in session:
        logger.warning(f"Unauthorized access attempt to sessions API endpoint: {request.endpoint}")
        return jsonify({"error": "No has iniciado sesión"}), 401

@sessions_bp.route('', methods=['GET', 'POST'])
def handle_sessions():
    user_id = session['user_id']
    db = get_db()

    if request.method == 'POST':
        # Save current state as a new session
        try:
            data = request.json
            name = data.get('name', '').strip()
            description = escape(data.get('description', '').strip()) # Sanitize description

            if not name:
                today = datetime.now().strftime('%Y-%m-%d %H:%M')
                name = f"Session {today}"
            else:
                name = escape(name) # Sanitize name if provided

            current_app.logger.info(f"User {user_id} creating session: '{name}'")

            # Use transaction for atomicity
            db.execute("BEGIN TRANSACTION")

            # Create the session record
            cursor = db.execute(
                'INSERT INTO sessions (user_id, name, description) VALUES (?, ?, ?)',
                (user_id, name, description)
            )
            session_id = cursor.lastrowid
            current_app.logger.info(f"Created session with ID: {session_id} for user {user_id}")

            # Copy current transactions to session_transactions
            transactions = db.execute(
                'SELECT date, description, amount, currency, assigned_to FROM transactions WHERE user_id = ?',
                (user_id,)
            ).fetchall()

            current_app.logger.info(f"Found {len(transactions)} transactions to copy for session {session_id}")

            for t in transactions:
                # Ensure values are strings, handle None/NULL appropriately
                currency = t['currency'] if t['currency'] is not None else ""
                assigned_to = t['assigned_to'] if t['assigned_to'] is not None else ""
                db.execute(
                    'INSERT INTO session_transactions (session_id, date, description, amount, currency, assigned_to) VALUES (?, ?, ?, ?, ?, ?)',
                    (session_id, t['date'], t['description'], t['amount'], currency, assigned_to)
                )

            db.execute("COMMIT")

            # Fetch the created session details to return
            created_session = db.execute(
                 'SELECT id, name, description, created_at FROM sessions WHERE id = ?', (session_id,)
            ).fetchone()

            return jsonify({
                "id": created_session['id'],
                "name": created_session['name'],
                "description": created_session['description'],
                "created_at": created_session['created_at'], # Use DB timestamp
                "transaction_count": len(transactions)
            }), 201 # 201 Created status

        except Exception as e:
            db.execute("ROLLBACK")
            current_app.logger.error(f"Error saving session for user {user_id}: {type(e).__name__}: {str(e)}")
            return jsonify({"error": f"Failed to save session: {str(e)}"}), 500

    else: # GET - List all sessions
        try:
            sessions_raw = db.execute(
                """
                SELECT s.id, s.name, s.description, s.created_at, COUNT(st.id) as transaction_count
                FROM sessions s
                LEFT JOIN session_transactions st ON s.id = st.session_id
                WHERE s.user_id = ?
                GROUP BY s.id, s.name, s.description, s.created_at
                ORDER BY s.created_at DESC
                """,
                (user_id,)
            ).fetchall()

            result = [dict(s) for s in sessions_raw]
            return jsonify(result), 200
        except Exception as e:
            current_app.logger.error(f"Error retrieving sessions for user {user_id}: {str(e)}")
            return jsonify({"error": f"Error retrieving sessions: {str(e)}"}), 500

@sessions_bp.route('/<int:session_id>', methods=['DELETE'])
def delete_session(session_id):
    user_id = session['user_id']
    db = get_db()
    try:
        # Use transaction to ensure both session and its transactions are deleted
        db.execute("BEGIN TRANSACTION")
        # Delete associated transactions first (optional, depends on FK constraints/cascade)
        # If ON DELETE CASCADE is set for session_id in session_transactions, this is not strictly needed
        db.execute('DELETE FROM session_transactions WHERE session_id = ?', (session_id,))
        # Delete the session itself
        result = db.execute('DELETE FROM sessions WHERE id = ? AND user_id = ?', (session_id, user_id))

        if result.rowcount == 0:
            db.execute("ROLLBACK") # Rollback if session wasn't found
            current_app.logger.warning(f"Attempt to delete non-existent or unauthorized session {session_id} by user {user_id}")
            return jsonify({"error": "Session not found or access denied"}), 404

        db.execute("COMMIT")
        current_app.logger.info(f"Session {session_id} deleted successfully by user {user_id}")
        return jsonify({"message": "Session deleted successfully"}), 200
    except Exception as e:
        db.execute("ROLLBACK")
        current_app.logger.error(f"Error deleting session {session_id} for user {user_id}: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500


@sessions_bp.route('/<int:session_id>/load', methods=['POST'])
def load_session(session_id):
    user_id = session['user_id']
    db = get_db()
    try:
        # Verify the session belongs to this user
        session_record = db.execute(
            'SELECT id FROM sessions WHERE id = ? AND user_id = ?',
            (session_id, user_id)
        ).fetchone()

        if not session_record:
            return jsonify({"error": "Session not found or access denied"}), 404

        current_app.logger.info(f"User {user_id} loading session {session_id}")
        db.execute("BEGIN TRANSACTION")

        # Clear existing *current* transactions for the user
        db.execute('DELETE FROM transactions WHERE user_id = ?', (user_id,))

        # Load session transactions into current transactions table
        session_transactions = db.execute(
            'SELECT date, description, amount, currency, assigned_to FROM session_transactions WHERE session_id = ?',
            (session_id,)
        ).fetchall()

        current_app.logger.info(f"Loading {len(session_transactions)} transactions from session {session_id} for user {user_id}")
        for t in session_transactions:
             # Ensure values are strings, handle None/NULL appropriately
            currency = t['currency'] if t['currency'] is not None else ""
            assigned_to = t['assigned_to'] if t['assigned_to'] is not None else ""
            db.execute(
                'INSERT INTO transactions (user_id, date, description, amount, currency, assigned_to) VALUES (?, ?, ?, ?, ?, ?)',
                (user_id, t['date'], t['description'], t['amount'], currency, assigned_to)
            )

        db.execute("COMMIT")

        return jsonify({
            "message": "Session loaded successfully",
            "transaction_count": len(session_transactions)
        }), 200
    except Exception as e:
        db.rollback()
        current_app.logger.error(f"Error loading session {session_id} for user {user_id}: {str(e)}")
        return jsonify({"error": f"Server error loading session: {str(e)}"}), 500

@sessions_bp.route('/<int:session_id>/overwrite', methods=['POST'])
def overwrite_session(session_id):
    user_id = session['user_id']
    db = get_db()
    try:
        # Verify the session belongs to this user
        session_record = db.execute(
            'SELECT id, name FROM sessions WHERE id = ? AND user_id = ?',
            (session_id, user_id)
        ).fetchone()

        if not session_record:
            return jsonify({"error": "Session not found or access denied"}), 404

        current_app.logger.info(f"User {user_id} attempting to overwrite session ID {session_id} ('{session_record['name']}')")
        db.execute("BEGIN TRANSACTION")

        # 1. Delete existing transactions *for this session*
        delete_cursor = db.execute(
            'DELETE FROM session_transactions WHERE session_id = ?',
            (session_id,)
        )
        current_app.logger.info(f"Deleted {delete_cursor.rowcount} old transactions for session {session_id}")

        # 2. Get *current* transactions from the main table
        current_transactions = db.execute(
            'SELECT date, description, amount, currency, assigned_to FROM transactions WHERE user_id = ?',
            (user_id,)
        ).fetchall()
        current_app.logger.info(f"Found {len(current_transactions)} current transactions to save for session {session_id}")

        # 3. Insert current transactions into session_transactions
        new_count = 0
        for t in current_transactions:
            currency = t['currency'] if t['currency'] is not None else ""
            assigned_to = t['assigned_to'] if t['assigned_to'] is not None else ""
            db.execute(
                'INSERT INTO session_transactions (session_id, date, description, amount, currency, assigned_to) VALUES (?, ?, ?, ?, ?, ?)',
                (session_id, t['date'], t['description'], t['amount'], currency, assigned_to)
            )
            new_count += 1

        # Optionally: Update an 'updated_at' timestamp on the sessions table if you add one
        # db.execute('UPDATE sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', (session_id,))

        db.execute("COMMIT")

        current_app.logger.info(f"Successfully overwrote session {session_id} with {new_count} transactions for user {user_id}.")
        return jsonify({
            "message": f"Session '{session_record['name']}' overwritten successfully.",
            "transaction_count": new_count
            }), 200

    except Exception as e:
        db.execute("ROLLBACK")
        current_app.logger.error(f"Error overwriting session {session_id} for user {user_id}: {str(e)}")
        return jsonify({"error": f"Failed to overwrite session: {str(e)}"}), 500

@sessions_bp.route('/<int:session_id>/transactions', methods=['GET'])
def get_session_transactions(session_id):
    user_id = session['user_id']
    db = get_db()
    try:
        # Verify session belongs to user
        session_check = db.execute(
            'SELECT id FROM sessions WHERE id = ? AND user_id = ?',
            (session_id, user_id)
        ).fetchone()
        if not session_check:
            return jsonify({"error": "Session not found or access denied"}), 404

        # Fetch transactions for this specific session
        transactions_raw = db.execute(
            'SELECT id, date, description, amount, currency, assigned_to FROM session_transactions WHERE session_id = ? ORDER BY id', # Added ID and order
            (session_id,)
        ).fetchall()

        # Convert to list of dictionaries, handling assigned_to conversion
        transactions = []
        for row in transactions_raw:
            t_dict = dict(row)
            t_dict['assigned_to'] = [p.strip() for p in t_dict['assigned_to'].split(',') if p.strip()] if t_dict['assigned_to'] else []
            transactions.append(t_dict)

        current_app.logger.info(f"Fetched {len(transactions)} transactions for session {session_id} for user {user_id}")
        return jsonify(transactions), 200

    except Exception as e:
        current_app.logger.error(f"Error fetching transactions for session {session_id} (User: {user_id}): {str(e)}")
        return jsonify({"error": "Failed to fetch session transactions"}), 500