// static/js/transactions.js

// Function to parse transactions from text input
export function parseTransactions(text) {
    const lines = text.split("\n");
    return lines
        .map((line) => {
            const match = line.match(
                /(\d{2}\/\d{2}\/\d{4})\s*:\s*(.+?)\s*-\s*([-\d.,]+)(?:\s*\(?.*\)?)?$/
            );
            if (match) {
                const [, date, description, amountStr] = match;
                // Robust amount parsing (handle commas, ensure float)
                const amount = parseFloat(amountStr.replace(/,/g, '')); // Remove commas before parsing
                if (isNaN(amount)) {
                    console.warn(`Could not parse amount: "${amountStr}" from line: "${line}"`);
                    return null; // Skip if amount is invalid
                }
                console.log(`Parsed transaction - Date: ${date}, Description: ${description.trim()}, Amount: ${amount}`);
                return {
                    date,
                    description: description.trim(),
                    amount,
                    assigned_to: [], // Default assignment
                };
            }
            return null;
        })
        .filter((t) => t !== null);
}


// Function to find assignment history based on description key
export function findSimilarTransaction(description, historyObject) {
    if (!description || typeof description !== 'string' || !historyObject) {
        return null;
    }
    const lowerCaseDescription = description.toLowerCase().trim();
    for (const key in historyObject) {
        if (Object.prototype.hasOwnProperty.call(historyObject, key) && key.toLowerCase().trim() === lowerCaseDescription) {
            return [...historyObject[key]]; // Return copy
        }
    }
    return null; // No direct match found
}