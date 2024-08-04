// static/js/main.js - Parte 1

document.addEventListener("DOMContentLoaded", function () {
  // Elementos del DOM
  const registerBtn = document.getElementById("register-btn");
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const addTransactionsBtn = document.getElementById("add-transactions-btn");
  const addParticipantBtn = document.getElementById("add-participant-btn");
  const deleteAllTransactionsBtn = document.getElementById(
    "delete-all-transactions-btn"
  );
  const unassignAllParticipantsBtn = document.getElementById(
    "unassign-all-participants-btn"
  );
  const mainCurrencySelect = document.getElementById("main-currency");
  const secondaryCurrencySelect = document.getElementById("secondary-currency");

  // Event listeners
  registerBtn.addEventListener("click", register);
  loginBtn.addEventListener("click", login);
  logoutBtn.addEventListener("click", logout);
  addTransactionsBtn.addEventListener("click", addTransactions);
  addParticipantBtn.addEventListener("click", addParticipant);
  deleteAllTransactionsBtn.addEventListener("click", deleteAllTransactions);
  unassignAllParticipantsBtn.addEventListener("click", unassignAllParticipants);
  mainCurrencySelect.addEventListener("change", updateCurrency);
  secondaryCurrencySelect.addEventListener("change", updateCurrency);

  // Nuevo event listener para la barra de búsqueda
  document
    .getElementById("transaction-search-input")
    .addEventListener("input", filterTransactions);

  // Verificar el estado de la sesión al cargar la página
  checkLoginStatus();

  // Actualizar el resumen de gastos al cargar la página
  updateSummaryTable();

  // Cargar las opciones de divisas
  loadCurrencyOptions();
});

// Función para cargar las opciones de divisas
function loadCurrencyOptions() {
  const currencies = [
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "GBP", symbol: "£", name: "British Pound" },
    { code: "JPY", symbol: "¥", name: "Japanese Yen" },
    { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
    { code: "PEN", symbol: "S/", name: "Peruvian Sol" },
    // Añadir más divisas según sea necesario
  ];

  const mainCurrencySelect = document.getElementById("main-currency");
  const secondaryCurrencySelect = document.getElementById("secondary-currency");

  currencies.forEach((currency) => {
    const option = new Option(
      `${currency.name} (${currency.symbol})`,
      currency.code
    );
    mainCurrencySelect.add(option.cloneNode(true));
    secondaryCurrencySelect.add(option);
  });

  // Cargar las preferencias de divisa después de añadir las opciones
  loadCurrencyPreferences();
}

// Función para actualizar la divisa
function updateCurrency() {
  const mainCurrency = document.getElementById("main-currency").value;
  const secondaryCurrency = document.getElementById("secondary-currency").value;

  // Guardar las selecciones en localStorage
  localStorage.setItem("mainCurrency", mainCurrency);
  localStorage.setItem("secondaryCurrency", secondaryCurrency);

  loadTransactions();
}

// Función para cargar las preferencias de divisa
function loadCurrencyPreferences() {
  const mainCurrency = localStorage.getItem("mainCurrency");
  const secondaryCurrency = localStorage.getItem("secondaryCurrency");

  if (mainCurrency) {
    document.getElementById("main-currency").value = mainCurrency;
  }

  if (secondaryCurrency) {
    document.getElementById("secondary-currency").value = secondaryCurrency;
  }
}

// Función para registrar un nuevo usuario
function register() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  if (email && password) {
    fetch("/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email, password: password }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
        alert("Registro exitoso. Por favor, inicia sesión.");
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Error en el registro. Por favor, intenta de nuevo.");
      });
  }
}

// Función para iniciar sesión
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  if (email && password) {
    fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email, password: password }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
        checkLoginStatus();
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Error en el inicio de sesión. Por favor, intenta de nuevo.");
      });
  }
}

