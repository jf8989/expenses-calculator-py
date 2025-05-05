// static/js/ui.js
import { handleExportSessionPdf } from './export.js'; // Assuming export.js is also a module
import {
    toggleCurrencyHandler,
    updateTransactionAssignmentHandler,
    deleteTransactionHandler,
    addParticipantHandler,
    deleteParticipantHandler,
    saveSessionHandler,
    loadSessionHandler,
    overwriteSessionHandler,
    deleteSessionHandler
} from './handlers.js'; // We'll create this file next

// --- Auth UI ---
export function showLoggedInState() {
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("logout-btn").style.display = "inline";
    document.getElementById("app-content").style.display = "block";
}

export function showLoggedOutState() {
    document.getElementById("auth-section").style.display = "block";
    document.getElementById("logout-btn").style.display = "none";
    document.getElementById("app-content").style.display = "none";
    // Clear sensitive data on logout
    clearParticipantsList();
    clearTransactionsTable();
    clearSessionsTable();
    clearSummaryTable();
}

// --- Currency UI ---
export function populateCurrencyOptions(currencies, mainSelect, secondarySelect) {
    currencies.forEach((currency) => {
        const option = new Option(`${currency.name} (${currency.symbol})`, currency.code);
        mainSelect.add(option.cloneNode(true));
        secondarySelect.add(option);
    });
}

export function applyCurrencyPreferences(mainPref, secondaryPref, mainSelect, secondarySelect) {
    if (mainPref) mainSelect.value = mainPref;
    if (secondaryPref) secondarySelect.value = secondaryPref;
}

// --- Participants UI ---
export function updateParticipantsListUI(participants) {
    const participantsList = document.getElementById("participants-list");
    participantsList.innerHTML = ""; // Clear existing
    participants.forEach((participant) => {
        const li = document.createElement("li");
        li.textContent = participant;
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        // Use the handler function from handlers.js
        deleteBtn.onclick = () => deleteParticipantHandler(participant);
        li.appendChild(deleteBtn);
        participantsList.appendChild(li);
    });
}

export function clearParticipantsList() {
    const participantsList = document.getElementById("participants-list");
    if (participantsList) participantsList.innerHTML = "";
}

// --- Transactions UI ---
export function updateTransactionsTableUI(transactions, participants, mainCurrency, secondaryCurrency) {
    const table = document.getElementById("transactions-table");
    const tbody = table.querySelector("tbody");
    tbody.innerHTML = ""; // Clear existing rows

    // Get headers text for data-label (important for mobile view)
    const headers = Array.from(table.querySelectorAll("thead th")).map(th => th.textContent.trim());

    transactions.forEach((transaction, index) => {
        const row = tbody.insertRow();
        row.dataset.transactionId = transaction.id; // Store transaction ID

        // --- Add data-label attributes ---
        row.insertCell().textContent = index + 1; // No label needed for #
        row.insertCell().textContent = transaction.date;
        row.cells[1].setAttribute('data-label', headers[1] || 'Date'); // Use header text or default
        row.insertCell().textContent = transaction.description;
        row.cells[2].setAttribute('data-label', headers[2] || 'Description');

        // Amount Cell (with edit functionality)
        const amountCell = row.insertCell();
        amountCell.classList.add("amount-cell");
        amountCell.setAttribute('data-label', headers[3] || 'Amount');
        renderAmountCellContent(amountCell, transaction, mainCurrency, secondaryCurrency);

        // Participant Assignment Cell
        const assignedCell = row.insertCell();
        assignedCell.setAttribute('data-label', headers[4] || 'Assigned To');
        renderCheckboxContainer(assignedCell, transaction, participants);

        // Actions Cell (Delete button)
        const actionsCell = row.insertCell();
        actionsCell.setAttribute('data-label', headers[5] || 'Actions'); // Although label is hidden via CSS
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "btn btn-danger btn-sm"; // Add classes for consistency
        deleteBtn.onclick = () => deleteTransactionHandler(transaction);
        actionsCell.appendChild(deleteBtn);
        // --- End data-label additions ---
    });
    updateRowNumbersUI(); // Update numbering after rendering
}

