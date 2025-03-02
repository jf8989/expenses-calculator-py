# app.py

from flask import Flask, session, request, jsonify, g, render_template
from flask_session import Session
import os
import re
import logging
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import escape
from database import get_db, close_connection, init_db, DATABASE
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("app.log"),
        logging.StreamHandler()
    ]
)

app = Flask(__name__)
app.secret_key = os.urandom(24)  # Secret key for sessions
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = True  # Make sessions permanent
app.config['PERMANENT_SESSION_LIFETIME'] = 86400 * 30  # 30 days
Session(app)

# Register the teardown function
@app.teardown_appcontext
def close_db_connection(exception):
    close_connection(exception)

# Register the auth blueprint
from auth import auth
app.register_blueprint(auth)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/participants', methods=['GET', 'POST', 'DELETE'])
def handle_participants():
    if 'user_id' not in session:
        app.logger.warning("Unauthorized access attempt to participants API")
        return jsonify({"error": "No has iniciado sesión"}), 401

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
            app.logger.info(f"Added participant '{participant}' for user {user_id}")
            return jsonify({"message": "Participant added successfully"}), 200
        except Exception as e:
            app.logger.error(f"Error adding participant: {str(e)}")
            return jsonify({"error": f"Error adding participant: {str(e)}"}), 500
            
    elif request.method == 'DELETE':
        try:
            participant = request.json.get('name', '').strip()
            if not participant:
                return jsonify({"error": "Participant name cannot be empty"}), 400
                
            db.execute('DELETE FROM participants WHERE user_id = ? AND name = ?', 
                      (user_id, participant))
            db.commit()
            app.logger.info(f"Deleted participant '{participant}' for user {user_id}")
            return jsonify({"message": "Participant deleted successfully"}), 200
        except Exception as e:
            app.logger.error(f"Error deleting participant: {str(e)}")
            return jsonify({"error": f"Error deleting participant: {str(e)}"}), 500
    else:
        try:
            participants = db.execute('SELECT name FROM participants WHERE user_id = ?', 
                                    (user_id,)).fetchall()
            return jsonify([p['name'] for p in participants]), 200
        except Exception as e:
            app.logger.error(f"Error retrieving participants: {str(e)}")
            return jsonify({"error": f"Error retrieving participants: {str(e)}"}), 500

@app.route('/api/transactions', methods=['GET', 'POST'])
def handle_transactions():
    if 'user_id' not in session:
        app.logger.error("Attempted access without login")
        return jsonify({"error": "No has iniciado sesión"}), 401

    user_id = session['user_id']
    db = get_db()

    if request.method == 'POST':
        try:
            transactions = request.json
            if not isinstance(transactions, list):
                return jsonify({"error": "Invalid format: expected a list of transactions"}), 400
                
            app.logger.info(f"Received {len(transactions)} transactions for processing")
            
            for transaction in transactions:
                # Validate date format (DD/MM/YYYY)
                if not re.match(r'^\d{2}/\d{2}/\d{4}$', transaction.get('date', '')):
                    return jsonify({"error": f"Invalid date format: {transaction.get('date', 'empty')}"}), 400
                
                # Validate description
                description = transaction.get('description', '').strip()
                if not description:
                    return jsonify({"error": "Description cannot be empty"}), 400
                
                # Validate amount is a number
                amount = transaction.get('amount')
                if not isinstance(amount, (int, float)) or amount == 0:
                    return jsonify({"error": f"Invalid amount: {amount}"}), 400
                
                # Sanitize inputs
                safe_description = escape(description)
                
                # Convert assigned_to list to string
                assigned_to = ','.join(transaction.get('assigned_to', [])) if isinstance(transaction.get('assigned_to'), list) else transaction.get('assigned_to', '')
                
                # Get currency or default to empty string
                currency = transaction.get('currency', '')
                
                db.execute(
                    'INSERT INTO transactions (user_id, date, description, amount, currency, assigned_to) VALUES (?, ?, ?, ?, ?, ?)',
                    (user_id, transaction['date'], safe_description, amount, currency, assigned_to)
                )
            
            db.commit()
            app.logger.info("Transactions saved successfully")
            return jsonify({"message": "Transactions saved successfully"}), 200
        except Exception as e:
            app.logger.error(f"Error processing transactions: {str(e)}")
            return jsonify({"error": str(e)}), 500
    else:
        try:
            transactions = db.execute(
                'SELECT id, date, description, amount, currency, assigned_to FROM transactions WHERE user_id = ? ORDER BY date',
                (user_id,)
            ).fetchall()
            return jsonify([dict(t) for t in transactions]), 200
        except Exception as e:
            app.logger.error(f"Error retrieving transactions: {str(e)}")
            return jsonify({"error": str(e)}), 500

