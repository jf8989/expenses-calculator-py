// static/js/main.js

document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const registerBtn = document.getElementById("register-btn");
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const addTransactionsBtn = document.getElementById("add-transactions-btn");
  const addParticipantBtn = document.getElementById("add-participant-btn");
  const deleteAllTransactionsBtn = document.getElementById("delete-all-transactions-btn");
  const unassignAllParticipantsBtn = document.getElementById("unassign-all-participants-btn");
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

  // New event listener for search bar
  document.getElementById("transaction-search-input").addEventListener("input", filterTransactions);

  // Check login status when page loads
  checkLoginStatus();

  // Update expense summary when page loads
  updateSummaryTable();

  // Load currency options
  loadCurrencyOptions();
});

// Function to load currency options
function loadCurrencyOptions() {
  const currencies = [
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "GBP", symbol: "£", name: "British Pound" },
    { code: "JPY", symbol: "¥", name: "Japanese Yen" },
    { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
    { code: "PEN", symbol: "S/", name: "Peruvian Sol" },
    // Add more currencies as needed
  ];

  const mainCurrencySelect = document.getElementById("main-currency");
  const secondaryCurrencySelect = document.getElementById("secondary-currency");

  currencies.forEach((currency) => {
    const option = new Option(`${currency.name} (${currency.symbol})`, currency.code);
    mainCurrencySelect.add(option.cloneNode(true));
    secondaryCurrencySelect.add(option);
  });

  // Load currency preferences after adding options
  loadCurrencyPreferences();
}

// Function to update currency
function updateCurrency() {
  const mainCurrency = document.getElementById("main-currency").value;
  const secondaryCurrency = document.getElementById("secondary-currency").value;

  // Save selections to localStorage
  localStorage.setItem("mainCurrency", mainCurrency);
  localStorage.setItem("secondaryCurrency", secondaryCurrency);

  loadTransactions();
}

// Function to load currency preferences
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

// Function to register a new user
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
        alert("Registration successful. Please log in.");
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Registration error. Please try again.");
      });
  }
}

// Function to log in
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
        alert("Login error. Please try again.");
      });
  }
}

// Function to log out
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

// Function to check login status
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

// Function to add transactions
function addTransactions() {
  const transactionsText = document.getElementById("transactions-text").value;
  const newTransactions = parseTransactions(transactionsText);

  console.log(`Parsed ${newTransactions.length} transactions`);

  // Get assignment history
  fetch("/api/assignment-history")
    .then((response) => response.json())
    .then((history) => {
      // Auto-assign based on history
      newTransactions.forEach((transaction) => {
        const similarTransaction = findSimilarTransaction(transaction, history);
        if (similarTransaction) {
          transaction.assigned_to = similarTransaction.assigned_to;
        }
      });

      // Send transactions with auto-assignments
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
      console.log("Transactions added successfully:", data);
      loadTransactions();
      document.getElementById("transactions-text").value = ""; // Clear textarea
    })
    .catch((error) => {
      console.error("Error adding transactions:", error);
      alert(`Error adding transactions: ${error.message}`);
    });
}

// Function to find a similar transaction in history
function findSimilarTransaction(newTransaction, history) {
  return history.find(
    (historyTransaction) => {
      if (!historyTransaction.description || !newTransaction.description) return false;

      return historyTransaction.description
        .toLowerCase()
        .includes(newTransaction.description.toLowerCase()) ||
        newTransaction.description
          .toLowerCase()
          .includes(historyTransaction.description.toLowerCase());
    }
  );
}

// Function to parse transactions
function parseTransactions(text) {
  const lines = text.split("\n");
  return lines
    .map((line) => {
      // More flexible regex for different formats
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

// New function to filter transactions
function filterTransactions() {
  const searchTerm = document
    .getElementById("transaction-search-input")
    .value.toLowerCase();
  const tableRows = document.querySelectorAll("#transactions-table tbody tr");

  tableRows.forEach((row) => {
    const date = row.cells[1].textContent.toLowerCase();
    const description = row.cells[2].textContent.toLowerCase();
    const amount = row.cells[3].textContent.toLowerCase();

    // Combine transaction info into one string for searching
    const transactionInfo = `${date} ${description} ${amount}`;

    // Check if search term is in transaction info
    if (transactionInfo.includes(searchTerm)) {
      row.style.display = ""; // Show row if match
    } else {
      row.style.display = "none"; // Hide row if no match
    }
  });

  // Update row numbers for visible rows
  updateRowNumbers();
}

// Function to update row numbers for visible rows
function updateRowNumbers() {
  const visibleRows = document.querySelectorAll(
    "#transactions-table tbody tr:not([style*='display: none'])"
  );
  visibleRows.forEach((row, index) => {
    row.cells[0].textContent = index + 1;
  });
}

// Function to add a participant
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
        console.log("Participant added:", data);
        loadParticipants();
        // Update transactions table with new participant
        updateTransactionsWithNewParticipant(newParticipant);
      })
      .catch((error) => {
        console.error("Error adding participant:", error);
      });
  }
}

