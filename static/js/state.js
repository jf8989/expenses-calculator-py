// static/js/state.js

// Reads transaction data directly from the rendered table in the DOM
export function getTransactionDataFromDOM() {
    const transactions = [];
    const rows = document.querySelectorAll("#transactions-table tbody tr");

    rows.forEach((row) => {
        if (row.style.display === 'none') return; // Skip filtered rows

        const cells = row.cells;
        if (cells.length < 5) return; // Basic check for valid row

        const amountText = cells[3].textContent.trim();
        const currencyAndAmount = amountText.split(/\s+/);
        let currency = document.getElementById("main-currency").value; // Default
        let amount = NaN;

        if (currencyAndAmount.length >= 2) {
            currency = currencyAndAmount[0];
            amount = parseFloat(currencyAndAmount[1].replace(/,/g, ''));
        } else {
            amount = parseFloat(amountText.replace(/[^\d.-]/g, ''));
        }

        if (isNaN(amount)) {
            console.warn("Skipping row due to invalid amount in DOM:", row);
            return;
        }

        transactions.push({
            id: parseInt(row.dataset.transactionId, 10),
            date: cells[1].textContent,
            description: cells[2].textContent,
            amount: amount,
            currency: currency,
            assigned_to: Array.from(
                row.querySelectorAll(".checkbox-container input:checked")
            ).map((cb) => cb.value),
        });
    });
    return transactions;
}

// Reads participant names directly from the rendered list in the DOM
export function getParticipantsFromDOM() {
    // Prefer using the globally stored list if available, otherwise fallback to DOM
    if (window.currentParticipants) {
        return window.currentParticipants;
    }
    // Fallback: Read from the participant list UI
    const participants = [];
    const items = document.querySelectorAll("#participants-list li");
    items.forEach(item => {
        // Extract text content, excluding the button text
        const participantName = item.firstChild?.textContent?.trim();
        if (participantName) {
            participants.push(participantName);
        }
    });
    return participants;
}