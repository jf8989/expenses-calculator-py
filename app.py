from flask import Flask, render_template, request, jsonify
import json

app = Flask(__name__)

# Cargar datos desde archivos JSON
def load_data(filename):
    try:
        with open(filename, 'r') as file:
            return json.load(file)
    except FileNotFoundError:
        return []

# Guardar datos en archivos JSON
def save_data(filename, data):
    with open(filename, 'w') as file:
        json.dump(data, file, indent=2)

# Rutas
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/transactions', methods=['GET', 'POST'])
def handle_transactions():
    if request.method == 'POST':
        transactions = request.json
        current_transactions = load_data('transactions.json')
        current_transactions.extend(transactions)
        save_data('transactions.json', current_transactions)
        return jsonify({"message": "Transacciones guardadas exitosamente"}), 200
    else:
        transactions = load_data('transactions.json')
        return jsonify(transactions), 200

@app.route('/api/participants', methods=['GET', 'POST', 'DELETE'])
def handle_participants():
    if request.method == 'POST':
        participant = request.json['name']
        participants = load_data('participants.json')
        if participant not in participants:
            participants.append(participant)
            save_data('participants.json', participants)
        return jsonify({"message": "Participante añadido"}), 200
    elif request.method == 'DELETE':
        participant = request.json['name']
        participants = load_data('participants.json')
        if participant in participants:
            participants.remove(participant)
            save_data('participants.json', participants)
        return jsonify({"message": "Participante eliminado"}), 200
    else:
        participants = load_data('participants.json')
        return jsonify(participants), 200

@app.route('/api/assign', methods=['POST'])
def assign_transaction():
    data = request.json
    transactions = load_data('transactions.json')
    for transaction in transactions:
        if transaction['date'] == data['date'] and transaction['description'] == data['description']:
            transaction['assigned_to'] = data['assigned_to']
    save_data('transactions.json', transactions)
    return jsonify({"message": "Asignación actualizada"}), 200

@app.route('/api/rules', methods=['GET', 'POST'])
def handle_rules():
    if request.method == 'POST':
        rules = request.json
        save_data('rules.json', rules)
        return jsonify({"message": "Reglas actualizadas"}), 200
    else:
        rules = load_data('rules.json')
        return jsonify(rules), 200

if __name__ == '__main__':
    app.run(debug=True)