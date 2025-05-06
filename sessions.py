# sessions.py
import logging
from datetime import datetime, timezone # Import timezone
from flask import Blueprint, request, jsonify, g, current_app
from werkzeug.utils import escape

# Import Firestore directly
from firebase_admin import firestore # REMOVED: from app import firestore_db

# Import the decorator
from auth_decorator import login_required

logger = logging.getLogger(__name__)

sessions_bp = Blueprint('sessions', __name__, url_prefix='/api')

# --- Helper Function to Update User Metadata Timestamp ---
# Defined here, but consider moving to a shared utils file
def _update_user_metadata_timestamp(user_id):
    """Updates the lastUpdatedAt field in the user's metadata."""
    try:
        db = firestore.client() # Get client instance
        user_doc_ref = db.collection('users').document(user_id)
        user_doc_ref.set({
            'metadata': {
                'lastUpdatedAt': firestore.SERVER_TIMESTAMP
            }
        }, merge=True)
        logger.info(f"[Firestore:Metadata] Updated lastUpdatedAt for user {user_id}")
    except Exception as e:
        logger.exception(f"[Firestore:Metadata] Failed to update lastUpdatedAt for user {user_id}: {e}")

# --- New Route for Fetching All User Data (for Sync) ---
@sessions_bp.route('/user/data', methods=['GET'])
@login_required
def get_user_data():
    """
    Fetches all relevant user data (participants, sessions with transactions)
    based on a timestamp comparison for client-side caching.
    """
    user_id = g.user_id
    db = firestore.client() # Get client instance
    last_known_timestamp_str = request.args.get('lastKnownTimestamp')
    last_known_timestamp = None

    if last_known_timestamp_str:
        try:
            # Ensure parsing handles potential timezone info correctly
            # Remove 'Z' if present, Python's fromisoformat handles timezone offsets like +00:00
            if last_known_timestamp_str.endswith('Z'):
                 last_known_timestamp_str = last_known_timestamp_str[:-1] + '+00:00'
            # Parse ISO string into timezone-aware datetime object
            last_known_timestamp = datetime.fromisoformat(last_known_timestamp_str)
            # Ensure it's offset-aware for comparison with Firestore's timezone-aware timestamps
            if last_known_timestamp.tzinfo is None:
                 # This case shouldn't happen if parsing '+00:00' works, but as a fallback:
                 # Assume UTC if no timezone info provided by client somehow
                 last_known_timestamp = last_known_timestamp.replace(tzinfo=timezone.utc)
            logger.debug(f"[Firestore:Sync] Client lastKnownTimestamp: {last_known_timestamp} for user {user_id}")
        except ValueError:
            logger.warning(f"[Firestore:Sync] Invalid lastKnownTimestamp format '{last_known_timestamp_str}' for user {user_id}. Fetching all data.")
            last_known_timestamp = None

    try:
        user_doc_ref = db.collection('users').document(user_id)
        user_doc = user_doc_ref.get(['metadata.lastUpdatedAt', 'participants'])

        current_metadata = user_doc.to_dict().get('metadata', {}) if user_doc.exists else {}
        current_timestamp = current_metadata.get('lastUpdatedAt') # Firestore timestamps are timezone-aware (UTC)
        participants = user_doc.to_dict().get('participants', []) if user_doc.exists else []

        # Compare timestamps (both should be timezone-aware)
        if last_known_timestamp and current_timestamp and current_timestamp <= last_known_timestamp:
            logger.info(f"[Firestore:Sync] Client data is current for user {user_id}. Server TS: {current_timestamp}, Client TS: {last_known_timestamp}")
            # Ensure timestamp is returned in consistent ISO format with Z
            ts_iso = current_timestamp.isoformat(timespec='milliseconds').replace('+00:00', 'Z')
            return jsonify({"status": "current", "timestamp": ts_iso}), 200

        logger.info(f"[Firestore:Sync] Fetching all session data for user {user_id}. Reason: {'Stale data' if last_known_timestamp else 'Initial fetch'}")
        sessions_ref = user_doc_ref.collection('sessions')
        sessions_query = sessions_ref.order_by('createdAt', direction=firestore.Query.DESCENDING).stream() # Order by creation time

        all_sessions = []
        for session_doc in sessions_query:
            session_data = session_doc.to_dict()
            session_data['id'] = session_doc.id
            # Convert Timestamps to ISO strings for JSON
            if 'createdAt' in session_data and isinstance(session_data['createdAt'], datetime):
                 # Ensure conversion includes timezone 'Z'
                 session_data['createdAt'] = session_data['createdAt'].isoformat(timespec='milliseconds').replace('+00:00', 'Z')
            if 'lastUpdatedAt' in session_data and isinstance(session_data['lastUpdatedAt'], datetime):
                 session_data['lastUpdatedAt'] = session_data['lastUpdatedAt'].isoformat(timespec='milliseconds').replace('+00:00', 'Z')
            all_sessions.append(session_data)

        # Current timestamp to return (use ISO format with Z)
        current_ts_iso = current_timestamp.isoformat(timespec='milliseconds').replace('+00:00', 'Z') if current_timestamp else None

        response_data = {
            "status": "updated",
            "participants": sorted(participants), # Return sorted participants
            "sessions": all_sessions, # Already sorted by query
            "timestamp": current_ts_iso
        }
        logger.info(f"[Firestore:Sync] Returning full data ({len(participants)} participants, {len(all_sessions)} sessions) for user {user_id}")
        return jsonify(response_data), 200

    except Exception as e:
        logger.exception(f"[Firestore:Sync] Error fetching user data for user {user_id}: {e}")
        return jsonify({"error": "Failed to fetch user data"}), 500


