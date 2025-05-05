// static/js/handlers.js
import * as api from './api.js';
import * as ui from './ui.js';
import { parseTransactions, findSimilarTransaction } from './transactions.js'; // We'll create transactions.js
import { getTransactionDataFromDOM, getParticipantsFromDOM } from './state.js'; // We'll create state.js

// --- Auth Handlers ---
export async function registerHandler() {
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const email = emailInput.value;
    const password = passwordInput.value;
    if (email && password) {
        try {
            const data = await api.registerUser(email, password);
            console.log("Registration Success:", data);
            alert("Registration successful. Please log in.");
            emailInput.value = ''; // Clear fields after successful registration
            passwordInput.value = '';
        } catch (error) {
            console.error("Registration Error:", error);
            alert(`Registration error: ${error.message}`);
        }
    } else {
        alert("Please enter both email and password.");
    }
}

export async function loginHandler() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    if (email && password) {
        try {
            const data = await api.loginUser(email, password);
            console.log("Login Success:", data);
            await checkLoginStatusHandler(); // Refresh state after login
        } catch (error) {
            console.error("Login Error:", error);
            alert(`Login error: ${error.message}`);
        }
    } else {
        alert("Please enter both email and password.");
    }
}

export async function logoutHandler() {
    try {
        const data = await api.logoutUser();
        console.log("Logout Success:", data);
        ui.showLoggedOutState(); // Update UI immediately
    } catch (error) {
        console.error("Logout Error:", error);
        // Optionally show an error message, but usually logout failures are less critical to notify
    }
}

export async function checkLoginStatusHandler() {
    try {
        const data = await api.checkUserStatus();
        if (data.email) {
            ui.showLoggedInState();
            // Load initial data only when logged in
            await loadParticipantsHandler(); // Load participants first
            await loadTransactionsHandler(); // Then transactions (needs participants for checkboxes)
            await loadSessionsHandler(); // Load sessions
        } else {
            ui.showLoggedOutState();
        }
    } catch (error) {
        console.error("Error checking login status:", error);
        ui.showLoggedOutState(); // Assume logged out on error
    }
}

// --- Currency Handlers ---
export function currencyChangeHandler() {
    const mainCurrency = document.getElementById("main-currency").value;
    const secondaryCurrency = document.getElementById("secondary-currency").value;
    localStorage.setItem("mainCurrency", mainCurrency);
    localStorage.setItem("secondaryCurrency", secondaryCurrency);
    // Reload transactions to reflect potential currency display changes
    loadTransactionsHandler();
}

// --- Participant Handlers ---
export async function addParticipantHandler() {
    const input = document.getElementById("new-participant");
    const newParticipantName = input.value.trim();
    if (newParticipantName) {
        try {
            const data = await api.addParticipantApi(newParticipantName);
            console.log("Participant added:", data);
            input.value = ""; // Clear input
            await loadParticipantsHandler(); // Reload participant list
            // Update existing transaction rows immediately
            ui.addParticipantToTransactionCheckboxes(newParticipantName);
            // Recalculate summary
            calculateAndUpdateSummary();
        } catch (error) {
            console.error("Error adding participant:", error);
            alert(`Error adding participant: ${error.message}`);
        }
    }
}

export async function deleteParticipantHandler(participantName) {
    if (!confirm(`Are you sure you want to delete participant "${participantName}"? This will also remove them from any assignments.`)) {
        return;
    }
    try {
        const data = await api.deleteParticipantApi(participantName);
        console.log("Participant deleted:", data);
        await loadParticipantsHandler(); // Reload list
        // Remove from UI immediately
        ui.removeParticipantFromTransactionCheckboxes(participantName);
        // Recalculate summary
        calculateAndUpdateSummary();
    } catch (error) {
        console.error("Error deleting participant:", error);
        alert(`Error deleting participant: ${error.message}`);
    }
}

export async function loadParticipantsHandler() {
    try {
        const participants = await api.fetchParticipants();
        ui.updateParticipantsListUI(participants);
        // Store participants globally or pass them around (simpler for now: global)
        window.currentParticipants = participants; // Make available for other functions
        return participants; // Return for chaining if needed
    } catch (error) {
        console.error("Error loading participants:", error);
        alert("Could not load participants.");
        window.currentParticipants = []; // Ensure it's an empty array on error
        return [];
    }
}


