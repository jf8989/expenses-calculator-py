// static/js/transactions.js
import { log, warn } from './logger.js'; // Import logger

// Function to parse transactions from text input
export function parseTransactions(text) {
    log('Transactions:parse', `Parsing transaction text: ${text.substring(0, 50)}...`); // Log added
    const lines = text.split("\n");
    const parsed = lines
        .map((line, index) => {
            const match = line.match(
                /(\d{2}\/\d{2}\/\d{4})\s*:\s*(.+?)\s*-\s*([-\d.,]+)(?:\s*\(?.*\)?)?$/
            );
            if (match) {
                const [, date, description, amountStr] = match;
                const amount = parseFloat(amountStr.replace(/,/g, ''));
                if (isNaN(amount)) {
                    warn('Transactions:parse', `Skipped line ${index + 1} due to invalid amount: "${amountStr}" from line: "${line}"`); // Use logger
                    return null;
                }
                // log('Transactions:parse', `Parsed line ${index + 1}: Date=${date}, Desc=${description.trim()}, Amt=${amount}`); // Optional: Log every successful parse
                return {
                    date,
                    description: description.trim(),
                    amount,
                    assigned_to: [], // Default assignment
                    currency: '', // Default currency (maybe get from state later?)
                };
            } else if (line.trim()) { // Log lines that aren't empty but didn't match
                warn('Transactions:parse', `Skipped line ${index + 1} due to format mismatch: "${line}"`);
            }
            return null;
        })
        .filter((t) => t !== null);
    log('Transactions:parse', `Successfully parsed ${parsed.length} transactions.`); // Log added
    return parsed;
}

// REMOVED findSimilarTransaction - History logic removed for now