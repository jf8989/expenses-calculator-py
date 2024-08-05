# app.py

import sqlite3
from flask import Flask, session, request, jsonify, g, render_template
from flask_session import Session
import os
from werkzeug.security import generate_password_hash, check_password_hash
from auth import auth  # Import the auth blueprint

app = Flask(__name__)
app.secret_key = os.urandom(24)  # Clave secreta para las sesiones
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)

# Register the auth blueprint
app.register_blueprint(auth, url_prefix='/auth')

# Configuración de la base de datos SQLite
DATABASE = 'expense_sharing.db'

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row  # Esto permite acceder a las columnas por nombre
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def init_db():
    with app.app_context():
        db = get_db()
        with app.open_resource('schema.sql', mode='r') as f:
            db.cursor().executescript(f.read())
        
        # Verificar si la columna 'currency' existe, si no, agregarla
        cursor = db.cursor()
        cursor.execute("PRAGMA table_info(transactions)")
        columns = [column[1] for column in cursor.fetchall()]
        if 'currency' not in columns:
            cursor.execute('ALTER TABLE transactions ADD COLUMN currency TEXT')
        
        db.commit()

# Rutas de autenticación

@app.route('/register', methods=['POST'])
def register():
    email = request.json['email']
    password = request.json['password']
    db = get_db()
    
    # Verificar si el correo ya está registrado
    if db.execute('SELECT id FROM users WHERE email = ?', (email,)).fetchone() is not None:
        return jsonify({"error": "El correo electrónico ya está registrado"}), 400
    
    # Crear nuevo usuario
    db.execute(
        'INSERT INTO users (email, password_hash) VALUES (?, ?)',
        (email, generate_password_hash(password))
    )
    db.commit()
    
    return jsonify({"message": "Usuario registrado exitosamente"}), 201

@app.route('/login', methods=['POST'])
def login():
    email = request.json['email']
    password = request.json['password']
    db = get_db()
    
    user = db.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
    
    if user is None or not check_password_hash(user['password_hash'], password):
        return jsonify({"error": "Correo o contraseña incorrectos"}), 401
    
    session.clear()
    session['user_id'] = user['id']
    
    return jsonify({"message": "Sesión iniciada exitosamente"}), 200

@app.route('/logout')
def logout():
    session.clear()
    return jsonify({"message": "Sesión cerrada exitosamente"}), 200

@app.route('/user')
def get_user():
    user_id = session.get('user_id')
    if user_id is None:
        return jsonify({"error": "No has iniciado sesión"}), 401
    
    db = get_db()
    user = db.execute('SELECT id, email FROM users WHERE id = ?', (user_id,)).fetchone()
    return jsonify({"id": user['id'], "email": user['email']}), 200

# Rutas de la aplicación

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/participants', methods=['GET', 'POST', 'DELETE'])
def handle_participants():
    if 'user_id' not in session:
        return jsonify({"error": "No has iniciado sesión"}), 401

    user_id = session['user_id']
    db = get_db()

    if request.method == 'POST':
        participant = request.json['name']
        db.execute('INSERT INTO participants (user_id, name) VALUES (?, ?)', (user_id, participant))
        db.commit()
        return jsonify({"message": "Participante añadido"}), 200
    elif request.method == 'DELETE':
        participant = request.json['name']
        db.execute('DELETE FROM participants WHERE user_id = ? AND name = ?', (user_id, participant))
        db.commit()
        return jsonify({"message": "Participante eliminado"}), 200
    else:
        participants = db.execute('SELECT name FROM participants WHERE user_id = ?', (user_id,)).fetchall()
        return jsonify([p['name'] for p in participants]), 200

