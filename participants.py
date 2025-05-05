# participants.py
import logging
from flask import Blueprint, request, jsonify, session, current_app
from werkzeug.utils import escape
from database import get_db

# Use current_app.logger instead of app.logger within blueprints
logger = logging.getLogger(__name__) 

participants_bp = Blueprint('participants', __name__, url_prefix='/api/participants')

@participants_bp.before_request
def check_user_session():
    if 'user_id' not in session:
        logger.warning("Unauthorized access attempt to participants API")
        return jsonify({"error": "No has iniciado sesión"}), 401

@participants_bp.route('', methods=['GET', 'POST', 'DELETE'])
def handle_participants():
    user_id = session['user_id']
    db = get_db()

    if request.method == 'POST':
        try:
            participant = request.json.get('name', '').strip()
            if not participant:
                return jsonify({"error": "Participant name cannot be empty"}), 400

            # Check if participant already exists
            existing = db.execute('SELECT id FROM participants WHERE user_id = ? AND name = ?',
                                 (user_id, participant)).fetchone()
            if existing:
                return jsonify({"error": "Participant already exists"}), 400

            db.execute('INSERT INTO participants (user_id, name) VALUES (?, ?)',
                      (user_id, escape(participant)))
            db.commit()
            current_app.logger.info(f"Added participant '{participant}' for user {user_id}")
            return jsonify({"message": "Participant added successfully"}), 201 # Use 201 for creation
        except Exception as e:
            current_app.logger.error(f"Error adding participant for user {user_id}: {str(e)}")
            return jsonify({"error": f"Error adding participant: {str(e)}"}), 500

    elif request.method == 'DELETE':
        try:
            participant = request.json.get('name', '').strip()
            if not participant:
                return jsonify({"error": "Participant name cannot be empty"}), 400

            result = db.execute('DELETE FROM participants WHERE user_id = ? AND name = ?',
                      (user_id, participant))
            db.commit()
            if result.rowcount == 0:
                 current_app.logger.warning(f"Attempted to delete non-existent participant '{participant}' for user {user_id}")
                 return jsonify({"error": "Participant not found"}), 404
            current_app.logger.info(f"Deleted participant '{participant}' for user {user_id}")
            return jsonify({"message": "Participant deleted successfully"}), 200
        except Exception as e:
            current_app.logger.error(f"Error deleting participant for user {user_id}: {str(e)}")
            return jsonify({"error": f"Error deleting participant: {str(e)}"}), 500
    else: # GET
        try:
            participants = db.execute('SELECT name FROM participants WHERE user_id = ? ORDER BY name',
                                    (user_id,)).fetchall()
            return jsonify([p['name'] for p in participants]), 200
        except Exception as e:
            current_app.logger.error(f"Error retrieving participants for user {user_id}: {str(e)}")
            return jsonify({"error": f"Error retrieving participants: {str(e)}"}), 500