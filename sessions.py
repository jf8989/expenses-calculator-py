# sessions.py
import logging
from datetime import datetime
from flask import Blueprint, request, jsonify, g, current_app
from werkzeug.utils import escape

# Import Firestore client, FieldValue for timestamps, etc.
from app import firestore_db
from firebase_admin import firestore

# Import the decorator
from auth_decorator import login_required

logger = logging.getLogger(__name__)

sessions_bp = Blueprint('sessions', __name__, url_prefix='/api') # Changed prefix slightly

# --- Helper Function to Update User Metadata Timestamp ---
def _update_user_metadata_timestamp(user_id):
    """Updates the lastUpdatedAt field in the user's metadata."""
    try:
        user_doc_ref = firestore_db.collection('users').document(user_id)
        user_doc_ref.set({
            'metadata': {
                'lastUpdatedAt': firestore.SERVER_TIMESTAMP
            }
        }, merge=True)
        logger.info(f"[Firestore:Metadata] Updated lastUpdatedAt for user {user_id}")
    except Exception as e:
        logger.exception(f"[Firestore:Metadata] Failed to update lastUpdatedAt for user {user_id}: {e}")
        # Decide if this should raise an error or just log

# --- New Route for Fetching All User Data (for Sync) ---
@sessions_bp.route('/user/data', methods=['GET'])
@login_required
def get_user_data():
    """
    Fetches all relevant user data (participants, sessions with transactions)
    based on a timestamp comparison for client-side caching.
    """
    user_id = g.user_id
    last_known_timestamp_str = request.args.get('lastKnownTimestamp')
    last_known_timestamp = None

    if last_known_timestamp_str:
        try:
            # Firestore Timestamps often come back as ISO 8601 strings with Zulu offset
            # Need robust parsing. Assuming ISO format like '2024-07-27T10:30:00.123Z'
            # Remove 'Z' and add '+00:00' for Python compatibility if needed
            if last_known_timestamp_str.endswith('Z'):
                 last_known_timestamp_str = last_known_timestamp_str[:-1] + '+00:00'
            last_known_timestamp = datetime.fromisoformat(last_known_timestamp_str)
            logger.debug(f"[Firestore:Sync] Client lastKnownTimestamp: {last_known_timestamp} for user {user_id}")
        except ValueError:
            logger.warning(f"[Firestore:Sync] Invalid lastKnownTimestamp format '{last_known_timestamp_str}' for user {user_id}. Fetching all data.")
            last_known_timestamp = None # Treat as invalid, fetch all

    try:
        user_doc_ref = firestore_db.collection('users').document(user_id)
        user_doc = user_doc_ref.get(['metadata.lastUpdatedAt', 'participants']) # Get only needed fields

        current_metadata = user_doc.to_dict().get('metadata', {}) if user_doc.exists else {}
        current_timestamp = current_metadata.get('lastUpdatedAt')
        participants = user_doc.to_dict().get('participants', []) if user_doc.exists else []

        # Compare timestamps only if both exist
        if last_known_timestamp and current_timestamp and current_timestamp <= last_known_timestamp:
            logger.info(f"[Firestore:Sync] Client data is current for user {user_id}. Timestamp: {current_timestamp}")
            # Return 304 Not Modified or a specific status
            # For simplicity, returning a status object
            return jsonify({"status": "current", "timestamp": current_timestamp.isoformat() + "Z"}), 200

        # Fetch all sessions if data is stale or client has no timestamp
        logger.info(f"[Firestore:Sync] Fetching all session data for user {user_id}. Reason: {'Stale data' if last_known_timestamp else 'Initial fetch'}")
        sessions_ref = user_doc_ref.collection('sessions')
        sessions_query = sessions_ref.stream() # Use stream for potentially large collections

        all_sessions = []
        for session_doc in sessions_query:
            session_data = session_doc.to_dict()
            session_data['id'] = session_doc.id # Add document ID
            # Convert Timestamps to ISO strings for JSON serialization
            if 'createdAt' in session_data and isinstance(session_data['createdAt'], datetime):
                 session_data['createdAt'] = session_data['createdAt'].isoformat() + "Z"
            if 'lastUpdatedAt' in session_data and isinstance(session_data['lastUpdatedAt'], datetime):
                 session_data['lastUpdatedAt'] = session_data['lastUpdatedAt'].isoformat() + "Z"
            all_sessions.append(session_data)

        # Sort sessions if needed, e.g., by name or date
        all_sessions.sort(key=lambda x: x.get('name', ''))

        response_data = {
            "status": "updated",
            "participants": participants,
            "sessions": all_sessions,
            "timestamp": current_timestamp.isoformat() + "Z" if current_timestamp else None
        }
        logger.info(f"[Firestore:Sync] Returning full data ({len(participants)} participants, {len(all_sessions)} sessions) for user {user_id}")
        return jsonify(response_data), 200

    except Exception as e:
        logger.exception(f"[Firestore:Sync] Error fetching user data for user {user_id}: {e}")
        return jsonify({"error": "Failed to fetch user data"}), 500


# --- Session CRUD Operations ---

