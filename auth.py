# auth.py

from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from app import get_db  # Importamos get_db directamente de app.py

auth = Blueprint('auth', __name__)

@auth.route('/register', methods=['POST'])
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

@auth.route('/login', methods=['POST'])
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

@auth.route('/logout')
def logout():
    session.clear()
    return jsonify({"message": "Sesión cerrada exitosamente"}), 200

@auth.route('/user')
def get_user():
    user_id = session.get('user_id')
    if user_id is None:
        return jsonify({"error": "No has iniciado sesión"}), 401
    
    db = get_db()
    user = db.execute('SELECT id, email FROM users WHERE id = ?', (user_id,)).fetchone()
    return jsonify({"id": user['id'], "email": user['email']}), 200