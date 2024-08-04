document.addEventListener('DOMContentLoaded', function() {
    const analyzeBtn = document.getElementById('analyze-btn');
    const addParticipantBtn = document.getElementById('add-participant-btn');
    
    analyzeBtn.addEventListener('click', analyzeTransactions);
    addParticipantBtn.addEventListener('click', addParticipant);
    
    loadParticipants();
});

function analyzeTransactions() {
    const transactionsText = document.getElementById('transactions-text').value;
    const transactions = parseTransactions(transactionsText);
    
    fetch('/api/transactions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactions),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        updateTransactionsTable(transactions);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

function parseTransactions(text) {
    const lines = text.split('\n');
    return lines.map(line => {
        const match = line.match(/(\d{2}\/\d{2}\/\d{4}): (.+) - (S\/|\$) ([\d.,]+)/);
        if (match) {
            return {
                date: match[1],
                description: match[2],
                amount: `${match[3]} ${match[4]}`
            };
        }
        return null;
    }).filter(t => t !== null);
}

function addParticipant() {
    const newParticipant = document.getElementById('new-participant').value;
    if (newParticipant) {
        fetch('/api/participants', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: newParticipant }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            loadParticipants();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }
}

function loadParticipants() {
    fetch('/api/participants')
    .then(response => response.json())
    .then(participants => {
        const participantsList = document.getElementById('participants-list');
        participantsList.innerHTML = '';
        participants.forEach(participant => {
            const li = document.createElement('li');
            li.textContent = participant;
            participantsList.appendChild(li);
        });
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

function updateTransactionsTable(transactions) {
    const table = document.getElementById('transactions-table');
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';
    
    transactions.forEach(transaction => {
        const row = tbody.insertRow();
        row.insertCell().textContent = transaction.date;
        row.insertCell().textContent = transaction.description;
        row.insertCell().textContent = transaction.amount;
    });
}