@app.route('/api/transactions', methods=['GET', 'POST'])
def handle_transactions():
    if 'user_id' not in session:
        app.logger.error("Intento de acceso sin sesión iniciada")
        return jsonify({"error": "No has iniciado sesión"}), 401

    user_id = session['user_id']
    db = get_db()

    if request.method == 'POST':
        try:
            transactions = request.json
            app.logger.info(f"Recibidas {len(transactions)} transacciones para procesar")
            for transaction in transactions:
                # Convertir la lista assigned_to a una cadena
                assigned_to = ','.join(transaction.get('assigned_to', [])) if isinstance(transaction.get('assigned_to'), list) else transaction.get('assigned_to', '')
                
                db.execute('INSERT INTO transactions (user_id, date, description, amount, currency, assigned_to) VALUES (?, ?, ?, ?, ?, ?)',
                           (user_id, transaction['date'], transaction['description'], transaction['amount'], transaction.get('currency', ''), assigned_to))
            db.commit()
            app.logger.info("Transacciones guardadas exitosamente")
            return jsonify({"message": "Transacciones guardadas exitosamente"}), 200
        except Exception as e:
            app.logger.error(f"Error al procesar transacciones: {str(e)}")
            return jsonify({"error": str(e)}), 500
    else:
        transactions = db.execute('SELECT id, date, description, amount, currency, assigned_to FROM transactions WHERE user_id = ?', (user_id,)).fetchall()
        return jsonify([dict(t) for t in transactions]), 200

@app.route('/api/assign', methods=['POST'])
def assign_transaction():
    if 'user_id' not in session:
        return jsonify({"error": "No has iniciado sesión"}), 401

    user_id = session['user_id']
    data = request.json
    db = get_db()

    db.execute('UPDATE transactions SET assigned_to = ? WHERE user_id = ? AND date = ? AND description = ?',
               (', '.join(data['assigned_to']), user_id, data['date'], data['description']))
    db.commit()
    return jsonify({"message": "Asignación actualizada"}), 200

@app.route('/api/transactions/all', methods=['DELETE'])
def delete_all_transactions():
    db = get_db()
    db.execute('DELETE FROM transactions')
    db.commit()
    return jsonify({"message": "Todas las transacciones han sido eliminadas"}), 200

@app.route('/api/transactions/unassign-all', methods=['POST'])
def unassign_all_participants():
    db = get_db()
    db.execute('UPDATE transactions SET assigned_to = NULL')
    db.commit()
    return jsonify({"message": "Todos los participantes han sido desasignados de todas las transacciones"}), 200

@app.route('/api/assignment-history', methods=['GET'])
def get_assignment_history():
    db = get_db()
    history = db.execute('SELECT description, assigned_to FROM transactions WHERE assigned_to IS NOT NULL').fetchall()
    return jsonify([dict(row) for row in history]), 200

@app.route('/api/update_transaction_currency', methods=['POST'])
def update_transaction_currency():
    if 'user_id' not in session:
        return jsonify({"error": "No has iniciado sesión"}), 401

    data = request.json
    transaction_id = data.get('transactionId')
    new_currency = data.get('currency')

    if not transaction_id or not new_currency:
        return jsonify({"error": "Datos incompletos"}), 400

    db = get_db()
    db.execute('UPDATE transactions SET currency = ? WHERE id = ? AND user_id = ?',
               (new_currency, transaction_id, session['user_id']))
    db.commit()

    return jsonify({"message": "Divisa actualizada exitosamente"}), 200

@app.route('/api/transactions/<int:transaction_id>', methods=['DELETE'])
def delete_transaction(transaction_id):
    if 'user_id' not in session:
        return jsonify({"error": "No has iniciado sesión"}), 401

    user_id = session['user_id']
    db = get_db()

    try:
        db.execute('DELETE FROM transactions WHERE id = ? AND user_id = ?', (transaction_id, user_id))
        db.commit()
        return jsonify({"message": "Transacción eliminada exitosamente"}), 200
    except Exception as e:
        db.rollback()
        app.logger.error(f"Error al eliminar la transacción: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    init_db()
    app.run(debug=True)