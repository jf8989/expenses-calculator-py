# auth_decorator.py
import logging
from functools import wraps
from flask import request, jsonify, g
from firebase_admin import auth

logger = logging.getLogger(__name__)

def login_required(f):
    '''Decorator to ensure user is authenticated via Firebase ID token.'''
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
            decoded_token = auth.verify_id_token(token)
            g.user_id = decoded_token['uid']
            g.user_email = decoded_token.get('email', None)
            logger.debug(f"Token verified for user: {g.user_id} accessing {request.endpoint}")
        except auth.ExpiredIdTokenError:
            logger.warning(f"Expired token received for endpoint: {request.endpoint}")
            return jsonify({"error": "Token has expired", "code": "TOKEN_EXPIRED"}), 401
        except auth.InvalidIdTokenError as e:
            logger.error(f"Invalid token received for endpoint: {request.endpoint}. Error: {e}")
            return jsonify({"error": "Invalid authentication token", "code": "TOKEN_INVALID"}), 401
        except Exception as e:
            logger.exception(f"Error verifying token for endpoint: {request.endpoint}")
            return jsonify({"error": "Could not verify authentication token", "code": "TOKEN_VERIFICATION_FAILED"}), 500

        return f(*args, **kwargs)
    return decorated_function