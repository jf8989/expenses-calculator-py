# participants.py
import logging
from flask import Blueprint, request, jsonify, g, current_app # Removed session
from werkzeug.utils import escape

# Import Firestore directly
from firebase_admin import firestore # REMOVED: from app import firestore_db

# Import the decorator
from auth_decorator import login_required

logger = logging.getLogger(__name__)

participants_bp = Blueprint('participants', __name__, url_prefix='/api/participants')

@participants_bp.route('', methods=['GET', 'POST', 'DELETE'])
@login_required # Apply decorator to protect the entire route
def handle_participants():
    # user_id is now available from the decorator via g.user_id
    user_id = g.user_id
    # Get Firestore client instance inside the function
    db = firestore.client()
    # Get Firestore document reference for the user
    user_doc_ref = db.collection('users').document(user_id) # Use db instead of firestore_db

    if request.method == 'POST':
        try:
            participant_name = request.json.get('name', '').strip()
            if not participant_name:
                logger.warning(f"[Firestore:Participants] Add attempt failed for user {user_id}: Participant name empty.")
                return jsonify({"error": "Participant name cannot be empty"}), 400

            safe_participant_name = escape(participant_name)
            logger.info(f"[Firestore:Participants] User {user_id} attempting to add participant: '{safe_participant_name}'")

            user_doc = user_doc_ref.get()
            if user_doc.exists:
                current_participants = user_doc.to_dict().get('participants', [])
                if safe_participant_name in current_participants:
                    logger.warning(f"[Firestore:Participants] Add attempt failed for user {user_id}: Participant '{safe_participant_name}' already exists.")
                    return jsonify({"error": "Participant already exists"}), 400

            user_doc_ref.set({
                'participants': firestore.ArrayUnion([safe_participant_name])
            }, merge=True)

            logger.info(f"[Firestore:Participants] Added participant '{safe_participant_name}' for user {user_id}")
            # Update metadata timestamp AFTER successful participant add
            _update_user_metadata_timestamp(user_id) # Call helper defined in sessions.py (or move helper)
            return jsonify({"message": "Participant added successfully"}), 201

        except Exception as e:
            logger.exception(f"[Firestore:Participants] Error adding participant for user {user_id}: {e}")
            return jsonify({"error": f"Server error adding participant: {str(e)}"}), 500

    elif request.method == 'DELETE':
        try:
            participant_name = request.json.get('name', '').strip()
            if not participant_name:
                 logger.warning(f"[Firestore:Participants] Delete attempt failed for user {user_id}: Participant name empty.")
                 return jsonify({"error": "Participant name cannot be empty"}), 400

            safe_participant_name = escape(participant_name)
            logger.info(f"[Firestore:Participants] User {user_id} attempting to delete participant: '{safe_participant_name}'")

            # Check if participant exists before attempting removal for accurate logging/response
            participant_existed = False
            user_doc = user_doc_ref.get()
            if user_doc.exists:
                current_participants = user_doc.to_dict().get('participants', [])
                if safe_participant_name in current_participants:
                    participant_existed = True

            if participant_existed:
                user_doc_ref.update({
                    'participants': firestore.ArrayRemove([safe_participant_name])
                })
                logger.info(f"[Firestore:Participants] Deleted participant '{safe_participant_name}' for user {user_id}")
                # Update metadata timestamp AFTER successful participant delete
                _update_user_metadata_timestamp(user_id) # Call helper defined in sessions.py (or move helper)
                return jsonify({"message": "Participant deleted successfully"}), 200
            else:
                 logger.warning(f"[Firestore:Participants] Delete attempt failed for user {user_id}: Participant '{safe_participant_name}' not found.")
                 return jsonify({"error": "Participant not found"}), 404


        except Exception as e:
            logger.exception(f"[Firestore:Participants] Error deleting participant for user {user_id}: {e}")
            return jsonify({"error": f"Server error deleting participant: {str(e)}"}), 500
    else: # GET
        try:
            logger.debug(f"[Firestore:Participants] Fetching participants for user {user_id}")
            user_doc = user_doc_ref.get(['participants']) # Fetch only participants field

            if user_doc.exists:
                participants_list = user_doc.to_dict().get('participants', [])
                logger.info(f"[Firestore:Participants] Found {len(participants_list)} participants for user {user_id}")
                participants_list.sort()
                return jsonify(participants_list), 200
            else:
                logger.info(f"[Firestore:Participants] No user document found for user {user_id}, returning empty list.")
                return jsonify([]), 200

        except Exception as e:
            logger.exception(f"[Firestore:Participants] Error retrieving participants for user {user_id}: {e}")
            return jsonify({"error": f"Server error retrieving participants: {str(e)}"}), 500

# NOTE: This relies on _update_user_metadata_timestamp being available.
# It's currently defined in sessions.py. For cleaner separation, this helper
# function should ideally be moved to a shared utility file (e.g., utils/firestore_utils.py)
# and imported by both participants.py and sessions.py.
# For now, assuming sessions.py is imported by app.py before participants.py might work,
# but moving the helper is the robust solution. Let's import it directly for now.
from sessions import _update_user_metadata_timestamp