// static/js/export.js

document.addEventListener('DOMContentLoaded', () => {
    const exportPdfButton = document.getElementById('export-pdf-btn');
    if (exportPdfButton) {
        exportPdfButton.addEventListener('click', handleExportPdf);
    } else {
        console.warn('Export PDF button (#export-pdf-btn) not found.');
    }
});

function handleExportPdf() {
    console.log('Export to PDF requested.');
    // Show loading indicator maybe?

    // Trigger the download by navigating to the backend endpoint
    // The browser will handle the 'Content-Disposition: attachment' header
    window.location.href = '/api/export/pdf';

    // Optional: Hide loading indicator after a short delay
    // setTimeout(() => { /* hide loading */ }, 1000);
}