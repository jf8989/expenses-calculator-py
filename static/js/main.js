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
  const saveSessionBtn = document.getElementById("save-session-btn");

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
  saveSessionBtn.addEventListener("click", saveSession);

  // New event listener for search bar
  document.getElementById("transaction-search-input").addEventListener("input", filterTransactions);

  // Check login status when page loads
  checkLoginStatus();

  // Update expense summary when page loads
  updateSummaryTable();

  // Load currency options
  loadCurrencyOptions();

  // Load saved sessions
  loadSessions();
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

      // Correctly sort transactions by date (parsing DD/MM/YYYY)
      transactions.sort((a, b) => {
        try {
          // Split date strings into parts [day, month, year]
          const partsA = a.date.split('/');
          const partsB = b.date.split('/');

          // Create Date objects: new Date(year, monthIndex, day)
          // Remember month is 0-indexed in JavaScript Date constructor (0=Jan, 1=Feb, ...)
          const dateA = new Date(parseInt(partsA[2], 10), parseInt(partsA[1], 10) - 1, parseInt(partsA[0], 10));
          const dateB = new Date(parseInt(partsB[2], 10), parseInt(partsB[1], 10) - 1, parseInt(partsB[0], 10));

          // Handle potential invalid dates during parsing
          if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
            console.warn("Invalid date encountered during sorting:", a.date, b.date);
            // Fallback to string comparison if dates are invalid
            return a.date.localeCompare(b.date);
          }

          return dateA - dateB; // Sort chronologically (older to newer)
        } catch (e) {
          console.error("Error parsing dates for sorting:", a.date, b.date, e);
          // Fallback to basic string comparison in case of unexpected errors
          return a.date.localeCompare(b.date);
        }
      });

      updateTransactionsTable(transactions);
      filterTransactions(); // Apply current filter after loading transactions
    })
    .catch((error) => {
      console.error("Error loading transactions:", error);
    });
}

