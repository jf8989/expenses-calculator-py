from flask import Flask, render_template, request, jsonify
import json

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/transactions', methods=['GET', 'POST'])
def handle_transactions():
    if request.method == 'POST':
        transactions = request.json
        # Aquí iría la lógica para procesar y guardar las transacciones
        return jsonify({"message": "Transacciones recibidas"}), 200
    else:
        # Aquí iría la lógica para recuperar las transacciones
        return jsonify([]), 200

@app.route('/api/participants', methods=['GET', 'POST'])
def handle_participants():
    if request.method == 'POST':
        participant = request.json
        # Aquí iría la lógica para añadir un nuevo participante
        return jsonify({"message": "Participante añadido"}), 200
    else:
        # Aquí iría la lógica para recuperar los participantes
        return jsonify(["Yo", "Natalia", "Primo Natalia"]), 200

if __name__ == '__main__':
    app.run(debug=True)