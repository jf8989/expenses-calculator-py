// static/js/export.js
import * as state from './state.js'; // Import state module
import { log, warn, error } from './logger.js'; // Assuming logger utility

// Use window.jspdf to access the library loaded via CDN
const { jsPDF } = window.jspdf;

/**
 * Generates and triggers download of a PDF report for a specific session using jsPDF.
 * Retrieves data from the application state (IndexedDB cache).
 * @param {string} sessionId - The Firestore ID of the session to export.
 * @param {string} sessionName - The name of the session (for logging and filename).
 */
export async function handleExportSessionPdf(sessionId, sessionName) {
    if (!sessionId) {
        error("Export:handleExportSessionPdf", "Export called without a session ID.");
        alert("Cannot export: Session ID is missing.");
        return;
    }
    log("Export:handleExportSessionPdf", `Generating client-side PDF for session ID: ${sessionId}, Name: ${sessionName}.`);

    // --- Define Colors (RGB arrays) ---
    const primaryColor = [52, 152, 219]; // #3498db
    const headerBgColor = [52, 73, 94]; // #34495e
    const whiteColor = [255, 255, 255];
    const lightGrayRow = [242, 242, 242]; // #f2f2f2
    const footerGray = [119, 119, 119]; // #777
    const tableBorderGray = [221, 221, 221]; // #ddd

    try {
        // --- 1. Get Data from State ---
        log("Export:handleExportSessionPdf", `Retrieving session data for ${sessionId} from state.`);
        const sessionData = state.getSessionById(sessionId);

        if (!sessionData) {
            error("Export:handleExportSessionPdf", `Session data for ID ${sessionId} not found in state.`);
            alert(`Cannot export: Session data for "${sessionName}" not found locally. Please ensure data is synced.`);
            return;
        }

        // Use data snapshotted within the session object
        const transactions = sessionData.transactions || [];
        const participants = sessionData.participants || []; // Participants relevant at time of save
        const currencies = sessionData.currencies || state.getActiveCurrencies(); // Use session's currencies or fallback to current active
        const mainCurrency = currencies.main;
        const secondaryCurrency = currencies.secondary;

        log("Export:handleExportSessionPdf", `Data retrieved: ${transactions.length} transactions, ${participants.length} participants.`);

        // --- 2. Calculate Summary ---
        log("Export:handleExportSessionPdf", `Calculating summary for ${participants.length} participants.`);
        const summary = {};
        participants.forEach(p => { summary[p] = { [mainCurrency]: 0.0, [secondaryCurrency]: 0.0 }; });
        const grandTotal = { [mainCurrency]: 0.0, [secondaryCurrency]: 0.0 };

        transactions.forEach(t => {
            // Ensure assigned_to is an array
            const assignedList = Array.isArray(t.assigned_to) ? t.assigned_to.filter(p => p && p.trim()) : [];

            if (assignedList.length > 0) {
                const amount = parseFloat(t.amount);
                if (isNaN(amount)) {
                    warn("Export:handleExportSessionPdf", `Skipping transaction due to invalid amount:`, t);
                    return;
                }
                const share = amount / assignedList.length;
                const txnCurrency = t.currency || mainCurrency; // Use transaction currency or default to main

                assignedList.forEach(participant => {
                    if (summary[participant]) {
                        // Add share to the correct currency bucket
                        if (txnCurrency === mainCurrency) {
                            summary[participant][mainCurrency] += share;
                        } else if (txnCurrency === secondaryCurrency) {
                            summary[participant][secondaryCurrency] += share;
                        } else {
                            // Handle other currencies if necessary - add to main as fallback
                            warn("Export:handleExportSessionPdf", `Transaction currency ${txnCurrency} not main/secondary. Adding to main.`);
                            summary[participant][mainCurrency] += share;
                        }
                    } else {
                        warn("Export:handleExportSessionPdf", `Participant "${participant}" in transaction not found in session's participant list.`);
                    }
                });
            }
        });
        // Calculate grand totals after processing all transactions
        Object.values(summary).forEach(totals => {
            grandTotal[mainCurrency] += totals[mainCurrency];
            grandTotal[secondaryCurrency] += totals[secondaryCurrency];
        });
        log("Export:handleExportSessionPdf", 'Summary calculated:', summary);
        log("Export:handleExportSessionPdf", 'Grand totals:', grandTotal);


        // --- 3. Generate PDF ---
        log("Export:handleExportSessionPdf", 'Generating PDF document...');
        const doc = new jsPDF();
        const generationTime = new Date().toLocaleString();
        const title = `Expense Split Report: ${sessionName}`;
        const footerText = `Exported on ${generationTime}`;
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 14;
        let currentY = 15;

        // --- PDF Header ---
        doc.setFontSize(18);
        doc.setTextColor(headerBgColor[0], headerBgColor[1], headerBgColor[2]);
        doc.text(title, pageWidth / 2, currentY, { align: 'center' });
        currentY += 6;
        doc.setLineWidth(0.5);
        doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 10;

        // --- Footer Function ---
        const pageFooter = (data) => {
            doc.setFontSize(8);
            doc.setTextColor(footerGray[0], footerGray[1], footerGray[2]);
            doc.text(footerText, margin, pageHeight - 10, { align: 'left' });
            doc.text(`Page ${data.pageNumber}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
        };

        // --- Transactions Title ---
        doc.setFontSize(14);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text("Transactions", margin, currentY);
        currentY += 5;

        // --- Transactions Table ---
        const transactionHeaders = [["#", "Date", "Description", "Amount", "Assigned To"]];
        const transactionBody = transactions.map((t, index) => {
            const assignedDisplay = Array.isArray(t.assigned_to) && t.assigned_to.length > 0
                ? t.assigned_to.join(', ')
                : 'None';
            const displayAmount = `${t.currency || mainCurrency} ${Number(t.amount).toFixed(2)}`;
            return [index + 1, t.date, t.description, displayAmount, assignedDisplay];
        });

        doc.autoTable({
            startY: currentY,
            head: transactionHeaders,
            body: transactionBody,
            theme: 'grid',
            headStyles: { fillColor: primaryColor, textColor: whiteColor, fontStyle: 'bold', fontSize: 9 },
            styles: { fontSize: 9, cellPadding: 2, lineColor: tableBorderGray, lineWidth: 0.1, valign: 'middle' },
            alternateRowStyles: { fillColor: lightGrayRow },
            columnStyles: {
                0: { cellWidth: 10, halign: 'center' },
                2: { cellWidth: 'auto' },
                3: { cellWidth: 25, halign: 'right' },
                4: { cellWidth: 45 }
            },
            didDrawPage: pageFooter
        });
        currentY = doc.lastAutoTable.finalY + 15;

        // --- Summary Title ---
        doc.setFontSize(14);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text("Expenses Summary", margin, currentY);
        currentY += 8;

        // --- Summary Table ---
        const summaryHeaders = [["Participant", `Total (${mainCurrency})`, `Total (${secondaryCurrency})`]];
        // Use the session's participant list for the summary rows
        const summaryBody = participants.map((participant) => {
            const totals = summary[participant] || { [mainCurrency]: 0.0, [secondaryCurrency]: 0.0 }; // Handle case where participant had 0 expenses
            return [
                participant,
                totals[mainCurrency].toFixed(2),
                totals[secondaryCurrency].toFixed(2)
            ];
        });

        const grandTotalRow = [
            { content: 'TOTAL', styles: { fontStyle: 'bold', halign: 'right' } },
            { content: grandTotal[mainCurrency].toFixed(2), styles: { fontStyle: 'bold' } },
            { content: grandTotal[secondaryCurrency].toFixed(2), styles: { fontStyle: 'bold' } }
        ];

        doc.autoTable({
            startY: currentY,
            head: summaryHeaders,
            body: summaryBody,
            foot: [grandTotalRow],
            theme: 'grid',
            headStyles: { fillColor: headerBgColor, textColor: whiteColor, fontStyle: 'bold', fontSize: 9 },
            footStyles: { fillColor: [233, 236, 239], textColor: [44, 62, 80], fontStyle: 'bold', lineWidth: 0.2 },
            styles: { fontSize: 9, cellPadding: 2, lineColor: tableBorderGray, lineWidth: 0.1, valign: 'middle' },
            columnStyles: {
                0: { halign: 'left', fontStyle: 'bold' },
                1: { halign: 'right' },
                2: { halign: 'right' }
            },
            didDrawPage: pageFooter
        });

        // --- 4. Save the PDF ---
        const safeSessionName = sessionName
            .replace(/[\\/*?:"<>|]/g, "") // Remove invalid filename chars
            .replace(/\s+/g, '_'); // Replace spaces with underscores
        const filename = `Expense_Report_${safeSessionName}.pdf`;
        doc.save(filename);

        log("Export:handleExportSessionPdf", `PDF "${filename}" generation complete.`);

    } catch (error) {
        error("Export:handleExportSessionPdf", "Error generating PDF:", error);
        alert(`Failed to generate PDF report: ${error.message}`);
    }
}

// Make the function globally accessible if called directly from HTML (e.g., onclick)
// If called only from handlers.js, this isn't strictly necessary.
window.handleExportSessionPdf = handleExportSessionPdf;