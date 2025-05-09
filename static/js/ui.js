// static/js/ui.js
import { handleExportSessionPdf } from './export.js'; // Keep export handler import
import * as handlers from './handlers.js'; // Import handlers
import * as state from './state.js'; // Import state module
import { log, warn, error } from './logger.js'; // Assuming logger utility

// --- Auth UI ---
export function showLoggedInState(userEmail) {
    log('UI:showLoggedInState', `Displaying logged-in state for ${userEmail}`);
    const userStatusDiv = document.getElementById("user-status");
    const userEmailSpan = document.getElementById("user-email-display");
    const authSection = document.getElementById("auth-section");
    const appContent = document.getElementById("app-content");

    if (userEmailSpan) {
        userEmailSpan.textContent = userEmail || 'User';
    }
    if (userStatusDiv) {
        userStatusDiv.style.display = "flex"; // Use flex as defined in CSS
    }

    if (authSection) { // Guard added
        authSection.style.display = "none";
    } else {
        warn('UI:showLoggedInState', 'Element with ID "auth-section" not found.');
    }

    if (appContent) { // Guard added
        appContent.style.display = "block";
    } else {
        warn('UI:showLoggedInState', 'Element with ID "app-content" not found.');
    }
}

export function showLoggedOutState() {
    log('UI:showLoggedOutState', 'Displaying logged-out state.');
    const userStatusDiv = document.getElementById("user-status");
    const authSection = document.getElementById("auth-section");
    const appContent = document.getElementById("app-content");

    if (userStatusDiv) {
        userStatusDiv.style.display = "none";
    }

    if (authSection) { // Guard added
        authSection.style.display = "block"; // Or 'flex' depending on CSS
    } else {
        warn('UI:showLoggedOutState', 'Element with ID "auth-section" not found.');
    }

    if (appContent) { // Guard added
        appContent.style.display = "none";
    } else {
        warn('UI:showLoggedOutState', 'Element with ID "app-content" not found.');
    }
    clearAuthError(); // Clear any previous auth errors (ensure clearAuthError is defined and handles missing elements too)
}

export function showAuthError(message) {
    const errorDiv = document.getElementById("auth-error");
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = "block";
    }
}

export function clearAuthError() {
    const errorDiv = document.getElementById("auth-error");
    if (errorDiv) {
        errorDiv.textContent = '';
        errorDiv.style.display = "none";
    }
}

// --- Loading Indicator ---
export function showLoading(isLoading, message = 'Loading...') {
    const indicator = document.getElementById("loading-indicator");
    if (!indicator) return;

    if (isLoading) {
        log('UI:showLoading', `Showing loading: ${message}`);
        const messageElement = indicator.querySelector('p');
        if (messageElement) messageElement.textContent = message;
        indicator.style.display = 'flex'; // Or 'block' depending on styling
    } else {
        log('UI:showLoading', 'Hiding loading indicator.');
        indicator.style.display = 'none';
    }
}


// --- Currency UI ---
// Keep populateCurrencyOptions and applyCurrencyPreferences as they operate on DOM elements directly
export function populateCurrencyOptions(currencies, mainSelect, secondarySelect) {
    // Clear existing options first
    mainSelect.innerHTML = '';
    secondarySelect.innerHTML = '';
    currencies.forEach((currency) => {
        const option = new Option(`${currency.name} (${currency.symbol})`, currency.code);
        mainSelect.add(option.cloneNode(true));
        secondarySelect.add(option);
    });
    log('UI:populateCurrencyOptions', 'Populated currency dropdowns.');
}

export function applyCurrencyPreferences(mainPref, secondaryPref, mainSelect, secondarySelect) {
    if (mainPref) mainSelect.value = mainPref;
    if (secondaryPref) secondarySelect.value = secondaryPref;
    log('UI:applyCurrencyPreferences', `Applied currency prefs: Main=${mainSelect.value}, Secondary=${secondarySelect.value}`);
}