// Function to update transactions with new participant
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

  // Update the summary table after adding new participant
  updateSummaryTable();
}

// Function to load participants
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

// Function to update the participants list
function updateParticipantsList(participants) {
  const participantsList = document.getElementById("participants-list");
  participantsList.innerHTML = "";
  participants.forEach((participant) => {
    const li = document.createElement("li");
    li.textContent = participant;
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = () => deleteParticipant(participant);
    li.appendChild(deleteBtn);
    participantsList.appendChild(li);
  });
}

// Function to delete a participant
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

// Function to update participants in existing transactions
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

// Function to remove a participant from existing transactions
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

// Helper function to get transaction from checkbox container
function getTransactionFromCheckboxContainer(container) {
  const row = container.closest("tr");
  return {
    date: row.cells[1].textContent,
    description: row.cells[2].textContent,
    amount: row.cells[3].textContent,
  };
}

// Function to load transactions
function loadTransactions() {
  fetch("/api/transactions")
    .then((response) => response.json())
    .then((transactions) => {
      console.log("Transactions loaded:", transactions);
      transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
      updateTransactionsTable(transactions);
      filterTransactions(); // Apply current filter after loading transactions
    })
    .catch((error) => {
      console.error("Error loading transactions:", error);
    });
}

// Function to update the transactions table
function updateTransactionsTable(transactions) {
  const table = document.getElementById("transactions-table");
  const tbody = table.querySelector("tbody");
  tbody.innerHTML = "";

  const mainCurrency = document.getElementById("main-currency").value;
  const secondaryCurrency = document.getElementById("secondary-currency").value;

  const checkboxPromises = [];

  transactions.forEach((transaction, index) => {
    const row = tbody.insertRow();
    row.dataset.transactionId = transaction.id;

    // Insert row number
    row.insertCell().textContent = index + 1;

    // Insert date
    row.insertCell().textContent = transaction.date;

    // Insert description
    row.insertCell().textContent = transaction.description;

    // Insert amount with currency toggle functionality
    const amountCell = row.insertCell();
    const amountSpan = document.createElement("span");
    amountSpan.textContent = `${transaction.currency || mainCurrency
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

    // Insert cell for participant assignment
    const assignedCell = row.insertCell();
    const promise = createCheckboxContainer(assignedCell, transaction);
    checkboxPromises.push(promise);

    // Insert cell for actions (delete button)
    const actionsCell = row.insertCell();
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = () => deleteTransaction(transaction);
    actionsCell.appendChild(deleteBtn);
  });

  // Wait for all checkboxes to be created before updating summary
  Promise.all(checkboxPromises).then(() => {
    updateSummaryTable();
  });
}

// Function to toggle currency
function toggleCurrency(element, transactionId, amount, mainCurrency, secondaryCurrency) {
  let newCurrency;

  // Properly extract current currency
  const currentText = element.textContent.trim();
  const currentParts = currentText.split(/\s+/);
  const currentCurrency = currentParts[0];

  if (currentCurrency === mainCurrency) {
    newCurrency = secondaryCurrency;
    element.textContent = `${secondaryCurrency} ${amount.toFixed(2)}`;
  } else {
    newCurrency = mainCurrency;
    element.textContent = `${mainCurrency} ${amount.toFixed(2)}`;
  }

  // Send the update to the server
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
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Currency updated successfully:", data);
      updateSummaryTable(); // Update summary after changing currency
    })
    .catch((error) => {
      console.error("Error updating currency:", error);
      // Revert UI change if server update failed
      element.textContent = `${currentCurrency} ${amount.toFixed(2)}`;
    });
}

// Function to create the checkbox container
function createCheckboxContainer(cell, transaction) {
  return fetch("/api/participants")
    .then((response) => response.json())
    .then((participants) => {
      const checkboxContainer = document.createElement("div");
      checkboxContainer.className = "checkbox-container";
      participants.forEach((participant) => {
        const checkboxLabel = document.createElement("label");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = participant;

        // Ensure transaction.assigned_to is always an array
        const assignedTo = Array.isArray(transaction.assigned_to)
          ? transaction.assigned_to
          : transaction.assigned_to
            ? transaction.assigned_to.split(",").map((p) => p.trim())
            : [];

        checkbox.checked = assignedTo.includes(participant);

        checkbox.addEventListener("change", () =>
          updateTransactionAssignment(transaction, checkboxContainer)
        );
        checkboxLabel.appendChild(checkbox);
        checkboxLabel.appendChild(document.createTextNode(participant));
        checkboxContainer.appendChild(checkboxLabel);
      });
      cell.appendChild(checkboxContainer);
      return checkboxContainer; // Return for promise chaining
    });
}

// Function to update the assignment of a transaction
function updateTransactionAssignment(transaction, checkboxContainer) {
  const assigned_to = Array.from(
    checkboxContainer.querySelectorAll("input:checked")
  ).map((checkbox) => checkbox.value);

  // Update local transaction assigned_to property
  transaction.assigned_to = assigned_to;

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
      console.log("Assignment updated:", data);
      // Immediately update expense summary
      updateSummaryTable();
    })
    .catch((error) => {
      console.error("Error updating assignment:", error);
    });

  // Immediately update expense summary without waiting for server response
  updateSummaryTable();
}

// Function to delete a transaction
function deleteTransaction(transaction) {
  // Log transaction info being deleted
  console.log("Attempting to delete transaction:", transaction);

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
      console.log("Transaction deleted successfully:", data);
      loadTransactions();
    })
    .catch((error) => {
      console.error("Error deleting transaction:", error);
      alert(`Error deleting transaction: ${error.message}`);
    });
}

// Function to delete all transactions
function deleteAllTransactions() {
  if (
    confirm("Are you sure you want to delete all transactions?")
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

// Function to unassign all participants from all transactions
function unassignAllParticipants() {
  if (
    confirm(
      "Are you sure you want to unassign all participants from all transactions?"
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

// Function to update the summary table
function updateSummaryTable() {
  const transactions = Array.from(
    document.querySelectorAll("#transactions-table tbody tr")
  ).map((row) => {
    const cells = row.cells;

    // More robust amount parsing
    const amountText = cells[3].textContent.trim();
    const currencyAndAmount = amountText.split(/\s+/);
    let currency, amount;

    if (currencyAndAmount.length >= 2) {
      currency = currencyAndAmount[0];
      // Handle amount with potential thousand separators and decimal points
      amount = parseFloat(currencyAndAmount[1].replace(/,/g, ''));
    } else {
      // Fallback if format is unexpected
      currency = document.getElementById("main-currency").value;
      amount = parseFloat(amountText.replace(/[^\d.-]/g, ''));
    }

    return {
      id: row.dataset.transactionId,
      date: cells[1].textContent,
      description: cells[2].textContent,
      amount: amount,
      currency: currency,
      assigned_to: Array.from(
        row.querySelectorAll(".checkbox-container input:checked")
      ).map((cb) => cb.value),
    };
  });

  const mainCurrency = document.getElementById("main-currency").value;
  const secondaryCurrency = document.getElementById("secondary-currency").value;

  const totals = {};

  transactions.forEach((transaction) => {
    // Skip invalid transactions
    if (isNaN(transaction.amount)) {
      console.warn("Invalid amount for transaction:", transaction);
      return;
    }

    if (transaction.assigned_to && transaction.assigned_to.length > 0) {
      const share = transaction.amount / transaction.assigned_to.length;

      transaction.assigned_to.forEach((participant) => {
        if (!totals[participant]) {
          totals[participant] = { [mainCurrency]: 0, [secondaryCurrency]: 0 };
        }

        const transactionCurrency = transaction.currency || mainCurrency;

        if (transactionCurrency === mainCurrency) {
          totals[participant][mainCurrency] += share;
        } else if (transactionCurrency === secondaryCurrency) {
          totals[participant][secondaryCurrency] += share;
        } else {
          console.warn(`Unrecognized currency: ${transactionCurrency}, using main currency instead`);
          totals[participant][mainCurrency] += share;
        }

        console.log(`Added ${share} ${transactionCurrency} to ${participant}`);
      });
    } else {
      console.warn("Transaction without assigned participants:", transaction);
    }
  });

  console.log("Final totals:", totals);

  const summaryTable = document.getElementById("summary-table");
  const tbody = summaryTable.querySelector("tbody");
  tbody.innerHTML = "";

  // Initialize grand totals
  let grandTotal = { [mainCurrency]: 0, [secondaryCurrency]: 0 };

  // Add participant rows and calculate grand total
  for (const [participant, amounts] of Object.entries(totals)) {
    const row = tbody.insertRow();
    row.insertCell().textContent = participant;
    row.insertCell().textContent = `${mainCurrency} ${amounts[mainCurrency].toFixed(2)}`;
    row.insertCell().textContent = `${secondaryCurrency} ${amounts[secondaryCurrency].toFixed(2)}`;

    // Add to grand total
    grandTotal[mainCurrency] += amounts[mainCurrency];
    grandTotal[secondaryCurrency] += amounts[secondaryCurrency];
  }

  // Add total row with styling
  const totalRow = tbody.insertRow();
  totalRow.style.fontWeight = "bold";
  totalRow.style.borderTop = "2px solid #e0e0e0";
  totalRow.style.backgroundColor = "#f8f9fa";

  totalRow.insertCell().textContent = "TOTAL";
  totalRow.insertCell().textContent = `${mainCurrency} ${grandTotal[mainCurrency].toFixed(2)}`;
  totalRow.insertCell().textContent = `${secondaryCurrency} ${grandTotal[secondaryCurrency].toFixed(2)}`;
}