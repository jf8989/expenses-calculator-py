# app.py
import os
import logging
from functools import wraps # Added for decorator

from flask import Flask, jsonify, render_template, request, g # Added g
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Firebase Admin SDK
import firebase_admin
from firebase_admin import credentials, auth, firestore

# Configure logging
log_file = "app.log"
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s', # Keep detailed format
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__) # Get logger for app level

# --- Firebase Initialization ---
firestore_db = None # Ensure firestore_db is defined in this scope
# Check if the default app already exists before initializing
if not firebase_admin._apps:
    try:
        # Get the service account key file path from environment variable
        cred_path = os.environ.get('FIREBASE_SERVICE_ACCOUNT_KEY')
        if not cred_path:
            logger.error("FATAL: FIREBASE_SERVICE_ACCOUNT_KEY environment variable not set.")
            raise ValueError("Firebase service account key path not configured.")
        if not os.path.exists(cred_path):
             logger.error(f"FATAL: Firebase service account key file not found at: {cred_path}")
             raise FileNotFoundError(f"Service account key file not found at specified path: {cred_path}")

        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        firestore_db = firestore.client() # Initialize Firestore client globally
        logger.info("Firebase Admin SDK initialized successfully.")
    except Exception as e:
        logger.exception("FATAL: Failed to initialize Firebase Admin SDK.")
        firestore_db = None # Ensure it's None if init fails
else:
    logger.warning("Firebase Admin SDK already initialized. Skipping initialization.")
    # Get the client for the already initialized default app
    firestore_db = firestore.client()

# --- Flask App Initialization ---
app = Flask(__name__)

# App Configuration
# Use environment variable for secret key or default (useful for flash messages etc.)
app.secret_key = os.environ.get('SECRET_KEY', os.urandom(24))
# Removed Flask-Session configurations
# app.config['SESSION_TYPE'] = 'filesystem'
# ... etc ...

# Removed Session(app) initialization

# --- Authentication Decorator ---
def login_required(f):
    """
    Decorator to ensure user is authenticated via Firebase ID token.
    Verifies the 'Authorization: Bearer <token>' header.
    Adds user UID to Flask's 'g' object as 'g.user_id'.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        token = None
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split('Bearer ')[1]

        if not token:
            logger.warning(f"Auth token missing for endpoint: {request.endpoint}")
            return jsonify({"error": "Authorization token required"}), 401

        try:
            # Verify the ID token while checking if the token is revoked.
            decoded_token = auth.verify_id_token(token)
            g.user_id = decoded_token['uid'] # Add user ID to request context
            g.user_email = decoded_token.get('email', None) # Optionally add email
            logger.debug(f"Token verified for user: {g.user_id} accessing {request.endpoint}")
        except auth.ExpiredIdTokenError:
            logger.warning(f"Expired token received for endpoint: {request.endpoint}")
            return jsonify({"error": "Token has expired", "code": "TOKEN_EXPIRED"}), 401
        except auth.InvalidIdTokenError as e:
            logger.error(f"Invalid token received for endpoint: {request.endpoint}. Error: {e}")
            return jsonify({"error": "Invalid authentication token", "code": "TOKEN_INVALID"}), 401
        except Exception as e: # Catch other potential errors during verification
            logger.exception(f"Error verifying token for endpoint: {request.endpoint}")
            return jsonify({"error": "Could not verify authentication token", "code": "TOKEN_VERIFICATION_FAILED"}), 500

        return f(*args, **kwargs)
    return decorated_function

# --- Register Blueprints ---
# Ensure blueprints are updated to use Firestore and the 'login_required' decorator
from auth import auth_bp # Renamed blueprint variable for clarity
from participants import participants_bp
from sessions import sessions_bp

app.register_blueprint(auth_bp) # Register the updated auth blueprint
app.register_blueprint(participants_bp)
app.register_blueprint(sessions_bp)

logger.info("Registered blueprints: auth, participants, sessions") 


# --- Removed Teardown Function ---
# @app.teardown_appcontext
# def close_db_connection(exception):
#     close_connection(exception)


# --- Core Routes ---
@app.route('/')
def index():
    # No longer need to pass login status from backend session
    return render_template('index.html')

# --- Error Handlers (Keep as they are useful) ---
@app.errorhandler(404)
def page_not_found(e):
    logger.warning(f"404 Not Found: {request.path} - {e}")
    if request.accept_mimetypes.accept_json and not request.accept_mimetypes.accept_html:
        return jsonify({"error": "The requested resource was not found"}), 404
    return jsonify({"error": "The requested resource was not found"}), 404


@app.errorhandler(500)
def internal_server_error(e):
    logger.error(f"500 Internal Server Error: {e}", exc_info=True)
    return jsonify({"error": "An internal server error occurred. Please try again later."}), 500

@app.errorhandler(401)
def unauthorized_error(e):
    # This might be triggered by the decorator or other checks
    error_desc = e.description if hasattr(e, 'description') else 'Authentication required.'
    logger.warning(f"401 Unauthorized: {request.path} - {error_desc}")
    # Check if the response should be JSON or potentially a redirect in other apps
    return jsonify({"error": error_desc}), 401

@app.errorhandler(400)
def bad_request_error(e):
    error_desc = e.description if hasattr(e, 'description') else 'Bad request'
    logger.warning(f"400 Bad Request: {request.path} - {error_desc}")
    return jsonify({"error": error_desc}), 400


# --- Main Execution ---
if __name__ == '__main__':
    # Removed database initialization call
    # logger.info("Initializing database...")
    # init_db(app)
    if firestore_db is None:
        logger.critical("Firestore DB client not initialized. Aborting startup.")
        # Exit or handle appropriately depending on deployment strategy
        exit(1) # Exit if Firebase didn't initialize

    logger.info("Starting Flask development server...")
    # Use environment variables for host/port/debug for flexibility
    host = os.environ.get('FLASK_RUN_HOST', '127.0.0.1') # Default to 127.0.0.1
    port = int(os.environ.get('FLASK_RUN_PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(host=host, port=port, debug=debug)