// --- Participants UI ---
export function updateParticipantsListUI() {
    const participants = state.getActiveParticipants();
    const tbody = document.getElementById("participants-list");
    if (!tbody) return;

    tbody.innerHTML = "";
    participants.forEach((p) => {
        const li = document.createElement("li");

        /* star button */
        const starBtn = document.createElement("button");
        const isStar = state.isParticipantFrequent(p);
        starBtn.innerHTML = isStar ? "★" : "☆";
        starBtn.title = isStar ? "Unmark as frequent" : "Mark as frequent";
        starBtn.className = "btn btn-link btn-sm participant-star-btn";
        starBtn.onclick = () => handlers.toggleParticipantFrequentHandler(p);
        li.appendChild(starBtn);

        /* name */
        const nameSpan = document.createElement("span");
        nameSpan.textContent = p;
        nameSpan.classList.add("participant-name");
        li.appendChild(nameSpan);

        /* delete */
        const delBtn = document.createElement("button");
        delBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        delBtn.className = "btn btn-danger btn-sm participant-delete-btn";
        delBtn.title = `Delete ${p}`;
        delBtn.onclick = () => handlers.deleteParticipantHandler(p);
        li.appendChild(delBtn);

        tbody.appendChild(li);
    });

    updateParticipantsAutocomplete();   // ★ keep datalist fresh
}

function updateParticipantsAutocomplete() {
    const dl = document.getElementById("participants-autocomplete");
    if (!dl) return;
    dl.innerHTML = "";
    state.getFrequentParticipants().forEach(name => {
        const opt = document.createElement("option");
        opt.value = name;
        dl.appendChild(opt);
    });
}

export function clearParticipantsList() {
    const participantsList = document.getElementById("participants-list");
    if (participantsList) participantsList.innerHTML = "";
    log('UI:clearParticipantsList', 'Cleared participants list UI.');
}

// --- Transactions UI ---

/**
 * Re-renders the entire transactions table based on the current active transactions in state.
 */
export function refreshTransactionsTableUI() {
    const transactions = state.getActiveTransactions(); // Get from state
    // const participants = state.getParticipants(); // OLD - CAUSES ERROR
    const participants = state.getActiveParticipants(); // CORRECTED: Use participants from the active session
    const currencies = state.getActiveCurrencies(); // Get from state
    log('UI:refreshTransactionsTableUI', `Refreshing transactions table with ${transactions.length} transactions. Active participants count: ${participants.length}`);

    const table = document.getElementById("transactions-table");
    if (!table) return;
    const tbody = table.querySelector("tbody");
    tbody.innerHTML = ""; // Clear existing rows

    const headers = Array.from(table.querySelectorAll("thead th")).map(th => th.textContent.trim());

    transactions.forEach((transaction, index) => {
        const row = tbody.insertRow();
        row.dataset.transactionIndex = index;

        row.insertCell().textContent = index + 1;
        row.cells[0].setAttribute('data-label', headers[0] || '#');
        row.insertCell().textContent = transaction.date;
        row.cells[1].setAttribute('data-label', headers[1] || 'Date');
        row.insertCell().textContent = transaction.description;
        row.cells[2].setAttribute('data-label', headers[2] || 'Description');

        const amountCell = row.insertCell();
        amountCell.classList.add("amount-cell");
        amountCell.setAttribute('data-label', headers[3] || 'Amount');
        renderAmountCellContent(amountCell, index, currencies.main, currencies.secondary);

        const assignedCell = row.insertCell();
        assignedCell.setAttribute('data-label', headers[4] || 'Assigned To');
        // Pass index and the (now correct) active session's participants list
        renderCheckboxContainer(assignedCell, index, participants);

        const actionsCell = row.insertCell();
        actionsCell.setAttribute('data-label', headers[5] || 'Actions');
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "btn btn-danger btn-sm";
        deleteBtn.onclick = () => {
            // Ensure transaction object is fetched fresh from state if description is used in confirm
            const currentTransaction = state.getActiveTransactions()[index];
            if (confirm(`Delete transaction: ${currentTransaction.date} - ${currentTransaction.description}?`)) {
                handlers.deleteTransactionHandler(index);
            }
        };
        actionsCell.appendChild(deleteBtn);
    });
    updateRowNumbersUI();
    filterTransactionsUI();
}


