import PySimpleGUI as sg
import json
from datetime import datetime
import re

def parse_transactions(text):
    """Parsea el texto de entrada y extrae las transacciones."""
    pattern = r"(\d{2}/\d{2}/\d{4}): (.+) - (S/|\$) ([\d.,]+)"
    matches = re.findall(pattern, text)
    return [{"date": date, "description": desc, "amount": f"{currency} {amount}"} 
            for date, desc, currency, amount in matches]

def load_transactions(filename):
    """Carga las transacciones desde un archivo JSON."""
    try:
        with open(filename, 'r') as file:
            return json.load(file)
    except FileNotFoundError:
        return []

def save_transactions(filename, transactions):
    """Guarda las transacciones en un archivo JSON."""
    with open(filename, 'w') as file:
        json.dump(transactions, file, indent=2)

def create_main_window(transactions, participants):
    """Crea la ventana principal de la aplicación."""
    sg.theme('LightGrey1')

    transactions_frame = [
        [sg.Text("Transacciones")],
        [sg.Multiline(size=(50, 10), key="-TRANSACTIONS-")],
        [sg.Button("Analizar Transacciones")]
    ]

    participants_frame = [
        [sg.Text("Participantes")],
        [sg.Listbox(values=participants, size=(30, 5), key="-PARTICIPANTS-")],
        [sg.Input(key="-NEW_PARTICIPANT-"), sg.Button("Añadir Participante")]
    ]

    analysis_frame = [
        [sg.Text("Análisis de Transacciones")],
        [sg.Table(values=[], headings=["Fecha", "Descripción", "Monto"] + participants, 
                  auto_size_columns=False, num_rows=10, key="-ANALYSIS-")]
    ]

    summary_frame = [
        [sg.Text("Resumen de Gastos")],
        [sg.Table(values=[], headings=["Participante", "Total"], 
                  auto_size_columns=False, num_rows=5, key="-SUMMARY-")]
    ]

    layout = [
        [sg.Frame("Entrada de Datos", transactions_frame), 
         sg.Frame("Gestión de Participantes", participants_frame)],
        [sg.Frame("Análisis", analysis_frame)],
        [sg.Frame("Resumen", summary_frame)],
        [sg.Button("Guardar"), sg.Button("Salir")]
    ]

    return sg.Window("Gestor de Gastos Compartidos", layout, finalize=True)

def update_analysis_table(window, transactions, participants):
    """Actualiza la tabla de análisis con las transacciones y participantes."""
    table_data = []
    for t in transactions:
        row = [t['date'], t['description'], t['amount']] + [''] * len(participants)
        table_data.append(row)
    window["-ANALYSIS-"].update(values=table_data)

def update_summary_table(window, transactions, participants):
    """Actualiza la tabla de resumen con los totales por participante."""
    totals = {p: 0 for p in participants}
    for t in transactions:
        amount = float(t['amount'].split()[-1].replace(',', ''))
        assigned = sum(1 for p in participants if t.get(p, False))
        if assigned > 0:
            share = amount / assigned
            for p in participants:
                if t.get(p, False):
                    totals[p] += share
    
    summary_data = [[p, f"{totals[p]:.2f}"] for p in participants]
    window["-SUMMARY-"].update(values=summary_data)

def main():
    transactions = load_transactions("transactions.json")
    participants = ["Yo", "Natalia", "Primo Natalia"]

    window = create_main_window(transactions, participants)

    while True:
        event, values = window.read()

        if event == sg.WINDOW_CLOSED or event == "Salir":
            break
        elif event == "Analizar Transacciones":
            new_transactions = parse_transactions(values["-TRANSACTIONS-"])
            transactions.extend(new_transactions)
            update_analysis_table(window, transactions, participants)
            update_summary_table(window, transactions, participants)
        elif event == "Añadir Participante":
            new_participant = values["-NEW_PARTICIPANT-"]
            if new_participant and new_participant not in participants:
                participants.append(new_participant)
                window["-PARTICIPANTS-"].update(values=participants)
                update_analysis_table(window, transactions, participants)
                update_summary_table(window, transactions, participants)
        elif event == "Guardar":
            save_transactions("transactions.json", transactions)
            sg.popup("Transacciones guardadas exitosamente.")

    window.close()

if __name__ == "__main__":
    main()