// Function to update the transactions table (with inline amount editing)
function updateTransactionsTable(transactions) {
  const table = document.getElementById("transactions-table");
  const tbody = table.querySelector("tbody");
  tbody.innerHTML = ""; // Clear existing rows

  const mainCurrency = document.getElementById("main-currency").value;
  const secondaryCurrency = document.getElementById("secondary-currency").value;

  const checkboxPromises = [];

  transactions.forEach((transaction, index) => {
    const row = tbody.insertRow();
    row.dataset.transactionId = transaction.id; // Store transaction ID on the row

    // Row Number, Date, Description (No changes here)
    row.insertCell().textContent = index + 1;
    row.insertCell().textContent = transaction.date;
    row.insertCell().textContent = transaction.description;

    // --- NEW Amount Cell Handling with Edit Button ---
    const amountCell = row.insertCell();
    amountCell.classList.add("amount-cell"); // Add class for CSS hover effect

    // --- Define INLINE function to render the display elements (span + button) ---
    const renderDisplayElements = (currentTransaction) => {
      amountCell.innerHTML = ''; // Clear the cell first

      // 1. Create the Amount Span
      const amountSpan = document.createElement("span");
      amountSpan.classList.add("amount-display"); // Add class for styling/selection
      const displayCurrency = currentTransaction.currency || mainCurrency;
      const displayAmount = Number(currentTransaction.amount); // Ensure number
      amountSpan.textContent = `${displayCurrency} ${displayAmount.toFixed(2)}`;
      amountSpan.style.cursor = "pointer"; // Indicate clickable
      // --- CHANGE TOOLTIP ---
      amountSpan.title = "Click to toggle currency"; // Tooltip only for currency toggle

      // --- SINGLE CLICK LISTENER for Currency Toggle (RESTORED) ---
      amountSpan.addEventListener("click", (event) => {
        event.stopPropagation(); // Good practice, might prevent unintended effects
        toggleCurrency(
          amountSpan, // Pass the span element
          currentTransaction.id,
          displayAmount,
          mainCurrency,
          secondaryCurrency
        );
      });

      // 2. Create the Edit Button (initially hidden by CSS)
      const editBtn = document.createElement("button");
      editBtn.innerHTML = "✎"; // Pencil emoji/icon ✏️
      // Or use text: editBtn.textContent = "Edit";
      editBtn.classList.add("edit-amount-btn", "btn", "btn-outline-secondary", "btn-sm"); // Add classes for styling
      editBtn.title = "Edit amount";

      // --- CLICK LISTENER for Edit Button ---
      editBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        switchToEditInput(currentTransaction); // Call function to switch to input
      });

      // Append both elements to the cell
      amountCell.appendChild(amountSpan);
      amountCell.appendChild(editBtn);
    };

    // --- Define INLINE function to switch cell content to an input field ---
    const switchToEditInput = (currentTransaction) => {
      const originalAmount = Number(currentTransaction.amount);
      const transactionId = currentTransaction.id;

      amountCell.innerHTML = ''; // Clear the cell (removes span and edit button)

      const input = document.createElement("input");
      input.type = "number";
      input.value = originalAmount.toFixed(2);
      input.step = "0.01";
      // Use CSS classes for styling defined earlier or add inline styles
      input.classList.add("form-control", "form-control-sm", "d-inline-block", "w-auto");

      amountCell.appendChild(input);
      input.focus();
      input.select();

      // Define INLINE function to handle saving/reverting the edit
      const finishEditing = (saveChanges) => {
        if (saveChanges) {
          const newAmountStr = input.value;
          const newAmount = parseFloat(newAmountStr);

          if (isNaN(newAmount)) {
            alert("Invalid amount entered.");
            renderDisplayElements(currentTransaction); // Revert display
            return;
          }

          // Only save if the amount actually changed
          if (newAmount.toFixed(2) !== originalAmount.toFixed(2)) {
            // --- FETCH TO UPDATE AMOUNT (Backend call) ---
            fetch(`/api/transactions/${transactionId}/update_amount`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ amount: newAmount }),
            })
              .then(response => {
                if (!response.ok) {
                  return response.json().then(err => { throw new Error(err.error || `Server error: ${response.status}`) });
                }
                return response.json();
              })
              .then(data => {
                console.log("Amount update successful:", data);
                // IMPORTANT: Update the JS object
                currentTransaction.amount = data.new_amount;
                renderDisplayElements(currentTransaction); // Re-render span+button
                updateSummaryTable(); // Recalculate
              })
              .catch(error => {
                console.error("Error updating amount:", error);
                alert(`Error updating amount: ${error.message}`);
                // Revert display ON ERROR
                renderDisplayElements(currentTransaction);
              });
          } else {
            // No change, just revert display
            renderDisplayElements(currentTransaction);
          }
        } else {
          // Revert display without saving (Escape key)
          renderDisplayElements(currentTransaction);
        }
      };

      // Add listeners to the input field
      input.addEventListener("blur", () => {
        // Use a tiny timeout to allow other clicks to register before reverting
        setTimeout(() => finishEditing(true), 150);
      });
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          finishEditing(true);
        } else if (event.key === "Escape") {
          event.preventDefault();
          finishEditing(false);
        }
      });
    };

    // --- Initial Render ---
    // Call the inline function to initially display the amount span and edit button
    renderDisplayElements(transaction);
    // --- END OF MODIFIED SECTION ---


    // Participant Assignment Cell (Keep your original logic)
    const assignedCell = row.insertCell();
    const promise = createCheckboxContainer(assignedCell, transaction);
    checkboxPromises.push(promise);

    // Actions Cell (Delete button) (Keep your original logic)
    const actionsCell = row.insertCell();
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = () => deleteTransaction(transaction);
    actionsCell.appendChild(deleteBtn);
  });

  // Wait for all checkboxes before initial summary calculation
  Promise.all(checkboxPromises).then(() => {
    updateSummaryTable();
  });
}