export function clearTransactionsTable() {
    const tbody = document.querySelector("#transactions-table tbody");
    if (tbody) tbody.innerHTML = "";
    log('UI:clearTransactionsTable', 'Cleared transactions table UI.');
}

// Modified to accept index
function renderAmountCellContent(amountCell, transactionIndex, mainCurrency, secondaryCurrency) {
    amountCell.innerHTML = ''; // Clear the cell first
    const transaction = state.getActiveTransactions()[transactionIndex]; // Get transaction from state using index
    if (!transaction) return; // Safety check

    const amount = Number(transaction.amount);
    const displayCurrency = transaction.currency || mainCurrency;

    // Amount Span
    const amountSpan = document.createElement("span");
    amountSpan.classList.add("amount-display");
    amountSpan.textContent = `${displayCurrency} ${amount.toFixed(2)}`;
    amountSpan.style.cursor = "pointer";
    amountSpan.title = "Click to toggle currency";
    amountSpan.addEventListener("click", (event) => {
        event.stopPropagation();
        const newCurrency = (displayCurrency === mainCurrency) ? secondaryCurrency : mainCurrency;
        // Call handler with index and new currency
        handlers.toggleCurrencyHandler(transactionIndex, newCurrency);
        // Update UI immediately (optimistic) - state change will persist it
        amountSpan.textContent = `${newCurrency} ${amount.toFixed(2)}`;
    });

    // Edit Button
    const editBtn = document.createElement("button");
    editBtn.innerHTML = "✎";
    editBtn.classList.add("edit-amount-btn", "btn", "btn-outline-secondary", "btn-sm");
    editBtn.title = "Edit amount";
    editBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        // Pass index
        switchToEditInput(amountCell, transactionIndex, mainCurrency, secondaryCurrency);
    });

    amountCell.appendChild(amountSpan);
    amountCell.appendChild(editBtn);
}

// Modified to accept index
function switchToEditInput(amountCell, transactionIndex, mainCurrency, secondaryCurrency) {
    const transaction = state.getActiveTransactions()[transactionIndex]; // Get from state
    if (!transaction) return;
    const originalAmount = Number(transaction.amount);
    amountCell.innerHTML = ''; // Clear span and button

    const input = document.createElement("input");
    input.type = "number";
    input.value = originalAmount.toFixed(2);
    input.step = "0.01";
    input.classList.add("form-control", "form-control-sm", "d-inline-block", "w-auto");

    amountCell.appendChild(input);
    input.focus();
    input.select();

    const finishEditing = async (saveChanges) => {
        if (saveChanges) {
            const newAmountStr = input.value;
            const newAmount = parseFloat(newAmountStr);

            if (isNaN(newAmount)) {
                alert("Invalid amount entered.");
                renderAmountCellContent(amountCell, transactionIndex, mainCurrency, secondaryCurrency); // Revert UI
                return;
            }

            if (newAmount.toFixed(2) !== originalAmount.toFixed(2)) {
                try {
                    // Call handler with index and new amount
                    await handlers.handleTransactionAmountUpdate(transactionIndex, newAmount);
                    // State change is saved, now re-render the cell content
                    renderAmountCellContent(amountCell, transactionIndex, mainCurrency, secondaryCurrency);
                } catch (error) {
                    error('UI:switchToEditInput', "Error updating amount via handler:", error);
                    alert(`Error updating amount: ${error.message}`);
                    renderAmountCellContent(amountCell, transactionIndex, mainCurrency, secondaryCurrency); // Revert UI on error
                }
            } else {
                renderAmountCellContent(amountCell, transactionIndex, mainCurrency, secondaryCurrency); // No change
            }
        } else {
            renderAmountCellContent(amountCell, transactionIndex, mainCurrency, secondaryCurrency); // Revert (Escape)
        }
    };

    // Use setTimeout for blur to allow click event on potential save button (if added later)
    input.addEventListener("blur", () => setTimeout(() => finishEditing(true), 150));
    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") { event.preventDefault(); finishEditing(true); }
        else if (event.key === "Escape") { event.preventDefault(); finishEditing(false); }
    });
}