export function clearTransactionsTable() {
    const tbody = document.querySelector("#transactions-table tbody");
    if (tbody) tbody.innerHTML = "";
}


function renderAmountCellContent(amountCell, transaction, mainCurrency, secondaryCurrency) {
    amountCell.innerHTML = ''; // Clear the cell first

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
        // Use the handler function from handlers.js
        toggleCurrencyHandler(amountSpan, transaction, mainCurrency, secondaryCurrency);
    });

    // Edit Button
    const editBtn = document.createElement("button");
    editBtn.innerHTML = "✎";
    editBtn.classList.add("edit-amount-btn", "btn", "btn-outline-secondary", "btn-sm");
    editBtn.title = "Edit amount";
    editBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        switchToEditInput(amountCell, transaction, mainCurrency, secondaryCurrency);
    });

    amountCell.appendChild(amountSpan);
    amountCell.appendChild(editBtn);
}

function switchToEditInput(amountCell, transaction, mainCurrency, secondaryCurrency) {
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

    const finishEditing = (saveChanges) => {
        if (saveChanges) {
            const newAmountStr = input.value;
            const newAmount = parseFloat(newAmountStr);

            if (isNaN(newAmount)) {
                alert("Invalid amount entered.");
                renderAmountCellContent(amountCell, transaction, mainCurrency, secondaryCurrency); // Revert
                return;
            }

            if (newAmount.toFixed(2) !== originalAmount.toFixed(2)) {
                // Call handler (which calls API) - handler needs to be imported/available
                // For simplicity here, assume updateTransactionAmountHandler exists in handlers.js
                import('./handlers.js').then(({ updateTransactionAmountHandler }) => {
                    updateTransactionAmountHandler(transaction.id, newAmount)
                        .then(updatedTransaction => {
                            // Update the transaction object reference if needed (tricky without state management)
                            transaction.amount = updatedTransaction.new_amount;
                            renderAmountCellContent(amountCell, transaction, mainCurrency, secondaryCurrency);
                        })
                        .catch(error => {
                            console.error("Error updating amount:", error);
                            alert(`Error updating amount: ${error.message}`);
                            renderAmountCellContent(amountCell, transaction, mainCurrency, secondaryCurrency); // Revert on error
                        });
                });
            } else {
                renderAmountCellContent(amountCell, transaction, mainCurrency, secondaryCurrency); // No change
            }
        } else {
            renderAmountCellContent(amountCell, transaction, mainCurrency, secondaryCurrency); // Revert (Escape)
        }
    };

    input.addEventListener("blur", () => setTimeout(() => finishEditing(true), 150));
    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") { event.preventDefault(); finishEditing(true); }
        else if (event.key === "Escape") { event.preventDefault(); finishEditing(false); }
    });
}


function renderCheckboxContainer(cell, transaction, participants) {
    const checkboxContainer = document.createElement("div");
    checkboxContainer.className = "checkbox-container";
    const assignedTo = Array.isArray(transaction.assigned_to) ? transaction.assigned_to : [];

    participants.forEach((participant) => {
        const checkboxLabel = document.createElement("label");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = participant;
        checkbox.checked = assignedTo.includes(participant);
        checkbox.addEventListener("change", () => {
            // Use the handler function from handlers.js
            updateTransactionAssignmentHandler(transaction, checkboxContainer);
        });
        checkboxLabel.appendChild(checkbox);
        checkboxLabel.appendChild(document.createTextNode(participant));
        checkboxContainer.appendChild(checkboxLabel);
    });
    cell.appendChild(checkboxContainer);
}