// Function to toggle currency
function toggleCurrency(amountSpanElement, transactionId, amount, mainCurrency, secondaryCurrency) {
  // amountSpanElement is the SPAN tag that was double-clicked

  let newCurrency;
  const currentText = amountSpanElement.textContent.trim();
  const currentParts = currentText.split(/\s+/);
  const currentCurrency = currentParts[0]; // Get currency from the span's text

  if (currentCurrency === mainCurrency) {
    newCurrency = secondaryCurrency;
  } else {
    newCurrency = mainCurrency;
  }

  console.log(`Toggling currency for ${transactionId} from ${currentCurrency} to ${newCurrency}`); // Debug

  // --- FETCH TO UPDATE CURRENCY ---
  fetch("/api/update_transaction_currency", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      transactionId: transactionId,
      currency: newCurrency,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then(err => { throw new Error(err.error || `Server error: ${response.status}`) });
      }
      return response.json();
    })
    .then((data) => {
      console.log("Currency updated successfully via API:", data);

      // --- Update the SPAN's text directly ---
      amountSpanElement.textContent = `${newCurrency} ${Number(amount).toFixed(2)}`;

      // --- IMPORTANT (Best Effort): Update underlying transaction data ---
      // Find the parent row and update the currency in the source 'transactions' array if possible
      // This part is tricky without a central state management. We'll try to find it.
      const tableBody = document.querySelector("#transactions-table tbody");
      // This assumes 'transactions' fetched in loadTransactions is accessible or re-fetched.
      // This is a common challenge without a framework/library.
      // A simpler approach might be to just update the display and rely on the summary function
      // to read the current display, though less robust.
      // Let's proceed with just updating the display and summary for now.

      // Find the transaction data associated with the element to update currency property (more robust)
      const row = amountSpanElement.closest('tr');
      if (row && window.transactionsData) { // Assuming transactionsData holds the array from loadTransactions
        const transaction = window.transactionsData.find(t => t.id == row.dataset.transactionId);
        if (transaction) {
          transaction.currency = newCurrency; // Update the JS object
          console.log("Updated transaction object currency:", transaction);
        }
      }

      updateSummaryTable(); // Update summary after changing currency
    })
    .catch((error) => {
      console.error("Error updating currency:", error);
      alert(`Error updating currency: ${error.message}`);
      // Don't revert text here, error message is shown.
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

// Function to save the current session
function saveSession() {
  const sessionName = document.getElementById("session-name").value;

  fetch("/api/sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: sessionName,
      description: ""
    }),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then(data => {
      console.log("Session saved:", data);
      alert(`Session "${data.name}" saved with ${data.transaction_count} transactions`);
      loadSessions(); // Refresh the sessions list
      document.getElementById("session-name").value = "";
    })
    .catch(error => {
      console.error("Error saving session:", error);
      alert("Error saving session. Please try again.");
    });
}

// Function to load all saved sessions
function loadSessions() {
  fetch("/api/sessions")
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then(sessions => {
      updateSessionsTable(sessions);
    })
    .catch(error => {
      console.error("Error loading sessions:", error);
    });
}

// Function to update sessions table
function updateSessionsTable(sessions) {
  const table = document.getElementById("sessions-table");
  const tbody = table.querySelector("tbody");
  tbody.innerHTML = ""; // Clear existing rows

  if (sessions.length === 0) {
    const row = tbody.insertRow();
    const cell = row.insertCell();
    cell.colSpan = 5; // --- ADJUST COLSPAN TO 5 ---
    cell.textContent = "No saved sessions";
    cell.style.textAlign = "center";
    cell.style.fontStyle = "italic";
    return;
  }

  sessions.forEach(session => {
    const row = tbody.insertRow();
    row.dataset.sessionId = session.id; // Store session id on the row

    // Format date
    const date = new Date(session.created_at);
    // More user-friendly date format
    const formattedDate = date.toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true
    });

    // Session name
    row.insertCell().textContent = session.name;

    // Creation date
    row.insertCell().textContent = formattedDate;

    // Transaction count (add an ID to potentially update it later)
    const countCell = row.insertCell();
    countCell.textContent = session.transaction_count;
    countCell.id = `session-count-${session.id}`; // ID for easy update

    // Actions Cell
    const actionsCell = row.insertCell();
    actionsCell.style.whiteSpace = "nowrap"; // Prevent buttons wrapping

    // Load button (no change)
    const loadBtn = document.createElement("button");
    loadBtn.className = "btn btn-success btn-sm";
    loadBtn.innerHTML = '<i class="fas fa-folder-open"></i> Load';
    loadBtn.title = "Load this session (replaces current data)";
    loadBtn.onclick = () => loadSessionData(session.id);
    actionsCell.appendChild(loadBtn);

    // --- ADD OVERWRITE BUTTON ---
    const overwriteBtn = document.createElement("button");
    overwriteBtn.className = "btn btn-warning btn-sm"; // Use warning color
    overwriteBtn.innerHTML = '<i class="fas fa-save"></i> Save'; // Save icon
    overwriteBtn.title = "Overwrite this session with current transaction data";
    overwriteBtn.style.marginLeft = "5px";
    overwriteBtn.onclick = () => overwriteSessionData(session.id, session.name); // New handler function
    actionsCell.appendChild(overwriteBtn);
    // --- END ADD OVERWRITE BUTTON ---

    // Delete button (no change)
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-danger btn-sm";
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
    deleteBtn.title = "Delete this session permanently";
    deleteBtn.style.marginLeft = "5px";
    deleteBtn.onclick = () => deleteSession(session.id, session.name);
    actionsCell.appendChild(deleteBtn);
  });
}