// Modified to accept index
function renderCheckboxContainer(cell, transactionIndex, participants) {
    const transaction = state.getActiveTransactions()[transactionIndex]; // Get from state
    if (!transaction) return;

    const checkboxContainer = document.createElement("div");
    checkboxContainer.className = "checkbox-container";
    const assignedTo = Array.isArray(transaction.assigned_to) ? transaction.assigned_to : [];
    const fullList = [...new Set([...participants, ...assignedTo])];

    fullList.forEach((participant) => {
        const checkboxLabel = document.createElement("label");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = participant;
        checkbox.checked = assignedTo.includes(participant);
        checkbox.addEventListener("change", () => {
            // Get current assignments from the container's checkboxes
            const currentAssignments = Array.from(
                checkboxContainer.querySelectorAll("input:checked")
            ).map((cb) => cb.value);
            // Call handler with index and new assignment list
            handlers.updateTransactionAssignmentHandler(transactionIndex, currentAssignments);
        });
        checkboxLabel.appendChild(checkbox);
        checkboxLabel.appendChild(document.createTextNode(participant));
        checkboxContainer.appendChild(checkboxLabel);
    });
    cell.appendChild(checkboxContainer);
}

// Keep filterTransactionsUI and updateRowNumbersUI as they operate on DOM
export function filterTransactionsUI(searchTerm = '') {
    const tableRows = document.querySelectorAll("#transactions-table tbody tr");
    tableRows.forEach((row) => {
        const date = row.cells[1]?.textContent.toLowerCase() || '';
        const description = row.cells[2]?.textContent.toLowerCase() || '';
        const amount = row.cells[3]?.textContent.toLowerCase() || '';
        const transactionInfo = `${date} ${description} ${amount}`;
        row.style.display = transactionInfo.includes(searchTerm) ? "" : "none";
    });
    updateRowNumbersUI();
}

function updateRowNumbersUI() {
    const visibleRows = document.querySelectorAll("#transactions-table tbody tr:not([style*='display: none'])");
    visibleRows.forEach((row, index) => {
        if (row.cells[0]) {
            row.cells[0].textContent = index + 1;
        }
    });
}

// Keep add/remove participant checkbox functions as they modify existing DOM rows
export function addParticipantToTransactionCheckboxes(newParticipant) {
    const checkboxContainers = document.querySelectorAll(".checkbox-container");
    checkboxContainers.forEach((container) => {
        // Check if participant checkbox already exists
        if (!container.querySelector(`input[value="${newParticipant}"]`)) {
            const checkboxLabel = document.createElement("label");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = newParticipant;
            checkbox.addEventListener("change", () => {
                const row = container.closest('tr');
                const transactionIndex = parseInt(row?.dataset.transactionIndex, 10);
                if (!isNaN(transactionIndex)) {
                    const currentAssignments = Array.from(
                        container.querySelectorAll("input:checked")
                    ).map((cb) => cb.value);
                    handlers.updateTransactionAssignmentHandler(transactionIndex, currentAssignments);
                } else {
                    warn("UI:addParticipantToTransactionCheckboxes", "Could not find transaction index for new checkbox.");
                }
            });
            checkboxLabel.appendChild(checkbox);
            checkboxLabel.appendChild(document.createTextNode(newParticipant));
            container.appendChild(checkboxLabel);
        }
    });
}

export function removeParticipantFromTransactionCheckboxes(participant) {
    const checkboxContainers = document.querySelectorAll(".checkbox-container");
    checkboxContainers.forEach((container) => {
        const checkboxToRemove = container.querySelector(`input[value="${participant}"]`);
        if (checkboxToRemove) {
            checkboxToRemove.parentElement.remove(); // Remove the label containing the checkbox
        }
    });
}