export function filterTransactionsUI(searchTerm) {
    const tableRows = document.querySelectorAll("#transactions-table tbody tr");
    tableRows.forEach((row) => {
        const date = row.cells[1].textContent.toLowerCase();
        const description = row.cells[2].textContent.toLowerCase();
        const amount = row.cells[3].textContent.toLowerCase();
        const transactionInfo = `${date} ${description} ${amount}`;
        row.style.display = transactionInfo.includes(searchTerm) ? "" : "none";
    });
    updateRowNumbersUI();
}

function updateRowNumbersUI() {
    const visibleRows = document.querySelectorAll("#transactions-table tbody tr:not([style*='display: none'])");
    visibleRows.forEach((row, index) => {
        row.cells[0].textContent = index + 1;
    });
}

export function addParticipantToTransactionCheckboxes(newParticipant) {
    const checkboxContainers = document.querySelectorAll(".checkbox-container");
    checkboxContainers.forEach((container) => {
        if (!container.querySelector(`input[value="${newParticipant}"]`)) {
            const checkboxLabel = document.createElement("label");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = newParticipant;
            // Need the transaction object associated with this container to call the handler correctly
            // This highlights complexity - might need to refetch transaction data or store it better
            // For now, let's assume the handler can get the ID from the row
            checkbox.addEventListener("change", () => {
                const row = container.closest('tr');
                if (row && row.dataset.transactionId) {
                    // We need the full transaction object ideally, or reconstruct minimally
                    const minimalTransaction = { id: parseInt(row.dataset.transactionId, 10) };
                    updateTransactionAssignmentHandler(minimalTransaction, container);
                } else {
                    console.error("Could not find transaction ID for checkbox update");
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
            checkboxToRemove.parentElement.remove();
        }
    });
}

// --- Summary UI ---
export function updateSummaryTableUI(transactions, participants, mainCurrency, secondaryCurrency) {
    const totals = {};
    // Ensure participants is an array before proceeding
    if (!Array.isArray(participants)) {
        console.error("updateSummaryTableUI called without a valid participants array.");
        participants = []; // Default to empty to avoid errors
    }
    participants.forEach(p => { totals[p] = { [mainCurrency]: 0, [secondaryCurrency]: 0 }; });

    transactions.forEach((transaction) => {
        if (isNaN(transaction.amount)) return;
        const assignedTo = Array.isArray(transaction.assigned_to) ? transaction.assigned_to : [];
        if (assignedTo.length > 0) {
            const share = transaction.amount / assignedTo.length;
            const transactionCurrency = transaction.currency || mainCurrency;
            assignedTo.forEach((participant) => {
                if (totals[participant]) { // Check participant exists in totals
                    if (transactionCurrency === mainCurrency) {
                        totals[participant][mainCurrency] += share;
                    } else if (transactionCurrency === secondaryCurrency) {
                        totals[participant][secondaryCurrency] += share;
                    } else {
                        console.warn(`Unrecognized currency: ${transactionCurrency}, using main currency.`);
                        totals[participant][mainCurrency] += share;
                    }
                } else {
                    console.warn(`Participant "${participant}" from transaction not found in participant list for summary.`);
                }
            });
        }
    });

    const summaryTable = document.getElementById("summary-table");
    if (!summaryTable) return; // Exit if table not found
    const tbody = summaryTable.querySelector("tbody");
    if (!tbody) return; // Exit if tbody not found
    tbody.innerHTML = ""; // Clear existing rows

    let grandTotal = { [mainCurrency]: 0, [secondaryCurrency]: 0 };

    // Use the participants list to ensure order and inclusion
    participants.forEach(participant => {
        const amounts = totals[participant] || { [mainCurrency]: 0, [secondaryCurrency]: 0 }; // Default if participant had no expenses
        const row = tbody.insertRow();
        row.insertCell().textContent = participant;
        row.insertCell().textContent = `${mainCurrency} ${amounts[mainCurrency].toFixed(2)}`;
        row.insertCell().textContent = `${secondaryCurrency} ${amounts[secondaryCurrency].toFixed(2)}`;
        grandTotal[mainCurrency] += amounts[mainCurrency];
        grandTotal[secondaryCurrency] += amounts[secondaryCurrency];
    });


    // Add total row - REMOVE INLINE STYLES, LET CSS HANDLE IT
    const totalRow = tbody.insertRow();
    // totalRow.style.fontWeight = "bold"; // Let CSS handle font-weight
    // totalRow.style.borderTop = "2px solid #e0e0e0"; // REMOVED - Let CSS handle border
    // totalRow.style.backgroundColor = "#f8f9fa"; // REMOVED - Let CSS handle background
    // Add a class instead if specific styling beyond last-child is needed
    totalRow.classList.add("summary-total-row"); // Add class for potential CSS targeting

    totalRow.insertCell().textContent = "TOTAL";
    totalRow.insertCell().textContent = `${mainCurrency} ${grandTotal[mainCurrency].toFixed(2)}`;
    totalRow.insertCell().textContent = `${secondaryCurrency} ${grandTotal[secondaryCurrency].toFixed(2)}`;
}

export function clearSummaryTable() {
    const tbody = document.querySelector("#summary-table tbody");
    if (tbody) tbody.innerHTML = "";
}


// --- Sessions UI ---
export function updateSessionsTableUI(sessions) {
    const table = document.getElementById("sessions-table");
    const tbody = table.querySelector("tbody");
    tbody.innerHTML = "";

    if (!sessions || sessions.length === 0) {
        const row = tbody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 4;
        cell.textContent = "No saved sessions";
        cell.style.textAlign = "center";
        cell.style.fontStyle = "italic";
        return;
    }

    sessions.forEach(session => {
        const row = tbody.insertRow();
        row.dataset.sessionId = session.id;

        const date = new Date(session.created_at);
        const formattedDate = date.toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: 'numeric', minute: '2-digit', hour12: true
        });

        row.insertCell().textContent = session.name;
        row.insertCell().textContent = formattedDate;
        const countCell = row.insertCell();
        countCell.textContent = session.transaction_count;
        countCell.id = `session-count-${session.id}`; // Keep ID for overwrite update

        const actionsCell = row.insertCell();
        actionsCell.style.whiteSpace = "nowrap";

        // Buttons (using handlers)
        const loadBtn = createButton('<i class="fas fa-folder-open"></i> Load', 'btn-success', () => loadSessionHandler(session.id), "Load this session");
        const overwriteBtn = createButton('<i class="fas fa-save"></i> Save', 'btn-warning', () => overwriteSessionHandler(session.id, session.name), "Overwrite this session");
        const exportBtn = createButton('<i class="fas fa-file-pdf"></i> Export', 'btn-info', () => handleExportSessionPdf(session.id, session.name), `Export session '${session.name}' as PDF`);
        const deleteBtn = createButton('<i class="fas fa-trash"></i> Delete', 'btn-danger', () => deleteSessionHandler(session.id, session.name), "Delete this session");

        actionsCell.appendChild(loadBtn);
        actionsCell.appendChild(overwriteBtn);
        actionsCell.appendChild(exportBtn);
        actionsCell.appendChild(deleteBtn);
    });
}

function createButton(html, btnClass, onClick, title) {
    const btn = document.createElement("button");
    btn.className = `btn ${btnClass} btn-sm`;
    btn.innerHTML = html;
    btn.title = title;
    btn.style.marginLeft = "5px"; // Add spacing consistently
    btn.onclick = onClick;
    return btn;
}

export function clearSessionsTable() {
    const tbody = document.querySelector("#sessions-table tbody");
    if (tbody) tbody.innerHTML = "";
}

export function updateSessionCountUI(sessionId, count) {
    const countCell = document.getElementById(`session-count-${sessionId}`);
    if (countCell && count !== undefined) {
        countCell.textContent = count;
    }
}

export function clearSessionNameInput() {
    const input = document.getElementById("session-name");
    if (input) input.value = "";
}

export function clearTransactionInput() {
    const input = document.getElementById("transactions-text");
    if (input) input.value = "";
}