# --- Session CRUD Operations ---

@sessions_bp.route('/sessions', methods=['POST'])
@login_required
def save_new_session():
    """
    Saves the provided client state (transactions, participants, currencies)
    as a new session document in Firestore.
    """
    user_id = g.user_id
    db = firestore.client() # Get client instance
    try:
        data = request.json
        session_name = escape(data.get('name', '').strip())
        description = escape(data.get('description', '').strip())
        transactions = data.get('transactions', [])
        participants = data.get('participants', [])
        currencies = data.get('currencies', {})

        if not session_name:
            session_name = f"Session {datetime.now().strftime('%Y-%m-%d %H:%M')}"

        logger.info(f"[Firestore:Sessions] User {user_id} saving new session: '{session_name}' with {len(transactions)} transactions.")

        sessions_ref = db.collection('users').document(user_id).collection('sessions')
        new_session_ref = sessions_ref.document()
        session_data = {
            'name': session_name,
            'description': description,
            'transactions': transactions,
            'participants': participants,
            'currencies': currencies,
            'createdAt': firestore.SERVER_TIMESTAMP,
            'lastUpdatedAt': firestore.SERVER_TIMESTAMP
        }
        new_session_ref.set(session_data)
        _update_user_metadata_timestamp(user_id)

        return jsonify({
            "message": "Session saved successfully",
            "sessionId": new_session_ref.id,
            "name": session_name,
        }), 201

    except Exception as e:
        logger.exception(f"[Firestore:Sessions] Error saving new session for user {user_id}: {e}")
        return jsonify({"error": f"Failed to save session: {str(e)}"}), 500


@sessions_bp.route('/sessions/<string:session_id>', methods=['PUT'])
@login_required
def overwrite_session(session_id):
    """
    Overwrites an existing session document with the provided client state.
    """
    user_id = g.user_id
    db = firestore.client() # Get client instance
    try:
        data = request.json
        session_name = escape(data.get('name', '').strip())
        description = escape(data.get('description', '').strip())
        transactions = data.get('transactions', [])
        participants = data.get('participants', [])
        currencies = data.get('currencies', {})

        if not session_name:
             return jsonify({"error": "Session name cannot be empty for update"}), 400

        logger.info(f"[Firestore:Sessions] User {user_id} overwriting session ID: {session_id} with {len(transactions)} transactions.")

        session_doc_ref = db.collection('users').document(user_id).collection('sessions').document(session_id)

        # Check if document exists before updating
        doc_snapshot = session_doc_ref.get(['name']) # Fetch minimal field to check existence
        if not doc_snapshot.exists:
            logger.warning(f"[Firestore:Sessions] Overwrite failed: Session {session_id} not found for user {user_id}.")
            return jsonify({"error": "Session not found"}), 404

        session_data = {
            'name': session_name,
            'description': description,
            'transactions': transactions,
            'participants': participants,
            'currencies': currencies,
            'lastUpdatedAt': firestore.SERVER_TIMESTAMP
        }
        session_doc_ref.update(session_data)
        _update_user_metadata_timestamp(user_id)

        return jsonify({
            "message": f"Session '{session_name}' overwritten successfully.",
            "sessionId": session_id,
            "transaction_count": len(transactions)
        }), 200

    except Exception as e:
        logger.exception(f"[Firestore:Sessions] Error overwriting session {session_id} for user {user_id}: {e}")
        return jsonify({"error": f"Failed to overwrite session: {str(e)}"}), 500


@sessions_bp.route('/sessions/<string:session_id>', methods=['DELETE'])
@login_required
def delete_session(session_id):
    """Deletes a specific session document."""
    user_id = g.user_id
    db = firestore.client() # Get client instance
    logger.info(f"[Firestore:Sessions] User {user_id} attempting to delete session ID: {session_id}")
    try:
        session_doc_ref = db.collection('users').document(user_id).collection('sessions').document(session_id)

        doc_snapshot = session_doc_ref.get(['name']) # Check existence
        if not doc_snapshot.exists:
            logger.warning(f"[Firestore:Sessions] Delete failed: Session {session_id} not found for user {user_id}.")
            return jsonify({"error": "Session not found"}), 404

        session_doc_ref.delete()
        _update_user_metadata_timestamp(user_id)

        logger.info(f"[Firestore:Sessions] Session {session_id} deleted successfully by user {user_id}")
        return jsonify({"message": "Session deleted successfully"}), 200
    except Exception as e:
        logger.exception(f"[Firestore:Sessions] Error deleting session {session_id} for user {user_id}: {e}")
        return jsonify({"error": f"Server error deleting session: {str(e)}"}), 500