// --- Transaction Handlers ---
export async function addTransactionsHandler() {
    const transactionsText = document.getElementById("transactions-text").value;
    const newTransactions = parseTransactions(transactionsText);

    if (newTransactions.length === 0) {
        console.log("No valid transactions parsed.");
        alert("No valid transactions found in the input text.");
        return;
    }
    console.log(`Parsed ${newTransactions.length} transactions`);

    try {
        // Fetch history for auto-assignment
        const history = await api.fetchAssignmentHistory();

        // Auto-assign based on history
        newTransactions.forEach((transaction) => {
            const assignedParticipants = findSimilarTransaction(transaction.description, history);
            if (assignedParticipants) {
                transaction.assigned_to = assignedParticipants;
                console.log(`Auto-assigned [${assignedParticipants.join(', ')}] to "${transaction.description}" based on history.`);
            }
        });

        // Add transactions via API
        const data = await api.addTransactionsApi(newTransactions);
        console.log("Transactions added successfully:", data);
        ui.clearTransactionInput(); // Clear textarea
        await loadTransactionsHandler(); // Reload the table

    } catch (error) {
        console.error("Error adding transactions:", error);
        alert(`Error adding transactions: ${error.message}`);
    }
}

export async function loadTransactionsHandler() {
    try {
        const transactions = await api.fetchTransactions();
        console.log("Transactions loaded:", transactions);

        // Sort transactions (ensure date parsing is robust)
        transactions.sort((a, b) => {
            try {
                const partsA = a.date.split('/');
                const partsB = b.date.split('/');
                const dateA = new Date(parseInt(partsA[2], 10), parseInt(partsA[1], 10) - 1, parseInt(partsA[0], 10));
                const dateB = new Date(parseInt(partsB[2], 10), parseInt(partsB[1], 10) - 1, parseInt(partsB[0], 10));
                if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return a.date.localeCompare(b.date);
                return dateA - dateB; // Chronological
            } catch (e) { return a.date.localeCompare(b.date); }
        });

        // Store globally or pass around (global for simplicity here)
        window.currentTransactions = transactions;

        // Get required data for UI update
        const participants = window.currentParticipants || await loadParticipantsHandler(); // Ensure participants are loaded
        const mainCurrency = document.getElementById("main-currency").value;
        const secondaryCurrency = document.getElementById("secondary-currency").value;

        ui.updateTransactionsTableUI(transactions, participants, mainCurrency, secondaryCurrency);
        filterTransactionsHandler(); // Apply filter
        calculateAndUpdateSummary(); // Update summary

    } catch (error) {
        console.error("Error loading transactions:", error);
        alert("Could not load transactions.");
        window.currentTransactions = []; // Ensure empty array on error
    }
}


export async function updateTransactionAssignmentHandler(transaction, checkboxContainer) {
    const assigned_to = Array.from(
        checkboxContainer.querySelectorAll("input:checked")
    ).map((checkbox) => checkbox.value);

    // Optimistic UI update handled by checkbox state change
    console.log(`Updating assignment for transaction ID ${transaction.id} to:`, assigned_to);

    try {
        const data = await api.updateAssignmentApi(transaction.id, assigned_to);
        console.log("Assignment update successful:", data);
        // Update local transaction data if stored (e.g., in window.currentTransactions)
        if (window.currentTransactions) {
            const localTransaction = window.currentTransactions.find(t => t.id === transaction.id);
            if (localTransaction) localTransaction.assigned_to = assigned_to;
        }
        calculateAndUpdateSummary(); // Recalculate summary
    } catch (error) {
        console.error("Error updating assignment:", error);
        alert(`Error updating assignment: ${error.message}`);
        // Revert checkbox state (complex, requires knowing previous state) - skip for now
        // Maybe reload transactions on error?
        // loadTransactionsHandler();
    }
}

export async function deleteTransactionHandler(transaction) {
    if (!confirm(`Delete transaction: ${transaction.date} - ${transaction.description}?`)) {
        return;
    }
    console.log("Attempting to delete transaction:", transaction);
    try {
        const data = await api.deleteTransactionApi(transaction.id);
        console.log("Transaction deleted successfully:", data);
        await loadTransactionsHandler(); // Reload the table
    } catch (error) {
        console.error("Error deleting transaction:", error);
        alert(`Error deleting transaction: ${error.message}`);
    }
}

export async function deleteAllTransactionsHandler() {
    if (confirm("Are you sure you want to delete ALL current transactions?")) {
        try {
            const data = await api.deleteAllTransactionsApi();
            console.log("All transactions deleted:", data);
            await loadTransactionsHandler(); // Reload table (will be empty)
        } catch (error) {
            console.error("Error deleting all transactions:", error);
            alert(`Error deleting all transactions: ${error.message}`);
        }
    }
}

export async function unassignAllParticipantsHandler() {
    if (confirm("Are you sure you want to unassign all participants from ALL current transactions?")) {
        try {
            const data = await api.unassignAllParticipantsApi();
            console.log("All participants unassigned:", data);
            await loadTransactionsHandler(); // Reload table to reflect changes
        } catch (error) {
            console.error("Error unassigning all participants:", error);
            alert(`Error unassigning all participants: ${error.message}`);
        }
    }
}