// Función para cerrar sesión
function logout() {
  fetch("/logout")
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
      checkLoginStatus();
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Función para verificar el estado de la sesión
function checkLoginStatus() {
  fetch("/user")
    .then((response) => response.json())
    .then((data) => {
      if (data.email) {
        document.getElementById("auth-section").style.display = "none";
        document.getElementById("logout-btn").style.display = "inline";
        document.getElementById("app-content").style.display = "block";
        loadParticipants();
        loadTransactions();
      } else {
        document.getElementById("auth-section").style.display = "block";
        document.getElementById("logout-btn").style.display = "none";
        document.getElementById("app-content").style.display = "none";
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Función para añadir transacciones
function addTransactions() {
  const transactionsText = document.getElementById("transactions-text").value;
  const newTransactions = parseTransactions(transactionsText);

  console.log(`Parsed ${newTransactions.length} transactions`);

  // Obtener el historial de asignaciones
  fetch("/api/assignment-history")
    .then((response) => response.json())
    .then((history) => {
      // Asignar automáticamente basándose en el historial
      newTransactions.forEach((transaction) => {
        const similarTransaction = findSimilarTransaction(transaction, history);
        if (similarTransaction) {
          transaction.assigned_to = similarTransaction.assigned_to;
        }
      });

      // Enviar las transacciones con asignaciones automáticas
      return fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTransactions),
      });
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Transacciones añadidas exitosamente:", data);
      loadTransactions();
      document.getElementById("transactions-text").value = ""; // Limpiar el textarea
    })
    .catch((error) => {
      console.error("Error al añadir transacciones:", error);
      alert(`Error al añadir transacciones: ${error.message}`);
    });
}

// Función para encontrar una transacción similar en el historial
function findSimilarTransaction(newTransaction, history) {
  return history.find(
    (historyTransaction) =>
      historyTransaction.description
        .toLowerCase()
        .includes(newTransaction.description.toLowerCase()) ||
      newTransaction.description
        .toLowerCase()
        .includes(historyTransaction.description.toLowerCase())
  );
}

// Función para parsear las transacciones ingresadas
function parseTransactions(text) {
  const lines = text.split("\n");
  return lines
    .map((line) => {
      // Expresión regular más flexible para manejar diferentes formatos
      const match = line.match(
        /(\d{2}\/\d{2}\/\d{4})\s*:\s*(.+?)\s*-\s*([-\d.,]+)(?:\s*\(?.*\)?)?$/
      );
      if (match) {
        const [, date, description, amountStr] = match;
        const amount = parseFloat(
          amountStr.replace(/[^\d.-]/g, "").replace(",", ".")
        );
        console.log(
          `Parsed transaction - Date: ${date}, Description: ${description.trim()}, Amount: ${amount}`
        );
        return {
          date,
          description: description.trim(),
          amount,
          assigned_to: [],
        };
      }
      return null;
    })
    .filter((t) => t !== null);
}

// Agrega esta nueva función para filtrar las transacciones
function filterTransactions() {
  const searchTerm = document
    .getElementById("transaction-search-input")
    .value.toLowerCase();
  const tableRows = document.querySelectorAll("#transactions-table tbody tr");

  tableRows.forEach((row) => {
    const date = row.cells[1].textContent.toLowerCase();
    const description = row.cells[2].textContent.toLowerCase();
    const amount = row.cells[3].textContent.toLowerCase();

    // Combina toda la información de la transacción en una sola cadena para buscar
    const transactionInfo = `${date} ${description} ${amount}`;

    // Verifica si el término de búsqueda está contenido en la información de la transacción
    if (transactionInfo.includes(searchTerm)) {
      row.style.display = ""; // Muestra la fila si coincide
    } else {
      row.style.display = "none"; // Oculta la fila si no coincide
    }
  });

  // Actualiza la numeración de las filas visibles
  updateRowNumbers();
}

// Función para actualizar la numeración de las filas visibles
function updateRowNumbers() {
  const visibleRows = document.querySelectorAll(
    "#transactions-table tbody tr:not([style*='display: none'])"
  );
  visibleRows.forEach((row, index) => {
    row.cells[0].textContent = index + 1;
  });
}

// Función para añadir un participante
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
        console.log("Participante añadido:", data);
        loadParticipants();
        // Actualizar la tabla de transacciones con el nuevo participante
        updateTransactionsWithNewParticipant(newParticipant);
      })
      .catch((error) => {
        console.error("Error al añadir participante:", error);
      });
  }
}