function overwriteSessionData(sessionId, sessionName) {
  if (confirm(`Are you sure you want to overwrite the session "${sessionName}" with your current transactions? This cannot be undone.`)) {
    console.log(`Attempting to overwrite session: ${sessionId} (${sessionName})`);
    fetch(`/api/sessions/${sessionId}/overwrite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Body is not needed unless you want to send extra info,
      // backend fetches current transactions itself
      body: JSON.stringify({}),
    })
      .then(response => {
        if (!response.ok) {
          // Try to get error message from backend
          return response.json().then(err => { throw new Error(err.error || `Failed to overwrite: ${response.status}`) });
        }
        return response.json();
      })
      .then(data => {
        console.log("Overwrite successful:", data);
        alert(data.message || "Session overwritten successfully!"); // Show success message

        // Update the transaction count display in the table for this specific session
        const countCell = document.getElementById(`session-count-${sessionId}`);
        if (countCell && data.transaction_count !== undefined) {
          countCell.textContent = data.transaction_count;
        }
        // Optionally reload the whole list if needed: loadSessions();
      })
      .catch(error => {
        console.error("Error overwriting session:", error);
        alert(`Error overwriting session: ${error.message}`);
      });
  }
}

// Function to load a specific session
function loadSessionData(sessionId) {
  if (confirm("This will replace your current transactions. Continue?")) {
    fetch(`/api/sessions/${sessionId}/load`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then(data => {
        console.log("Session loaded:", data);
        alert(`Session loaded with ${data.transaction_count} transactions`);

        // Reload transactions to display the loaded session
        loadTransactions();
      })
      .catch(error => {
        console.error("Error loading session:", error);
        alert("Error loading session. Please try again.");
      });
  }
}

// Function to delete a session
function deleteSession(sessionId, sessionName) {
  if (confirm(`Delete session "${sessionName}"?`)) {
    fetch("/api/sessions", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: sessionId
      }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then(data => {
        console.log("Session deleted:", data);
        loadSessions(); // Refresh the sessions list
      })
      .catch(error => {
        console.error("Error deleting session:", error);
        alert("Error deleting session. Please try again.");
      });
  }
}