// --- Summary UI ---
// Modified to get data from state
export function updateSummaryTableUI() {
    const transactions = state.getActiveTransactions(); // Get from state
    let participants = state.getActiveParticipants();
    const extra = new Set();
    transactions.forEach(t => {
        (Array.isArray(t.assigned_to) ? t.assigned_to : []).forEach(p => { if (!participants.includes(p)) extra.add(p); });
    });
    participants = [...participants, ...extra];

    const currencies = state.getActiveCurrencies(); // Get from state
    const mainCurrency = currencies.main;
    const secondaryCurrency = currencies.secondary;

    log('UI:updateSummaryTableUI', 'Updating summary table UI with state data.');

    const totals = {};
    if (!Array.isArray(participants)) {
        error("UI:updateSummaryTableUI", "Participants data is not a valid array.");
        participants = [];
    }
    participants.forEach(p => { totals[p] = { [mainCurrency]: 0, [secondaryCurrency]: 0 }; });

    transactions.forEach((transaction) => {
        if (isNaN(transaction.amount)) return;
        const assignedTo = Array.isArray(transaction.assigned_to) ? transaction.assigned_to : [];
        if (assignedTo.length > 0) {
            const share = transaction.amount / assignedTo.length;
            const transactionCurrency = transaction.currency || mainCurrency;
            assignedTo.forEach((participant) => {
                if (totals[participant]) {
                    if (transactionCurrency === mainCurrency) {
                        totals[participant][mainCurrency] += share;
                    } else if (transactionCurrency === secondaryCurrency) {
                        totals[participant][secondaryCurrency] += share;
                    } else {
                        // Handle transactions in currencies other than main/secondary if needed
                        // For now, add to main currency as fallback
                        warn(`UI:updateSummaryTableUI`, `Transaction currency ${transactionCurrency} not main/secondary. Adding to main.`);
                        totals[participant][mainCurrency] += share;
                    }
                } else {
                    warn(`UI:updateSummaryTableUI`, `Participant "${participant}" from transaction not found in participant list for summary.`);
                }
            });
        }
    });

    const summaryTable = document.getElementById("summary-table");
    if (!summaryTable) return;
    const tbody = summaryTable.querySelector("tbody");
    if (!tbody) return;
    tbody.innerHTML = ""; // Clear existing rows

    let grandTotal = { [mainCurrency]: 0, [secondaryCurrency]: 0 };

    participants.forEach(participant => {
        const amounts = totals[participant] || { [mainCurrency]: 0, [secondaryCurrency]: 0 };
        const row = tbody.insertRow();
        row.insertCell().textContent = participant;
        row.insertCell().textContent = `${mainCurrency} ${amounts[mainCurrency].toFixed(2)}`;
        row.insertCell().textContent = `${secondaryCurrency} ${amounts[secondaryCurrency].toFixed(2)}`;
        grandTotal[mainCurrency] += amounts[mainCurrency];
        grandTotal[secondaryCurrency] += amounts[secondaryCurrency];
    });

    // Add total row
    const totalRow = tbody.insertRow();
    totalRow.classList.add("summary-total-row");
    totalRow.insertCell().textContent = "TOTAL";
    totalRow.insertCell().textContent = `${mainCurrency} ${grandTotal[mainCurrency].toFixed(2)}`;
    totalRow.insertCell().textContent = `${secondaryCurrency} ${grandTotal[secondaryCurrency].toFixed(2)}`;
}

export function clearSummaryTable() {
    const tbody = document.querySelector("#summary-table tbody");
    if (tbody) tbody.innerHTML = "";
    log('UI:clearSummaryTable', 'Cleared summary table UI.');
}