// Función para actualizar las transacciones con el nuevo participante
function updateTransactionsWithNewParticipant(newParticipant) {
  const checkboxContainers = document.querySelectorAll(".checkbox-container");
  checkboxContainers.forEach((container) => {
    if (!container.querySelector(`input[value="${newParticipant}"]`)) {
      const checkboxLabel = document.createElement("label");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = newParticipant;
      checkbox.addEventListener("change", () =>
        updateTransactionAssignment(
          getTransactionFromCheckboxContainer(container),
          container
        )
      );
      checkboxLabel.appendChild(checkbox);
      checkboxLabel.appendChild(document.createTextNode(newParticipant));
      container.appendChild(checkboxLabel);
    }
  });

  // Actualizar la tabla de resumen después de añadir el nuevo participante
  updateSummaryTable();
}

// static/js/main.js - Parte 2

// Función para cargar los participantes
function loadParticipants() {
  fetch("/api/participants")
    .then((response) => response.json())
    .then((participants) => {
      updateParticipantsList(participants);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Función para actualizar la lista de participantes
function updateParticipantsList(participants) {
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
}

// Función para eliminar un participante
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
      removeParticipantFromTransactions(participant);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Función para actualizar los participantes en las transacciones existentes
function updateParticipantsInTransactions(newParticipants) {
  const checkboxContainers = document.querySelectorAll(".checkbox-container");
  checkboxContainers.forEach((container) => {
    newParticipants.forEach((participant) => {
      if (!container.querySelector(`input[value="${participant}"]`)) {
        const checkboxLabel = document.createElement("label");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = participant;
        checkbox.addEventListener("change", () =>
          updateTransactionAssignment(
            getTransactionFromCheckboxContainer(container),
            container
          )
        );
        checkboxLabel.appendChild(checkbox);
        checkboxLabel.appendChild(document.createTextNode(participant));
        container.appendChild(checkboxLabel);
      }
    });
  });
}

// Función para remover un participante de las transacciones existentes
function removeParticipantFromTransactions(participant) {
  const checkboxContainers = document.querySelectorAll(".checkbox-container");
  checkboxContainers.forEach((container) => {
    const checkboxToRemove = container.querySelector(
      `input[value="${participant}"]`
    );
    if (checkboxToRemove) {
      checkboxToRemove.parentElement.remove();
    }
  });
  updateSummaryTable();
}

// Función auxiliar para obtener la transacción asociada a un contenedor de checkbox
function getTransactionFromCheckboxContainer(container) {
  const row = container.closest("tr");
  return {
    date: row.cells[1].textContent,
    description: row.cells[2].textContent,
    amount: row.cells[3].textContent,
  };
}

// Función para cargar las transacciones
function loadTransactions() {
  fetch("/api/transactions")
    .then((response) => response.json())
    .then((transactions) => {
      console.log("Transacciones cargadas:", transactions);
      transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
      updateTransactionsTable(transactions);
      filterTransactions(); // Aplica el filtro actual después de cargar las transacciones
    })
    .catch((error) => {
      console.error("Error al cargar transacciones:", error);
    });
}

// Función para actualizar la tabla de transacciones
function updateTransactionsTable(transactions) {
  const table = document.getElementById("transactions-table");
  const tbody = table.querySelector("tbody");
  tbody.innerHTML = "";

  const mainCurrency = document.getElementById("main-currency").value;
  const secondaryCurrency = document.getElementById("secondary-currency").value;

  transactions.forEach((transaction, index) => {
    const row = tbody.insertRow();

    // Insertar número de fila
    row.insertCell().textContent = index + 1;

    // Insertar fecha
    row.insertCell().textContent = transaction.date;

    // Insertar descripción
    row.insertCell().textContent = transaction.description;

    // Insertar monto con funcionalidad para alternar divisa
    const amountCell = row.insertCell();
    const amountSpan = document.createElement("span");
    amountSpan.textContent = `${
      transaction.currency || mainCurrency
    } ${transaction.amount.toFixed(2)}`;
    amountSpan.style.cursor = "pointer";
    amountSpan.addEventListener("click", () =>
      toggleCurrency(
        amountSpan,
        transaction.id,
        transaction.amount,
        mainCurrency,
        secondaryCurrency
      )
    );
    amountCell.appendChild(amountSpan);

    // Insertar celda para asignación de participantes
    const assignedCell = row.insertCell();
    createCheckboxContainer(assignedCell, transaction);

    // Insertar celda para acciones (botón de eliminar)
    const actionsCell = row.insertCell();
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Eliminar";
    deleteBtn.onclick = () => deleteTransaction(transaction);
    actionsCell.appendChild(deleteBtn);
  });

  // Actualizar la tabla de resumen después de modificar las transacciones
  updateSummaryTable();
}

// Función para alternar entre divisas principal y secundaria
function toggleCurrency(
  element,
  transactionId,
  amount,
  mainCurrency,
  secondaryCurrency
) {
  let newCurrency;
  if (element.textContent.startsWith(mainCurrency)) {
    newCurrency = secondaryCurrency;
    element.textContent = `${secondaryCurrency} ${amount.toFixed(2)}`;
  } else {
    newCurrency = mainCurrency;
    element.textContent = `${mainCurrency} ${amount.toFixed(2)}`;
  }

  // Enviar la actualización al servidor
  fetch("/api/update_transaction_currency", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      transactionId: transactionId,
      currency: newCurrency,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Currency updated successfully:", data);
    })
    .catch((error) => {
      console.error("Error updating currency:", error);
    });
}

// Función para crear el contenedor de checkboxes
function createCheckboxContainer(cell, transaction) {
  fetch("/api/participants")
    .then((response) => response.json())
    .then((participants) => {
      const checkboxContainer = document.createElement("div");
      checkboxContainer.className = "checkbox-container";
      participants.forEach((participant) => {
        const checkboxLabel = document.createElement("label");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = participant;
        checkbox.checked = transaction.assigned_to.includes(participant);
        checkbox.addEventListener("change", () =>
          updateTransactionAssignment(transaction, checkboxContainer)
        );
        checkboxLabel.appendChild(checkbox);
        checkboxLabel.appendChild(document.createTextNode(participant));
        checkboxContainer.appendChild(checkboxLabel);
      });
      cell.appendChild(checkboxContainer);
    });
}

// Función para actualizar la asignación de una transacción
function updateTransactionAssignment(transaction, checkboxContainer) {
  const assigned_to = Array.from(
    checkboxContainer.querySelectorAll("input:checked")
  ).map((checkbox) => checkbox.value);
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
      updateSummaryTable();
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Función para eliminar una transacción
function deleteTransaction(transaction) {
  // Registrar la información de la transacción que se intenta eliminar
  console.log("Intentando eliminar transacción:", transaction);

  fetch(`/api/transactions/${transaction.id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Transacción eliminada exitosamente:", data);
      loadTransactions();
    })
    .catch((error) => {
      console.error("Error al eliminar la transacción:", error);
      alert(`Error al eliminar la transacción: ${error.message}`);
    });
}

// Función para eliminar todas las transacciones
function deleteAllTransactions() {
  if (
    confirm("¿Estás seguro de que quieres eliminar todas las transacciones?")
  ) {
    fetch("/api/transactions/all", {
      method: "DELETE",
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
}

// Función para desasignar todos los participantes de todas las transacciones
function unassignAllParticipants() {
  if (
    confirm(
      "¿Estás seguro de que quieres desasignar todos los participantes de todas las transacciones?"
    )
  ) {
    fetch("/api/transactions/unassign-all", {
      method: "POST",
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
}

// Función para actualizar la tabla de resumen
function updateSummaryTable() {
  fetch("/api/transactions")
    .then((response) => response.json())
    .then((transactions) => {
      const summaryTable = document.getElementById("summary-table");
      const tbody = summaryTable.querySelector("tbody");
      tbody.innerHTML = "";

      const totals = {};
      transactions.forEach((transaction) => {
        if (transaction.assigned_to && transaction.assigned_to.length > 0) {
          const assigned = Array.isArray(transaction.assigned_to)
            ? transaction.assigned_to
            : transaction.assigned_to.split(",").map((p) => p.trim());
          const share = transaction.amount / assigned.length;
          assigned.forEach((participant) => {
            if (!totals[participant]) {
              totals[participant] = {};
            }
            if (!totals[participant][transaction.currency]) {
              totals[participant][transaction.currency] = 0;
            }
            totals[participant][transaction.currency] += share;
          });
        }
      });

      for (const [participant, currencies] of Object.entries(totals)) {
        const row = tbody.insertRow();
        row.insertCell().textContent = participant;
        const totalCell = row.insertCell();
        for (const [currency, total] of Object.entries(currencies)) {
          totalCell.innerHTML += `${currency} ${total.toFixed(2)}<br>`;
        }
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
