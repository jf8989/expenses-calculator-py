import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Session, Transaction } from "@/types";
import { calculateMultiCurrencySummary, calculateMultiCurrencyDebts } from "./calculations";
import { translations, Language } from "@/data/translations";

type RGBColor = [number, number, number];

export async function exportSessionPdf(session: Session, language: Language = "en") {
  const t = translations[language];
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;

  // --- Header ---
  // Accent bar
  doc.setFillColor(26, 31, 54); // Dark Navy #1a1f36
  doc.rect(0, 0, pageWidth, 5, "F");

  // App name
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("EXPENSES GENIE", margin, 15);

  // Export Date
  const dateStr = new Date().toLocaleDateString(language === "es" ? "es-ES" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.setFontSize(10);
  doc.text(dateStr, pageWidth - margin, 15, { align: "right" });

  // Session Title
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(26, 31, 54);
  doc.text(session.name || t.dashboard.noDescription, margin, 30);

  // Description
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80);
  const description = session.description || "";
  const splitDesc = description ? doc.splitTextToSize(description, pageWidth - margin * 2) : [];
  if (description) {
    doc.text(splitDesc, margin, 38);
  }

  // Currency Info
  const currencyY = description ? 45 + (splitDesc.length * 5) : 40;
  const mainCurrency = session.mainCurrency || "USD";
  doc.setFontSize(9);
  doc.setTextColor(120);
  let currencyText = `${t.session.mainCurrency}: ${mainCurrency}`;
  if (session.currencies && Object.keys(session.currencies).length > 0) {
    const rates = Object.entries(session.currencies)
      .map(([code, rate]) => `${code} (${rate})`)
      .join(", ");
    currencyText += ` | ${t.session.exchangeRate}: ${rates}`;
  }
  doc.text(currencyText, margin, currencyY);

  // Separator
  doc.setDrawColor(230);
  doc.line(margin, currencyY + 5, pageWidth - margin, currencyY + 5);

  // --- Data Preparation ---
  const multiSummaries = calculateMultiCurrencySummary(
    session.transactions,
    session.participants,
    mainCurrency,
  );
  const multiDebts = calculateMultiCurrencyDebts(multiSummaries);
  const usedCurrencies = Object.keys(multiSummaries);

  // --- Transactions Table ---
  const txHeaders = [
    "#",
    language === "es" ? "Fecha" : "Date",
    language === "es" ? "Descripción" : "Description",
    language === "es" ? "Pagado por" : "Paid by",
    language === "es" ? "Monto" : "Amount",
    language === "es" ? "Participantes" : "Participants",
  ];

  const txData = session.transactions.map((tx, idx) => [
    idx + 1,
    tx.date || "-",
    tx.description || "-",
    tx.payer || "-",
    `${tx.amount.toFixed(2)} ${tx.currency || mainCurrency}`,
    tx.assigned_to?.join(", ") || "-",
  ]);

  autoTable(doc, {
    startY: currencyY + 15,
    head: [txHeaders],
    body: txData,
    theme: "striped",
    headStyles: { fillColor: [26, 31, 54] as RGBColor, textColor: 255, fontSize: 10 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [248, 249, 250] as RGBColor },
    margin: { left: margin, right: margin },
  });

  // --- Summary Tables (per currency) ---
  const summaryHeaders = [
    t.participants.title,
    t.settle.paid,
    t.settle.fairShare,
    t.settle.balances,
  ];

  for (const currency of usedCurrencies) {
    const summaries = multiSummaries[currency];
    const summaryList = Object.values(summaries).filter(
      s => s.totalPaid > 0.01 || s.fairShare > 0.01 || Math.abs(s.balance) > 0.01
    );
    if (summaryList.length === 0) continue;

    const summaryData = summaryList.map((s) => [
      s.name,
      `${s.totalPaid.toFixed(2)} ${currency}`,
      `${s.fairShare.toFixed(2)} ${currency}`,
      {
        content: `${s.balance.toFixed(2)} ${currency}`,
        styles: { textColor: (s.balance >= 0 ? [0, 128, 0] : [200, 0, 0]) as RGBColor },
      },
    ]);

    const headerLabel = usedCurrencies.length > 1
      ? `${t.settle.financialSummary} (${currency})`
      : t.settle.financialSummary;

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 15,
      head: [[{ content: headerLabel, colSpan: 4, styles: { halign: "center", fillColor: [50, 50, 50] as RGBColor } }]],
      body: [summaryHeaders, ...summaryData],
      theme: "grid",
      headStyles: { fillColor: [26, 31, 54] as RGBColor, textColor: 255, fontSize: 10 },
      bodyStyles: { fontSize: 9 },
      margin: { left: margin, right: margin },
    });
  }

  // --- Settle-Up Section ---
  if (multiDebts.length > 0) {
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    
    // Check if we need a new page
    if (finalY > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(26, 31, 54);
      doc.text(t.settle.suggestedPayments, margin, 20);
    } else {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(26, 31, 54);
      doc.text(t.settle.suggestedPayments, margin, finalY);
    }

    const startDebtY = finalY > doc.internal.pageSize.getHeight() - 40 ? 30 : finalY + 8;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60);

    multiDebts.forEach((debt, idx) => {
      const debtText = `${debt.from} ${t.settle.pays} ${debt.amount.toFixed(2)} ${debt.currency} -> ${debt.to}`;
      doc.text(debtText, margin + 5, startDebtY + idx * 7);
    });
  }

  // --- Footer ---
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    // Left
    doc.text(t.footer.tagline, margin, doc.internal.pageSize.getHeight() - 10);
    // Right
    doc.text(
      `${language === "es" ? "Página" : "Page"} ${i} / ${pageCount}`,
      pageWidth - margin,
      doc.internal.pageSize.getHeight() - 10,
      { align: "right" }
    );
  }

  // Save
  const fileName = `${session.name || "Session"}_Expenses_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}
