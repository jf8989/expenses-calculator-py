# auth.py
import logging
from flask import Blueprint, jsonify, g, current_app # Removed request, session
from auth_decorator import login_required # Import from the new file

logger = logging.getLogger(__name__)

# Rename blueprint variable for clarity and consistency
auth_bp = Blueprint('auth', __name__)

# Removed /register, /login, /logout routes as they are handled by Firebase client-side SDK

# Example route: Get authenticated user's basic info (UID, email)
# This demonstrates using the decorator and accessing info from 'g'
@auth_bp.route('/api/user/me', methods=['GET'])
@login_required # Protect this route
def get_current_user_info():
    """
    Returns basic information about the currently authenticated user.
    Relies on the @login_required decorator to populate g.user_id and g.user_email.
    """
    if hasattr(g, 'user_id') and hasattr(g, 'user_email'):
        logger.info(f"Returning user info for user_id: {g.user_id}")
        return jsonify({
            "id": g.user_id,
            "email": g.user_email
        }), 200
    else:
        # This case should technically not be reached if @login_required works correctly
        logger.error("User info (g.user_id, g.user_email) not found in request context after @login_required.")
        return jsonify({"error": "Could not retrieve user information from token"}), 500