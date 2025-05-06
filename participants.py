# participants.py
import logging
from flask import Blueprint, request, jsonify, g, current_app # Removed session
from werkzeug.utils import escape
# Removed database import
# from database import get_db

# Import Firestore client and FieldValue for array operations
from app import firestore_db # Assuming firestore_db is initialized in app.py
from firebase_admin import firestore

# Import the decorator
from auth_decorator import login_required

logger = logging.getLogger(__name__)

participants_bp = Blueprint('participants', __name__, url_prefix='/api/participants')

# Removed @participants_bp.before_request as decorator handles auth check per route

@participants_bp.route('', methods=['GET', 'POST', 'DELETE'])
@login_required # Apply decorator to protect the entire route
def handle_participants():
    # user_id is now available from the decorator via g.user_id
    user_id = g.user_id
    # Get Firestore document reference for the user
    user_doc_ref = firestore_db.collection('users').document(user_id)

    if request.method == 'POST':
        try:
            participant_name = request.json.get('name', '').strip()
            if not participant_name:
                logger.warning(f"[Firestore:Participants] Add attempt failed for user {user_id}: Participant name empty.")
                return jsonify({"error": "Participant name cannot be empty"}), 400

            safe_participant_name = escape(participant_name)
            logger.info(f"[Firestore:Participants] User {user_id} attempting to add participant: '{safe_participant_name}'")

            # Use a transaction or check-then-write (using update with ArrayUnion is atomic per field)
            user_doc = user_doc_ref.get()
            if user_doc.exists:
                current_participants = user_doc.to_dict().get('participants', [])
                if safe_participant_name in current_participants:
                    logger.warning(f"[Firestore:Participants] Add attempt failed for user {user_id}: Participant '{safe_participant_name}' already exists.")
                    return jsonify({"error": "Participant already exists"}), 400

            # Atomically add the participant to the array. Creates doc/field if needed.
            user_doc_ref.set({
                'participants': firestore.ArrayUnion([safe_participant_name])
            }, merge=True) # Use set with merge=True to create/update

            logger.info(f"[Firestore:Participants] Added participant '{safe_participant_name}' for user {user_id}")
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

            # Atomically remove the participant from the array
            user_doc_ref.update({
                'participants': firestore.ArrayRemove([safe_participant_name])
            })
            # Note: ArrayRemove doesn't throw error if item not found, it just does nothing.
            # We might want to check if it existed first if 404 is strictly needed.
            user_doc = user_doc_ref.get() # Re-fetch to check
            if user_doc.exists and safe_participant_name not in user_doc.to_dict().get('participants', []):
                 # This check happens *after* the update, so if it was removed, it won't be present.
                 # A better check might involve transactions or checking *before* the update.
                 # For simplicity, we'll assume success unless an exception occurs.
                 # If strict 404 needed: get doc -> check if exists -> update -> return success/404
                 pass # Assume it worked or didn't exist

            logger.info(f"[Firestore:Participants] Deleted participant '{safe_participant_name}' for user {user_id} (if existed)")
            # Since ArrayRemove doesn't fail on non-existence, return 200 OK
            return jsonify({"message": "Participant deleted successfully"}), 200

        except Exception as e:
            logger.exception(f"[Firestore:Participants] Error deleting participant for user {user_id}: {e}")
            return jsonify({"error": f"Server error deleting participant: {str(e)}"}), 500
    else: # GET
        try:
            logger.debug(f"[Firestore:Participants] Fetching participants for user {user_id}")
            user_doc = user_doc_ref.get()

            if user_doc.exists:
                participants_list = user_doc.to_dict().get('participants', [])
                logger.info(f"[Firestore:Participants] Found {len(participants_list)} participants for user {user_id}")
                # Sort alphabetically for consistent frontend display
                participants_list.sort()
                return jsonify(participants_list), 200
            else:
                # If the user document doesn't exist, they have no participants
                logger.info(f"[Firestore:Participants] No user document found for user {user_id}, returning empty list.")
                return jsonify([]), 200

        except Exception as e:
            logger.exception(f"[Firestore:Participants] Error retrieving participants for user {user_id}: {e}")
            return jsonify({"error": f"Server error retrieving participants: {str(e)}"}), 500