@sessions_bp.route('/sessions', methods=['POST']) # Changed from /api/sessions to /api/user/sessions
@login_required
def save_new_session():
    """
    Saves the provided client state (transactions, participants, currencies)
    as a new session document in Firestore.
    """
    user_id = g.user_id
    try:
        data = request.json
        # Expecting client to send the complete state to be saved
        session_name = escape(data.get('name', '').strip())
        description = escape(data.get('description', '').strip())
        transactions = data.get('transactions', []) # Validate structure later if needed
        participants = data.get('participants', []) # Validate structure later if needed
        currencies = data.get('currencies', {}) # Validate structure later if needed

        if not session_name:
            # Generate default name if needed (or require it from client)
            session_name = f"Session {datetime.now().strftime('%Y-%m-%d %H:%M')}"

        logger.info(f"[Firestore:Sessions] User {user_id} saving new session: '{session_name}' with {len(transactions)} transactions.")

        sessions_ref = firestore_db.collection('users').document(user_id).collection('sessions')

        # Create new session document with auto-generated ID
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

        # Update the user's overall metadata timestamp
        _update_user_metadata_timestamp(user_id)

        # Fetch the timestamp to return (optional, client might get it from next sync)
        # new_doc = new_session_ref.get()
        # created_at = new_doc.create_time.isoformat() + "Z"

        return jsonify({
            "message": "Session saved successfully",
            "sessionId": new_session_ref.id,
            "name": session_name,
            # "createdAt": created_at # Optionally return timestamp
        }), 201

    except Exception as e:
        logger.exception(f"[Firestore:Sessions] Error saving new session for user {user_id}: {e}")
        return jsonify({"error": f"Failed to save session: {str(e)}"}), 500


@sessions_bp.route('/sessions/<string:session_id>', methods=['PUT']) # Changed from POST overwrite to PUT
@login_required
def overwrite_session(session_id):
    """
    Overwrites an existing session document with the provided client state.
    Uses PUT method for replacing the entire resource representation (or parts via update).
    """
    user_id = g.user_id
    try:
        data = request.json
        # Expecting client to send the complete state to overwrite with
        session_name = escape(data.get('name', '').strip()) # Allow name update
        description = escape(data.get('description', '').strip())
        transactions = data.get('transactions', [])
        participants = data.get('participants', [])
        currencies = data.get('currencies', {})

        if not session_name:
             return jsonify({"error": "Session name cannot be empty for update"}), 400

        logger.info(f"[Firestore:Sessions] User {user_id} overwriting session ID: {session_id} with {len(transactions)} transactions.")

        session_doc_ref = firestore_db.collection('users').document(user_id).collection('sessions').document(session_id)

        # Check if document exists before updating (optional, update handles creation too)
        # doc_snapshot = session_doc_ref.get()
        # if not doc_snapshot.exists:
        #     logger.warning(f"[Firestore:Sessions] Overwrite failed: Session {session_id} not found for user {user_id}.")
        #     return jsonify({"error": "Session not found"}), 404

        # Update the document. Use update for partial or set(merge=True) for full replace semantics
        session_data = {
            'name': session_name,
            'description': description,
            'transactions': transactions,
            'participants': participants,
            'currencies': currencies,
            'lastUpdatedAt': firestore.SERVER_TIMESTAMP
            # Do not update 'createdAt'
        }
        session_doc_ref.update(session_data) # Use update to modify existing fields

        # Update the user's overall metadata timestamp
        _update_user_metadata_timestamp(user_id)

        return jsonify({
            "message": f"Session '{session_name}' overwritten successfully.",
            "sessionId": session_id,
            "transaction_count": len(transactions) # Return new count
        }), 200

    except Exception as e:
        logger.exception(f"[Firestore:Sessions] Error overwriting session {session_id} for user {user_id}: {e}")
        return jsonify({"error": f"Failed to overwrite session: {str(e)}"}), 500


@sessions_bp.route('/sessions/<string:session_id>', methods=['DELETE'])
@login_required
def delete_session(session_id):
    """Deletes a specific session document."""
    user_id = g.user_id
    logger.info(f"[Firestore:Sessions] User {user_id} attempting to delete session ID: {session_id}")
    try:
        session_doc_ref = firestore_db.collection('users').document(user_id).collection('sessions').document(session_id)

        # Check existence before delete for accurate logging/response
        doc_snapshot = session_doc_ref.get()
        if not doc_snapshot.exists:
            logger.warning(f"[Firestore:Sessions] Delete failed: Session {session_id} not found for user {user_id}.")
            return jsonify({"error": "Session not found"}), 404

        session_doc_ref.delete()

        # Update the user's overall metadata timestamp
        _update_user_metadata_timestamp(user_id)

        logger.info(f"[Firestore:Sessions] Session {session_id} deleted successfully by user {user_id}")
        return jsonify({"message": "Session deleted successfully"}), 200
    except Exception as e:
        logger.exception(f"[Firestore:Sessions] Error deleting session {session_id} for user {user_id}: {e}")
        return jsonify({"error": f"Server error deleting session: {str(e)}"}), 500


# Removed /api/sessions (GET list) - Handled by /api/user/data
# Removed /api/sessions/<id>/load - Handled by client cache
# Removed /api/sessions/<id>/transactions - Handled by client cache