@app.route('/api/assign', methods=['POST'])
def assign_transaction():
    if 'user_id' not in session:
        return jsonify({"error": "No has iniciado sesión"}), 401

    user_id = session['user_id']
    try:
        data = request.json
        if not data or 'date' not in data or 'description' not in data or 'assigned_to' not in data:
            return jsonify({"error": "Missing required fields"}), 400
            
        # Validate assigned_to is a list
        if not isinstance(data['assigned_to'], list):
            return jsonify({"error": "assigned_to must be a list"}), 400
            
        # Sanitize inputs
        date = data['date'].strip()
        description = escape(data['description'].strip())
        assigned_to = ', '.join(data['assigned_to'])
        
        db = get_db()
        result = db.execute(
            'UPDATE transactions SET assigned_to = ? WHERE user_id = ? AND date = ? AND description = ?',
            (assigned_to, user_id, date, description)
        )
        db.commit()
        
        if result.rowcount == 0:
            app.logger.warning(f"No transaction found to update assignment: {date}, {description}")
            return jsonify({"warning": "No transaction was updated"}), 200
            
        app.logger.info(f"Updated assignment for transaction: {date}, {description}")
        return jsonify({"message": "Assignment updated successfully"}), 200
    except Exception as e:
        app.logger.error(f"Error updating assignment: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/transactions/all', methods=['DELETE'])
def delete_all_transactions():
    if 'user_id' not in session:
        return jsonify({"error": "No has iniciado sesión"}), 401
        
    try:
        user_id = session['user_id']
        db = get_db()
        result = db.execute('DELETE FROM transactions WHERE user_id = ?', (user_id,))
        db.commit()
        app.logger.info(f"All transactions deleted for user {user_id}, count: {result.rowcount}")
        return jsonify({"message": f"All transactions have been deleted ({result.rowcount})"}), 200
    except Exception as e:
        app.logger.error(f"Error deleting all transactions: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/transactions/unassign-all', methods=['POST'])
def unassign_all_participants():
    if 'user_id' not in session:
        return jsonify({"error": "No has iniciado sesión"}), 401
        
    try:
        user_id = session['user_id']
        db = get_db()
        result = db.execute('UPDATE transactions SET assigned_to = NULL WHERE user_id = ?', (user_id,))
        db.commit()
        app.logger.info(f"All participants unassigned for user {user_id}, count: {result.rowcount}")
        return jsonify({"message": "All participants have been unassigned from all transactions"}), 200
    except Exception as e:
        app.logger.error(f"Error unassigning all participants: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/assignment-history', methods=['GET'])
def get_assignment_history():
    if 'user_id' not in session:
        return jsonify({"error": "No has iniciado sesión"}), 401
        
    try:
        user_id = session['user_id']
        db = get_db()
        history = db.execute(
            'SELECT description, assigned_to FROM transactions WHERE assigned_to IS NOT NULL AND user_id = ?', 
            (user_id,)
        ).fetchall()
        return jsonify([dict(row) for row in history]), 200
    except Exception as e:
        app.logger.error(f"Error retrieving assignment history: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/update_transaction_currency', methods=['POST'])
def update_transaction_currency():
    if 'user_id' not in session:
        return jsonify({"error": "No has iniciado sesión"}), 401

    try:
        data = request.json
        transaction_id = data.get('transactionId')
        new_currency = data.get('currency', '').strip()

        if not transaction_id or not new_currency:
            return jsonify({"error": "Incomplete data"}), 400
            
        # Validate transaction_id is an integer
        try:
            transaction_id = int(transaction_id)
        except ValueError:
            return jsonify({"error": "Invalid transaction ID"}), 400

        db = get_db()
        # First check if transaction belongs to this user
        transaction = db.execute(
            'SELECT id FROM transactions WHERE id = ? AND user_id = ?',
            (transaction_id, session['user_id'])
        ).fetchone()
        
        if not transaction:
            return jsonify({"error": "Transaction not found or not owned by current user"}), 404
            
        # Update the currency
        db.execute(
            'UPDATE transactions SET currency = ? WHERE id = ?',
            (new_currency, transaction_id)
        )
        db.commit()
        
        app.logger.info(f"Updated currency for transaction {transaction_id} to {new_currency}")
        return jsonify({"message": "Currency updated successfully"}), 200
    except Exception as e:
        app.logger.error(f"Error updating transaction currency: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/transactions/<int:transaction_id>', methods=['DELETE'])
def delete_transaction(transaction_id):
    if 'user_id' not in session:
        return jsonify({"error": "No has iniciado sesión"}), 401

    try:
        user_id = session['user_id']
        db = get_db()
        
        # First check if transaction exists and belongs to this user
        transaction = db.execute(
            'SELECT id FROM transactions WHERE id = ? AND user_id = ?',
            (transaction_id, user_id)
        ).fetchone()
        
        if not transaction:
            return jsonify({"error": "Transaction not found or not owned by current user"}), 404
            
        db.execute('DELETE FROM transactions WHERE id = ?', (transaction_id,))
        db.commit()
        
        app.logger.info(f"Transaction {transaction_id} deleted successfully")
        return jsonify({"message": "Transaction deleted successfully"}), 200
    except Exception as e:
        db.rollback()
        app.logger.error(f"Error deleting transaction: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.errorhandler(404)
def page_not_found(e):
    return jsonify({"error": "The requested resource was not found"}), 404

@app.errorhandler(500)
def internal_server_error(e):
    app.logger.error(f"Internal server error: {str(e)}")
    return jsonify({"error": "An internal server error occurred"}), 500

@app.route('/api/sessions', methods=['GET', 'POST', 'DELETE'])
def handle_sessions():
    if 'user_id' not in session:
        return jsonify({"error": "No has iniciado sesión"}), 401
        
    user_id = session['user_id']
    db = get_db()
    
    if request.method == 'POST':
        # Save current state as a session
        try:
            # Enable foreign keys
            db.execute("PRAGMA foreign_keys = ON")
            
            # Start transaction explicitly
            db.execute("BEGIN TRANSACTION")
            
            data = request.json
            name = data.get('name', '').strip()
            description = data.get('description', '').strip()
            
            if not name:
                today = datetime.now().strftime('%Y-%m-%d')
                name = f"Session {today}"
            
            app.logger.info(f"Creating session: {name} for user_id: {user_id}")
                
            # Create the session record
            cursor = db.execute(
                'INSERT INTO sessions (user_id, name, description) VALUES (?, ?, ?)',
                (user_id, escape(name), escape(description))
            )
            session_id = cursor.lastrowid
            app.logger.info(f"Created session with ID: {session_id}")
            
            # Save the current transactions in the session_transactions table
            transactions = db.execute(
                'SELECT date, description, amount, currency, assigned_to FROM transactions WHERE user_id = ?',
                (user_id,)
            ).fetchall()
            
            app.logger.info(f"Found {len(transactions)} transactions to copy")
            
            for t in transactions:
                # Handle potential NULL values
                currency = t['currency'] if t['currency'] else ""
                assigned_to = t['assigned_to'] if t['assigned_to'] else ""
                
                db.execute(
                    'INSERT INTO session_transactions (session_id, date, description, amount, currency, assigned_to) VALUES (?, ?, ?, ?, ?, ?)',
                    (session_id, t['date'], t['description'], t['amount'], currency, assigned_to)
                )
            
            app.logger.info("Copied all transactions, committing...")
            db.execute("COMMIT")
            
            return jsonify({
                "id": session_id,
                "name": name,
                "created_at": datetime.now().isoformat(),
                "transaction_count": len(transactions)
            }), 201
                
        except Exception as e:
            db.execute("ROLLBACK")
            app.logger.error(f"Error saving session: {type(e).__name__}: {str(e)}")
            return jsonify({"error": f"Failed to save session: {str(e)}"}), 500
            
    elif request.method == 'DELETE':
        # Delete a session
        try:
            session_id = request.json.get('id')
            if not session_id:
                return jsonify({"error": "Session ID required"}), 400
                
            db.execute('DELETE FROM sessions WHERE id = ? AND user_id = ?', (session_id, user_id))
            db.commit()
            
            return jsonify({"message": "Session deleted successfully"}), 200
        except Exception as e:
            app.logger.error(f"Error deleting session: {str(e)}")
            return jsonify({"error": str(e)}), 500
    else:
        # GET - List all sessions
        try:
            sessions = db.execute(
                'SELECT id, name, description, created_at FROM sessions WHERE user_id = ? ORDER BY created_at DESC',
                (user_id,)
            ).fetchall()
            
            # Get transaction count for each session
            result = []
            for s in sessions:
                s_dict = dict(s)
                count = db.execute(
                    'SELECT COUNT(*) as count FROM session_transactions WHERE session_id = ?',
                    (s['id'],)
                ).fetchone()['count']
                s_dict['transaction_count'] = count
                result.append(s_dict)
                
            return jsonify(result), 200
        except Exception as e:
            app.logger.error(f"Error retrieving sessions: {str(e)}")
            return jsonify({"error": str(e)}), 500

@app.route('/api/sessions/<int:session_id>/load', methods=['POST'])
def load_session(session_id):
    if 'user_id' not in session:
        return jsonify({"error": "No has iniciado sesión"}), 401
        
    user_id = session['user_id']
    db = get_db()
    
    try:
        # Verify the session belongs to this user
        session_record = db.execute(
            'SELECT id, name, description, created_at FROM sessions WHERE id = ? AND user_id = ?',
            (session_id, user_id)
        ).fetchone()
        
        if not session_record:
            return jsonify({"error": "Session not found"}), 404
        
        # Clear existing transactions
        db.execute('DELETE FROM transactions WHERE user_id = ?', (user_id,))
        
        # Load session transactions into current transactions
        session_transactions = db.execute(
            'SELECT date, description, amount, currency, assigned_to FROM session_transactions WHERE session_id = ?',
            (session_id,)
        ).fetchall()
        
        for t in session_transactions:
            db.execute(
                'INSERT INTO transactions (user_id, date, description, amount, currency, assigned_to) VALUES (?, ?, ?, ?, ?, ?)',
                (user_id, t['date'], t['description'], t['amount'], t['currency'], t['assigned_to'])
            )
        
        db.commit()
        
        return jsonify({
            "message": "Session loaded successfully",
            "transaction_count": len(session_transactions)
        }), 200
    except Exception as e:
        db.rollback()
        app.logger.error(f"Error loading session: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    init_db(app)
    app.run(debug=True)
    
