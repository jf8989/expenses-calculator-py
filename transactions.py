# transactions.py
import logging
import re
from flask import Blueprint, request, jsonify, session, current_app
from werkzeug.utils import escape
from database import get_db

logger = logging.getLogger(__name__)

transactions_bp = Blueprint('transactions', __name__, url_prefix='/api')

@transactions_bp.before_request
def check_user_session():
    # Allow access to specific routes if needed without session, otherwise enforce
    # Example: if request.endpoint != 'transactions.some_public_route':
    if 'user_id' not in session:
        logger.warning(f"Unauthorized access attempt to transactions API endpoint: {request.endpoint}")
        return jsonify({"error": "No has iniciado sesión"}), 401

# --- Transaction Handling ---
@transactions_bp.route('/transactions', methods=['GET', 'POST'])
def handle_transactions():
    user_id = session['user_id']
    db = get_db()

    if request.method == 'POST':
        try:
            transactions_data = request.json
            if not isinstance(transactions_data, list):
                return jsonify({"error": "Invalid format: expected a list of transactions"}), 400

            current_app.logger.info(f"User {user_id} processing {len(transactions_data)} transactions")
            processed_ids = []

            for transaction in transactions_data:
                # Validate date format (DD/MM/YYYY)
                date_str = transaction.get('date', '')
                if not re.match(r'^\d{2}/\d{2}/\d{4}$', date_str):
                    return jsonify({"error": f"Invalid date format: {date_str}"}), 400

                # Validate description
                description = transaction.get('description', '').strip()
                if not description:
                    return jsonify({"error": "Description cannot be empty"}), 400

                # Validate amount is a number
                amount = transaction.get('amount')
                try:
                    amount_float = float(amount)
                    if amount_float == 0:
                         raise ValueError("Amount cannot be zero")
                except (ValueError, TypeError):
                    return jsonify({"error": f"Invalid amount: {amount}"}), 400

                # Sanitize inputs
                safe_description = escape(description)

                # Convert assigned_to list to string
                assigned_to_list = transaction.get('assigned_to', [])
                assigned_to_str = ', '.join(escape(p.strip()) for p in assigned_to_list if isinstance(p, str) and p.strip()) if isinstance(assigned_to_list, list) else ''

                # Get currency or default to empty string
                currency = escape(transaction.get('currency', '').strip())

                cursor = db.execute(
                    'INSERT INTO transactions (user_id, date, description, amount, currency, assigned_to) VALUES (?, ?, ?, ?, ?, ?)',
                    (user_id, date_str, safe_description, amount_float, currency, assigned_to_str)
                )
                processed_ids.append(cursor.lastrowid)

            db.commit()
            current_app.logger.info(f"User {user_id} saved {len(processed_ids)} transactions successfully")
            # Optionally return the IDs of the created transactions
            return jsonify({"message": "Transactions saved successfully", "ids": processed_ids}), 201 # Use 201 for creation
        except Exception as e:
            db.rollback()
            current_app.logger.error(f"Error processing transactions for user {user_id}: {str(e)}")
            return jsonify({"error": f"Server error processing transactions: {str(e)}"}), 500
    else: # GET
        try:
            transactions = db.execute(
                'SELECT id, date, description, amount, currency, assigned_to FROM transactions WHERE user_id = ? ORDER BY date DESC, id DESC', # Consider a default sort order
                (user_id,)
            ).fetchall()
            # Convert assigned_to string back to list for the frontend
            result = []
            for t in transactions:
                t_dict = dict(t)
                t_dict['assigned_to'] = [p.strip() for p in t_dict['assigned_to'].split(',') if p.strip()] if t_dict['assigned_to'] else []
                result.append(t_dict)
            return jsonify(result), 200
        except Exception as e:
            current_app.logger.error(f"Error retrieving transactions for user {user_id}: {str(e)}")
            return jsonify({"error": f"Error retrieving transactions: {str(e)}"}), 500

