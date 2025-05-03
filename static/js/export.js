// static/js/export.js

// Use window.jspdf to access the library loaded via CDN
const { jsPDF } = window.jspdf;

/**
 * Generates and triggers download of a PDF report for a specific session using jsPDF.
 * Tries to mimic styles from pdf_styles.css where possible.
 * @param {number} sessionId - The ID of the session to export.
 * @param {string} sessionName - The name of the session (for logging and filename).
 */
async function handleExportSessionPdf(sessionId, sessionName) {
    if (!sessionId) {
        console.error("Export Session PDF called without a session ID.");
        alert("Cannot export: Session ID is missing.");
        return;
    }
    console.log(`Generating client-side PDF for session ID: ${sessionId}, Name: ${sessionName}.`);

    // --- Define Colors (RGB arrays) ---
    const primaryColor = [52, 152, 219]; // #3498db
    const headerBgColor = [52, 73, 94]; // #34495e
    const whiteColor = [255, 255, 255];
    const lightGrayRow = [242, 242, 242]; // #f2f2f2
    const footerGray = [119, 119, 119]; // #777
    const tableBorderGray = [221, 221, 221]; // #ddd

    try {
        // --- 1. Fetch Data ---
        const [transactions, participants] = await Promise.all([
            fetch(`/api/sessions/${sessionId}/transactions`).then(res => res.ok ? res.json() : Promise.reject(new Error(`Failed to fetch transactions: ${res.statusText}`))),
            fetch('/api/participants').then(res => res.ok ? res.json() : Promise.reject(new Error(`Failed to fetch participants: ${res.statusText}`)))
        ]);

        // --- 2. Get Currency Settings ---
        const mainCurrency = document.getElementById("main-currency")?.value || "PEN";
        const secondaryCurrency = document.getElementById("secondary-currency")?.value || "USD";

        // --- 3. Calculate Summary ---
        // (Calculation logic remains the same as before)
        const summary = {};
        participants.forEach(p => { summary[p] = { [mainCurrency]: 0.0, [secondaryCurrency]: 0.0 }; });
        const grandTotal = { [mainCurrency]: 0.0, [secondaryCurrency]: 0.0 };
        transactions.forEach(t => {
            const assignedList = (t.assigned_to || '').split(',').map(p => p.trim()).filter(p => p);
            if (assignedList.length > 0) {
                const amount = parseFloat(t.amount);
                if (isNaN(amount)) return;
                const share = amount / assignedList.length;
                const txnCurrency = t.currency || mainCurrency;
                assignedList.forEach(participant => {
                    if (summary[participant]) {
                        summary[participant][txnCurrency === mainCurrency ? mainCurrency : secondaryCurrency] += share;
                    }
                });
            }
        });
        Object.values(summary).forEach(totals => {
            grandTotal[mainCurrency] += totals[mainCurrency];
            grandTotal[secondaryCurrency] += totals[secondaryCurrency];
        });

        // --- 4. Generate PDF ---
        const doc = new jsPDF();
        const generationTime = new Date().toLocaleString();
        const title = `Expense Split Report: ${sessionName}`;
        const footerText = `Exported on ${generationTime}`;
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 14; // Left/right margin approx
        let currentY = 15; // Start Y position

        // --- PDF Header (H1 Simulation) ---
        doc.setFontSize(18);
        doc.setTextColor(headerBgColor[0], headerBgColor[1], headerBgColor[2]); // Dark blue/grey
        doc.text(title, pageWidth / 2, currentY, { align: 'center' });
        currentY += 6; // Space after text
        // Draw line below title
        doc.setLineWidth(0.5);
        doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]); // Blue line
        doc.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 10; // Space after line

        // --- Footer Function (for autoTable) ---
        const pageFooter = (data) => {
            doc.setFontSize(8);
            doc.setTextColor(footerGray[0], footerGray[1], footerGray[2]);
            doc.text(footerText, margin, pageHeight - 10, { align: 'left' });
            // Add page number
            doc.text(`Page ${data.pageNumber}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
        };

        // --- Transactions Title (H2 Simulation) ---
        doc.setFontSize(14);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]); // Blue
        doc.text("Transactions", margin, currentY);
        currentY += 5; // Space after text
        // Optional thin line below H2
        // doc.setLineWidth(0.2);
        // doc.setDrawColor(204, 204, 204); // Light gray line
        // doc.line(margin, currentY, pageWidth - margin, currentY);
        // currentY += 3; // Space after line

        // --- Transactions Table ---
        const transactionHeaders = [["#", "Date", "Description", "Amount", "Assigned To"]];
        const transactionBody = transactions.map((t, index) => {
            const assignedDisplay = (t.assigned_to || '').split(',').map(p => p.trim()).filter(p => p).join(', ') || 'None';
            const displayAmount = `${t.currency || mainCurrency} ${Number(t.amount).toFixed(2)}`;
            return [index + 1, t.date, t.description, displayAmount, assignedDisplay];
        });

        doc.autoTable({
            startY: currentY,
            head: transactionHeaders,
            body: transactionBody,
            theme: 'grid',
            headStyles: {
                fillColor: primaryColor, // Blue header
                textColor: whiteColor,
                fontStyle: 'bold',
                fontSize: 9 // Slightly smaller header font
            },
            styles: {
                fontSize: 9, // Base font size for table
                cellPadding: 2, // Adjust padding (CSS was 6px 8px)
                lineColor: tableBorderGray,
                lineWidth: 0.1,
                valign: 'middle' // Align vertically centered
            },
            alternateRowStyles: {
                fillColor: lightGrayRow // Zebra striping
            },
            columnStyles: {
                0: { cellWidth: 10, halign: 'center' }, // # column centered
                2: { cellWidth: 'auto' }, // Description auto
                3: { cellWidth: 25, halign: 'right' }, // Amount right aligned
                4: { cellWidth: 45 } // Assigned To slightly wider
            },
            didDrawPage: pageFooter // Add footer to each page
        });
        currentY = doc.lastAutoTable.finalY + 15; // Update Y position after table + margin

        // --- Summary Title (H2 Simulation) ---
        doc.setFontSize(14);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]); // Blue
        doc.text("Expenses Summary", margin, currentY);
        currentY += 8; // Space after text

        // --- Summary Table ---
        const summaryHeaders = [["Participant", `Total (${mainCurrency})`, `Total (${secondaryCurrency})`]];
        const summaryBody = Object.entries(summary).map(([participant, totals]) => [
            participant,
            totals[mainCurrency].toFixed(2),
            totals[secondaryCurrency].toFixed(2)
        ]);
        // Prepare Grand Total Row Data
        const grandTotalRow = [
            { content: 'TOTAL', styles: { fontStyle: 'bold', halign: 'right' } },
            { content: grandTotal[mainCurrency].toFixed(2), styles: { fontStyle: 'bold' } },
            { content: grandTotal[secondaryCurrency].toFixed(2), styles: { fontStyle: 'bold' } }
        ];

        doc.autoTable({
            startY: currentY,
            head: summaryHeaders,
            body: summaryBody,
            // Add the total row using the 'foot' option or simply as last body row
            // Using foot might be semantically better if styling differs significantly
            foot: [grandTotalRow], // Add total row as footer
            theme: 'grid',
            headStyles: {
                fillColor: headerBgColor, // Darker header for summary
                textColor: whiteColor,
                fontStyle: 'bold',
                fontSize: 9
            },
            footStyles: { // Style the footer row (TOTAL)
                fillColor: [233, 236, 239], // Light background similar to #e9ecef
                textColor: [44, 62, 80], // Dark text color
                fontStyle: 'bold',
                lineWidth: 0.2 // Slightly thicker top border simulated by row line width
            },
            styles: {
                fontSize: 9,
                cellPadding: 2,
                lineColor: tableBorderGray,
                lineWidth: 0.1,
                valign: 'middle'
            },
            columnStyles: {
                0: { halign: 'left', fontStyle: 'bold' }, // Participant name bold
                1: { halign: 'right' }, // Align totals right
                2: { halign: 'right' }
            },
            didDrawPage: pageFooter // Add footer again
        });

        // --- 5. Save the PDF ---
        const safeSessionName = sessionName
            .replace(/[\\/*?:"<>|]/g, "")
            .replace(/\s+/g, '_');
        const filename = `Expense_Report_${safeSessionName}.pdf`;
        doc.save(filename);

        console.log(`PDF "${filename}" generation complete.`);

    } catch (error) {
        console.error("Error generating PDF:", error);
        alert(`Failed to generate PDF report: ${error.message}`);
    }
}

// Make the function globally accessible
window.handleExportSessionPdf = handleExportSessionPdf;