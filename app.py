# app.py
import os
import logging
from flask import Flask, session, jsonify, render_template, request
from flask_session import Session
from database import close_connection, init_db # Removed get_db as it's used in blueprints

# Configure logging (Consider moving to a config file or function)
log_file = "app.log"
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s', # Added filename/lineno
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__) # Get logger for app level

app = Flask(__name__)

# App Configuration (Consider moving to config file/object)
app.secret_key = os.environ.get('SECRET_KEY', os.urandom(24)) # Use environment variable or default
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = 86400 * 30 # 30 days
app.config['SESSION_FILE_DIR'] = './flask_session' # Explicitly set session dir
os.makedirs(app.config['SESSION_FILE_DIR'], exist_ok=True) # Ensure session dir exists

Session(app)

# Register the teardown function for database connection
@app.teardown_appcontext
def close_db_connection(exception):
    close_connection(exception)

# --- Register Blueprints ---
from auth import auth
from participants import participants_bp
from transactions import transactions_bp
from sessions import sessions_bp

app.register_blueprint(auth)
app.register_blueprint(participants_bp)
app.register_blueprint(transactions_bp)
app.register_blueprint(sessions_bp)

logger.info("Registered blueprints: auth, participants, transactions, sessions")

# --- Core Routes ---
@app.route('/')
def index():
    # Check if user is logged in to potentially pass info to template
    user_logged_in = 'user_id' in session
    # username = session.get('username', None) # Example if needed
    return render_template('index.html', user_logged_in=user_logged_in) # Pass login status

# --- Error Handlers ---
@app.errorhandler(404)
def page_not_found(e):
    # Log the 404 error with the path
    logger.warning(f"404 Not Found: {request.path} - {e}")
    # Check if the request expects JSON
    if request.accept_mimetypes.accept_json and not request.accept_mimetypes.accept_html:
        return jsonify({"error": "The requested resource was not found"}), 404
    # Otherwise, maybe render a 404 template? For now, keep JSON.
    return jsonify({"error": "The requested resource was not found"}), 404


@app.errorhandler(500)
def internal_server_error(e):
    # Log the full error traceback if possible
    logger.error(f"500 Internal Server Error: {e}", exc_info=True)
    # Generic error message for the client
    return jsonify({"error": "An internal server error occurred. Please try again later."}), 500

@app.errorhandler(401) # Add a handler for Unauthorized
def unauthorized_error(e):
    logger.warning(f"401 Unauthorized access attempt: {request.path} - {e}")
    return jsonify({"error": "Authentication required."}), 401

@app.errorhandler(400) # Add a handler for Bad Request
def bad_request_error(e):
    # Description often contains useful info from abort(400, description='...')
    error_desc = e.description if hasattr(e, 'description') else 'Bad request'
    logger.warning(f"400 Bad Request: {request.path} - {error_desc}")
    return jsonify({"error": error_desc}), 400


# --- Main Execution ---
if __name__ == '__main__':
    logger.info("Initializing database...")
    init_db(app) # Initialize DB if needed
    logger.info("Starting Flask development server...")
    # Consider using environment variables for host/port/debug
    app.run(host='0.0.0.0', port=5000, debug=os.environ.get('FLASK_DEBUG', 'False').lower() == 'true')