@transactions_bp.route('/transactions/<int:transaction_id>', methods=['DELETE'])
def delete_transaction(transaction_id):
    user_id = session['user_id']
    db = get_db()
    try:
        result = db.execute('DELETE FROM transactions WHERE id = ? AND user_id = ?', (transaction_id, user_id))
        db.commit()

        if result.rowcount == 0:
            current_app.logger.warning(f"Attempt to delete non-existent or unauthorized transaction {transaction_id} by user {user_id}")
            return jsonify({"error": "Transaction not found or access denied"}), 404

        current_app.logger.info(f"Transaction {transaction_id} deleted successfully by user {user_id}")
        return jsonify({"message": "Transaction deleted successfully"}), 200
    except Exception as e:
        db.rollback()
        current_app.logger.error(f"Error deleting transaction {transaction_id} for user {user_id}: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@transactions_bp.route('/transactions/all', methods=['DELETE'])
def delete_all_transactions():
    user_id = session['user_id']
    db = get_db()
    try:
        result = db.execute('DELETE FROM transactions WHERE user_id = ?', (user_id,))
        db.commit()
        current_app.logger.info(f"All transactions deleted for user {user_id}, count: {result.rowcount}")
        return jsonify({"message": f"All transactions have been deleted ({result.rowcount})"}), 200
    except Exception as e:
        db.rollback()
        current_app.logger.error(f"Error deleting all transactions for user {user_id}: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500

# --- Assignment Handling ---
@transactions_bp.route('/assign', methods=['POST'])
def assign_transaction():
    user_id = session['user_id']
    db = get_db()
    try:
        data = request.json
        transaction_id = data.get('transaction_id')
        assigned_to_list = data.get('assigned_to')

        if transaction_id is None or assigned_to_list is None:
             current_app.logger.error(f"Missing transaction_id or assigned_to in /api/assign request for user {user_id}. Data: {data}")
             return jsonify({"error": "Missing required fields (transaction_id, assigned_to)"}), 400

        if not isinstance(transaction_id, int):
             current_app.logger.error(f"Invalid transaction_id type in /api/assign request for user {user_id}. ID: {transaction_id}")
             return jsonify({"error": "Invalid transaction ID"}), 400

        if not isinstance(assigned_to_list, list):
            current_app.logger.error(f"Invalid assigned_to type (expected list) in /api/assign request for user {user_id}. Data: {assigned_to_list}")
            return jsonify({"error": "assigned_to must be a list"}), 400

        # Sanitize and prepare assigned_to string
        safe_participants = [escape(p.strip()) for p in assigned_to_list if isinstance(p, str) and p.strip()]
        assigned_to_str = ', '.join(safe_participants)

        result = db.execute(
            'UPDATE transactions SET assigned_to = ? WHERE user_id = ? AND id = ?',
            (assigned_to_str, user_id, transaction_id)
        )
        db.commit()

        if result.rowcount == 0:
            # Check if the transaction ID exists at all for this user
            exists = db.execute('SELECT 1 FROM transactions WHERE id = ? AND user_id = ?', (transaction_id, user_id)).fetchone()
            if not exists:
                current_app.logger.warning(f"Attempt to assign non-existent transaction ID {transaction_id} for user {user_id}.")
                return jsonify({"error": "Transaction not found"}), 404
            else:
                # Row existed but wasn't updated (maybe data was the same?) - still log and return success.
                current_app.logger.info(f"Assignment for transaction ID {transaction_id} (User: {user_id}) resulted in no change.")
                # Or return a specific status? 200 is fine here.
                return jsonify({"message": "Assignment updated successfully (no change detected)"}), 200


        current_app.logger.info(f"Updated assignment for transaction ID {transaction_id} for user {user_id} to: {assigned_to_str}")
        return jsonify({"message": "Assignment updated successfully"}), 200
    except Exception as e:
        db.rollback()
        # Avoid logging potentially sensitive data like assigned_to_list directly in production errors if possible
        current_app.logger.error(f"Error updating assignment for transaction ID {transaction_id} (User: {user_id}): {str(e)}")
        return jsonify({"error": f"Server error updating assignment: {str(e)}"}), 500

@transactions_bp.route('/transactions/unassign-all', methods=['POST'])
def unassign_all_participants():
    user_id = session['user_id']
    db = get_db()
    try:
        # Set assigned_to to empty string or NULL based on schema definition
        # Assuming empty string is preferred over NULL based on other code parts
        result = db.execute("UPDATE transactions SET assigned_to = '' WHERE user_id = ?", (user_id,))
        db.commit()
        current_app.logger.info(f"All participants unassigned for user {user_id}, count: {result.rowcount}")
        return jsonify({"message": "All participants have been unassigned from all transactions"}), 200
    except Exception as e:
        db.rollback()
        current_app.logger.error(f"Error unassigning all participants for user {user_id}: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@transactions_bp.route('/assignment-history', methods=['GET'])
def get_assignment_history():
    user_id = session['user_id']
    db = get_db()
    try:
        # Select distinct descriptions and their most common non-empty assignment
        # This query might need refinement depending on the exact desired behavior
        # A simpler approach: return all non-empty assignments
        history = db.execute(
            """
            SELECT description, assigned_to
            FROM transactions
            WHERE user_id = ? AND assigned_to IS NOT NULL AND assigned_to != ''
            ORDER BY id DESC -- Get recent assignments first
            """,
            (user_id,)
        ).fetchall()

        # Process to get unique description -> assignment mapping (e.g., most recent)
        processed_history = {}
        for row in history:
            if row['description'] not in processed_history:
                 # Convert string back to list for consistency
                 assigned_list = [p.strip() for p in row['assigned_to'].split(',') if p.strip()]
                 if assigned_list: # Only add if there are actual participants
                    processed_history[row['description']] = assigned_list

        # Return as a list of objects if needed by frontend, or just the dict
        # Example: return jsonify([{"description": k, "assigned_to": v} for k, v in processed_history.items()])
        return jsonify(processed_history), 200 # Returning a dict might be more useful {description: [participants]}
    except Exception as e:
        current_app.logger.error(f"Error retrieving assignment history for user {user_id}: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500

# --- Currency and Amount Updates ---
@transactions_bp.route('/update_transaction_currency', methods=['POST'])
def update_transaction_currency():
    user_id = session['user_id']
    db = get_db()
    try:
        data = request.json
        transaction_id = data.get('transactionId')
        new_currency = escape(data.get('currency', '').strip()) # Sanitize

        if not transaction_id:
            return jsonify({"error": "Transaction ID required"}), 400
        # Allow empty currency string if needed? Assuming it's valid.
        # if not new_currency:
        #     return jsonify({"error": "New currency required"}), 400

        try:
            transaction_id = int(transaction_id)
        except ValueError:
            return jsonify({"error": "Invalid transaction ID"}), 400

        result = db.execute(
            'UPDATE transactions SET currency = ? WHERE id = ? AND user_id = ?',
            (new_currency, transaction_id, user_id)
        )
        db.commit()

        if result.rowcount == 0:
            exists = db.execute('SELECT 1 FROM transactions WHERE id = ? AND user_id = ?', (transaction_id, user_id)).fetchone()
            if not exists:
                current_app.logger.warning(f"Attempt to update currency for non-existent transaction {transaction_id} by user {user_id}")
                return jsonify({"error": "Transaction not found"}), 404
            else:
                 current_app.logger.info(f"Currency update for transaction {transaction_id} (User: {user_id}) resulted in no change.")
                 return jsonify({"message": "Currency updated successfully (no change detected)"}), 200


        current_app.logger.info(f"Updated currency for transaction {transaction_id} to '{new_currency}' for user {user_id}")
        return jsonify({"message": "Currency updated successfully"}), 200
    except Exception as e:
        db.rollback()
        current_app.logger.error(f"Error updating transaction currency for {transaction_id} (User: {user_id}): {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@transactions_bp.route('/transactions/<int:transaction_id>/update_amount', methods=['POST'])
def update_transaction_amount(transaction_id):
    user_id = session['user_id']
    db = get_db()
    try:
        data = request.json
        new_amount_str = data.get('amount')

        if new_amount_str is None:
            return jsonify({"error": "New amount is required"}), 400

        try:
            new_amount = float(new_amount_str)
            # Add validation if amount cannot be zero or negative if needed
            # if new_amount <= 0:
            #     return jsonify({"error": "Amount must be positive"}), 400
        except (ValueError, TypeError):
            return jsonify({"error": "Invalid amount format"}), 400

        result = db.execute(
            'UPDATE transactions SET amount = ? WHERE id = ? AND user_id = ?',
            (new_amount, transaction_id, user_id)
        )
        db.commit()

        if result.rowcount == 0:
            exists = db.execute('SELECT 1 FROM transactions WHERE id = ? AND user_id = ?', (transaction_id, user_id)).fetchone()
            if not exists:
                current_app.logger.warning(f"Attempt to update amount for non-existent transaction {transaction_id} by user {user_id}")
                return jsonify({"error": "Transaction not found or access denied"}), 404
            else:
                current_app.logger.info(f"Amount update for transaction {transaction_id} (User: {user_id}) resulted in no change.")
                return jsonify({"message": "Amount updated successfully (no change detected)", "new_amount": new_amount}), 200


        current_app.logger.info(f"User {user_id} updated amount for transaction {transaction_id} to {new_amount}")
        return jsonify({"message": "Amount updated successfully", "new_amount": new_amount}), 200

    except Exception as e:
        db.rollback()
        current_app.logger.error(f"Error updating amount for transaction {transaction_id} (User: {user_id}): {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500