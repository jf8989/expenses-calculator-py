document.addEventListener("DOMContentLoaded", function () {
  const analyzeBtn = document.getElementById("analyze-btn");
  const addParticipantBtn = document.getElementById("add-participant-btn");

  analyzeBtn.addEventListener("click", analyzeTransactions);
  addParticipantBtn.addEventListener("click", addParticipant);

  loadParticipants();
  loadTransactions();
});

function analyzeTransactions() {
  const transactionsText = document.getElementById("transactions-text").value;
  const transactions = parseTransactions(transactionsText);

  fetch("/api/transactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(transactions),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
      loadTransactions();
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function parseTransactions(text) {
  const lines = text.split("\n");
  return lines
    .map((line) => {
      const match = line.match(
        /(\d{2}\/\d{2}\/\d{4}): (.+) - (S\/|\$) ([\d.,]+)/
      );
      if (match) {
        return {
          date: match[1],
          description: match[2],
          amount: `${match[3]} ${match[4]}`,
          assigned_to: [],
        };
      }
      return null;
    })
    .filter((t) => t !== null);
}

function addParticipant() {
  const newParticipant = document.getElementById("new-participant").value;
  if (newParticipant) {
    fetch("/api/participants", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: newParticipant }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
        loadParticipants();
        loadTransactions();
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
}

function loadParticipants() {
  fetch("/api/participants")
    .then((response) => response.json())
    .then((participants) => {
      const participantsList = document.getElementById("participants-list");
      participantsList.innerHTML = "";
      participants.forEach((participant) => {
        const li = document.createElement("li");
        li.textContent = participant;
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Eliminar";
        deleteBtn.onclick = () => deleteParticipant(participant);
        li.appendChild(deleteBtn);
        participantsList.appendChild(li);
      });
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function deleteParticipant(participant) {
  fetch("/api/participants", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: participant }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
      loadParticipants();
      loadTransactions();
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function loadTransactions() {
  fetch("/api/transactions")
    .then((response) => response.json())
    .then((transactions) => {
      updateTransactionsTable(transactions);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function updateTransactionsTable(transactions) {
  const table = document.getElementById("transactions-table");
  const tbody = table.querySelector("tbody");
  tbody.innerHTML = "";

  transactions.forEach((transaction, index) => {
    const row = tbody.insertRow();
    row.insertCell().textContent = index + 1; // Numeración
    row.insertCell().textContent = transaction.date;
    row.insertCell().textContent = transaction.description;
    row.insertCell().textContent = transaction.amount;

    const assignedCell = row.insertCell();
    fetch("/api/participants")
      .then((response) => response.json())
      .then((participants) => {
        if (participants.length > 0) {
          const assignSelect = document.createElement("select");
          assignSelect.multiple = true;
          assignSelect.size = Math.min(4, participants.length); // Mostrar hasta 4 opciones a la vez
          participants.forEach((participant) => {
            const option = document.createElement("option");
            option.value = participant;
            option.textContent = participant;
            if (
              transaction.assigned_to &&
              transaction.assigned_to.includes(participant)
            ) {
              option.selected = true;
            }
            assignSelect.appendChild(option);
          });
          assignSelect.onchange = () =>
            updateTransactionAssignment(transaction, assignSelect);
          assignedCell.appendChild(assignSelect);
        } else {
          assignedCell.textContent = "No hay participantes";
        }
      });
  });

  updateSummaryTable(transactions);
}

function updateTransactionAssignment(transaction, assignSelect) {
  const assigned_to = Array.from(assignSelect.selectedOptions).map(
    (option) => option.value
  );
  fetch("/api/assign", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      date: transaction.date,
      description: transaction.description,
      assigned_to: assigned_to,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
      loadTransactions();
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function updateSummaryTable(transactions) {
  const summaryTable = document.getElementById("summary-table");
  const tbody = summaryTable.querySelector("tbody");
  tbody.innerHTML = "";

  const totals = {};
  transactions.forEach((transaction) => {
    const amount = parseFloat(transaction.amount.replace(/[^\d.-]/g, ""));
    if (transaction.assigned_to && transaction.assigned_to.length > 0) {
      const share = amount / transaction.assigned_to.length;
      transaction.assigned_to.forEach((participant) => {
        if (!totals[participant]) {
          totals[participant] = 0;
        }
        totals[participant] += share;
      });
    }
  });

  for (const [participant, total] of Object.entries(totals)) {
    const row = tbody.insertRow();
    row.insertCell().textContent = participant;
    row.insertCell().textContent = `S/ ${total.toFixed(2)}`;
  }
}
