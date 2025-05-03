// static/js/export.js

// Remove or comment out the old DOMContentLoaded listener and handleExportPdf function
/*
document.addEventListener('DOMContentLoaded', () => {
    const exportPdfButton = document.getElementById('export-pdf-btn');
    if (exportPdfButton) {
        exportPdfButton.addEventListener('click', handleExportPdf);
    } else {
        console.warn('Export PDF button (#export-pdf-btn) not found.');
    }
});

function handleExportPdf() {
    // This function is no longer used for the general button
    console.log('General Export to PDF requested.');
    window.location.href = '/api/export/pdf';
}
*/

// --- ADD THIS NEW FUNCTION ---
/**
 * Triggers the download of a PDF report for a specific session.
 * @param {number} sessionId - The ID of the session to export.
 * @param {string} sessionName - The name of the session (for logging).
 */
function handleExportSessionPdf(sessionId, sessionName) {
    if (!sessionId) {
        console.error("Export Session PDF called without a session ID.");
        alert("Cannot export: Session ID is missing.");
        return;
    }
    console.log(`Exporting session ID: ${sessionId}, Name: ${sessionName} as PDF.`);

    // Navigate to the specific session export endpoint
    window.location.href = `/api/export/session/${sessionId}/pdf`;

    // Optional: Add loading indicator logic here if desired
}

// Make sure the function is available globally or attached correctly
// (Being defined at the top level like this usually makes it globally accessible)