// --- Sessions UI ---
// Modified to get data from state
export function updateSessionsTableUI() {
    const sessions = state.getSessions(); // Get from state
    log('UI:updateSessionsTableUI', 'Updating sessions table UI with state data:', sessions);

    const table = document.getElementById("sessions-table");
    if (!table) return;
    const tbody = table.querySelector("tbody");
    tbody.innerHTML = "";

    if (!sessions || sessions.length === 0) {
        const row = tbody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 4;
        cell.textContent = "No saved sessions found";
        cell.style.textAlign = "center";
        cell.style.fontStyle = "italic";
        return;
    }

    // Sort sessions by name or date? Let's sort by name for consistency
    sessions.sort((a, b) => a.name.localeCompare(b.name));

    sessions.forEach(session => {
        const row = tbody.insertRow();
        row.dataset.sessionId = session.id; // Use Firestore document ID

        // Format date (use lastUpdatedAt or createdAt?) Let's use lastUpdatedAt for relevance
        let formattedDate = "N/A";
        try {
            // Timestamps from state should be ISO strings
            const date = session.lastUpdatedAt ? new Date(session.lastUpdatedAt) : (session.createdAt ? new Date(session.createdAt) : null);
            if (date && !isNaN(date)) {
                formattedDate = date.toLocaleDateString(undefined, {
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: 'numeric', minute: '2-digit', hour12: true
                });
            }
        } catch (e) {
            warn('UI:updateSessionsTableUI', `Error formatting date for session ${session.id}`, e);
        }


        row.insertCell().textContent = session.name;
        row.insertCell().textContent = formattedDate; // Display formatted date
        const countCell = row.insertCell();
        // Calculate count from transactions array length
        countCell.textContent = Array.isArray(session.transactions) ? session.transactions.length : 0;
        countCell.id = `session-count-${session.id}`; // Keep ID if needed? Maybe not.

        const actionsCell = row.insertCell();
        actionsCell.style.whiteSpace = "nowrap";

        // Buttons (using handlers) - Pass session ID
        const loadBtn = createButton('<i class="fas fa-folder-open"></i> Load', 'btn-success', () => handlers.loadSessionHandler(session.id), "Load this session into active editor");
        const overwriteBtn = createButton('<i class="fas fa-save"></i> Save', 'btn-warning', () => handlers.overwriteSessionHandler(session.id, session.name), "Overwrite this saved session with current editor content");
        const exportBtn = createButton('<i class="fas fa-file-pdf"></i> Export', 'btn-info', () => handleExportSessionPdf(session.id, session.name), `Export session '${session.name}' as PDF`);
        const deleteBtn = createButton('<i class="fas fa-trash"></i> Delete', 'btn-danger', () => handlers.deleteSessionHandler(session.id, session.name), "Delete this saved session");

        actionsCell.appendChild(loadBtn);
        actionsCell.appendChild(overwriteBtn);
        actionsCell.appendChild(exportBtn);
        actionsCell.appendChild(deleteBtn);
    });
}

// Keep createButton helper
function createButton(html, btnClass, onClick, title) {
    const btn = document.createElement("button");
    btn.className = `btn ${btnClass} btn-sm`;
    btn.innerHTML = html;
    btn.title = title;
    btn.style.marginLeft = "5px";
    btn.onclick = onClick;
    return btn;
}

export function clearSessionsTable() {
    const tbody = document.querySelector("#sessions-table tbody");
    if (tbody) tbody.innerHTML = "";
    log('UI:clearSessionsTable', 'Cleared sessions table UI.');
}

// REMOVED updateSessionCountUI - count derived from data length

// Keep clear input functions
export function clearSessionNameInput() {
    const input = document.getElementById("session-name");
    if (input) input.value = "";
}

export function clearTransactionInput() {
    const input = document.getElementById("transactions-text");
    if (input) input.value = "";
}


// --- Combined Functions ---

/**
 * Clears all data-driven UI elements.
 */
export function clearAllDataUI() {
    log('UI:clearAllDataUI', 'Clearing all data UI elements.');
    clearParticipantsList();
    clearTransactionsTable();
    clearSessionsTable();
    clearSummaryTable();
    clearTransactionInput();
    clearSessionNameInput();
}

/**
 * Renders all main data sections based on current state.
 * Called after successful login/sync.
 */
export function renderInitialUI() {
    log('UI:renderInitialUI', 'Rendering initial UI from state.');
    updateParticipantsListUI();
    refreshTransactionsTableUI(); // Render active transactions
    updateSessionsTableUI(); // Render saved sessions
}