export async function toggleCurrencyHandler(amountSpanElement, transaction, mainCurrency, secondaryCurrency) {
    const currentText = amountSpanElement.textContent.trim();
    const currentParts = currentText.split(/\s+/);
    const currentCurrency = currentParts[0];
    const newCurrency = (currentCurrency === mainCurrency) ? secondaryCurrency : mainCurrency;

    console.log(`Toggling currency for ${transaction.id} from ${currentCurrency} to ${newCurrency}`);

    try {
        const data = await api.updateTransactionCurrencyApi(transaction.id, newCurrency);
        console.log("Currency updated successfully via API:", data);

        // Update UI Span
        amountSpanElement.textContent = `${newCurrency} ${Number(transaction.amount).toFixed(2)}`;

        // Update local transaction data if stored
        if (window.currentTransactions) {
            const localTransaction = window.currentTransactions.find(t => t.id === transaction.id);
            if (localTransaction) localTransaction.currency = newCurrency;
        }

        calculateAndUpdateSummary(); // Recalculate summary
    } catch (error) {
        console.error("Error updating currency:", error);
        alert(`Error updating currency: ${error.message}`);
    }
}

export async function updateTransactionAmountHandler(transactionId, newAmount) {
    // This function is called from within the UI module's edit handler
    try {
        const data = await api.updateTransactionAmountApi(transactionId, newAmount);
        console.log("Amount update successful:", data);
        // Update local transaction data if stored
        if (window.currentTransactions) {
            const localTransaction = window.currentTransactions.find(t => t.id === transactionId);
            if (localTransaction) localTransaction.amount = data.new_amount;
        }
        calculateAndUpdateSummary(); // Recalculate summary
        return data; // Return data for the UI handler to use
    } catch (error) {
        // Error is caught and handled in the calling function (switchToEditInput)
        // But we re-throw it so the catch block there executes
        throw error;
    }
}


export function filterTransactionsHandler() {
    const searchTerm = document.getElementById("transaction-search-input").value.toLowerCase();
    ui.filterTransactionsUI(searchTerm);
}

// --- Summary Handler ---
export function calculateAndUpdateSummary() {
    // Get data directly from DOM tables as the original function did
    const transactions = getTransactionDataFromDOM();
    const participants = getParticipantsFromDOM(); // Assumes participants are loaded correctly
    const mainCurrency = document.getElementById("main-currency").value;
    const secondaryCurrency = document.getElementById("secondary-currency").value;

    // Call the UI function to update the table
    ui.updateSummaryTableUI(transactions, participants, mainCurrency, secondaryCurrency);
}


// --- Session Handlers ---
export async function saveSessionHandler() {
    const sessionNameInput = document.getElementById("session-name");
    const sessionName = sessionNameInput.value.trim();
    // Description field not present in HTML, pass empty string
    try {
        const data = await api.saveSessionApi(sessionName, "");
        console.log("Session saved:", data);
        alert(`Session "${data.name}" saved with ${data.transaction_count} transactions`);
        ui.clearSessionNameInput();
        await loadSessionsHandler(); // Refresh list
    } catch (error) {
        console.error("Error saving session:", error);
        alert(`Error saving session: ${error.message}`);
    }
}

export async function loadSessionsHandler() {
    try {
        const sessions = await api.fetchSessions();
        ui.updateSessionsTableUI(sessions);
    } catch (error) {
        console.error("Error loading sessions:", error);
        alert("Could not load saved sessions.");
        ui.updateSessionsTableUI([]); // Show empty table on error
    }
}

export async function loadSessionHandler(sessionId) {
    if (confirm("Loading this session will replace your current transactions. Continue?")) {
        try {
            const data = await api.loadSessionApi(sessionId);
            console.log("Session loaded:", data);
            alert(`Session loaded with ${data.transaction_count} transactions`);
            await loadTransactionsHandler(); // Reload transactions to show loaded data
        } catch (error) {
            console.error("Error loading session:", error);
            alert(`Error loading session: ${error.message}`);
        }
    }
}

export async function overwriteSessionHandler(sessionId, sessionName) {
    if (confirm(`Are you sure you want to overwrite the session "${sessionName}" with your current transactions? This cannot be undone.`)) {
        console.log(`Attempting to overwrite session: ${sessionId} (${sessionName})`);
        try {
            const data = await api.overwriteSessionApi(sessionId);
            console.log("Overwrite successful:", data);
            alert(data.message || "Session overwritten successfully!");
            // Update count in UI
            ui.updateSessionCountUI(sessionId, data.transaction_count);
        } catch (error) {
            console.error("Error overwriting session:", error);
            alert(`Error overwriting session: ${error.message}`);
        }
    }
}

export async function deleteSessionHandler(sessionId, sessionName) {
    if (confirm(`Are you sure you want to delete the session "${sessionName}" permanently?`)) {
        try {
            const data = await api.deleteSessionApi(sessionId);
            console.log("Session deleted:", data);
            await loadSessionsHandler(); // Refresh list
        } catch (error) {
            console.error("Error deleting session:", error);
            alert(`Error deleting session: ${error.message}`);
        }
    }
}