import sqlite3
from flask import Flask, session, request, jsonify, g, render_template
from flask_session import Session
import os

app = Flask(__name__)
app.secret_key = os.urandom(24)  # Clave secreta para las sesiones
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)

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
        db.commit()

# Rutas de la aplicación

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['POST'])
def login():
    user_id = request.json['user_id']
    session['user_id'] = user_id
    return jsonify({"message": "Sesión iniciada"}), 200

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    return jsonify({"message": "Sesión cerrada"}), 200

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
        return jsonify({"error": "No has iniciado sesión"}), 401

    user_id = session['user_id']
    db = get_db()

    if request.method == 'POST':
        transactions = request.json
        for transaction in transactions:
            db.execute('INSERT INTO transactions (user_id, date, description, amount) VALUES (?, ?, ?, ?)',
                       (user_id, transaction['date'], transaction['description'], transaction['amount']))
        db.commit()
        return jsonify({"message": "Transacciones guardadas exitosamente"}), 200
    else:
        transactions = db.execute('SELECT * FROM transactions WHERE user_id = ?', (user_id,)).fetchall()
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

if __name__ == '__main__':
    init_db()
    app.run(debug=True)