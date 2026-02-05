// src/app/admin/utils/export-utils.ts
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { SubmissionData } from "../components/SubmissionsTable";

const formatKey = (key: string): string => {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

export const exportToJSON = (
  submissions: SubmissionData[],
  fileNameSuffix?: string
) => {
  const data = submissions.map((s) => ({
    ...s,
    createdAt:
      typeof s.createdAt?.toDate === "function"
        ? s.createdAt.toDate().toISOString()
        : s.createdAt,
    completedAt:
      typeof s.completedAt?.toDate === "function"
        ? s.completedAt.toDate().toISOString()
        : s.completedAt,
  }));

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const suffix =
    fileNameSuffix || `briefs-export-${new Date().toISOString().split("T")[0]}`;
  link.download = `${suffix}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportToMarkdown = (
  submissions: SubmissionData[],
  fileNameSuffix?: string
) => {
  let mdContent = `# Project Briefs Export - ${new Date().toLocaleDateString()}\n\n`;

  submissions.forEach((s, index) => {
    mdContent += `## Submission ${index + 1}: ${
      s.summary?.businessName || "Unnamed Project"
    }\n`;
    mdContent += `- **ID:** ${s.id}\n`;
    mdContent += `- **User:** ${
      s.summary?.contactName || s.userName || "Anonymous"
    }\n`;
    mdContent += `- **Email:** ${s.userEmail || "N/A"}\n`;
    mdContent += `- **Date:** ${
      typeof s.createdAt?.toDate === "function"
        ? s.createdAt.toDate().toLocaleString()
        : s.createdAt
    }\n\n`;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, userId, userEmail, createdAt, completedAt, version, ...data } =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      s as any;

    Object.entries(data).forEach(([sectionKey, sectionValue]) => {
      mdContent += `### ${formatKey(sectionKey)}\n`;
      if (typeof sectionValue === "object" && sectionValue !== null) {
        Object.entries(sectionValue).forEach(([key, value]) => {
          mdContent += `- **${formatKey(key)}:** ${
            value === true ? "Yes" : value === false ? "No" : value || "-"
          }\n`;
        });
      } else {
        mdContent += `${sectionValue || "-"}\n`;
      }
      mdContent += "\n";
    });
    mdContent += "---\n\n";
  });

  const blob = new Blob([mdContent], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const suffix =
    fileNameSuffix || `briefs-export-${new Date().toISOString().split("T")[0]}`;
  link.download = `${suffix}.md`;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportToPDF = (
  submissions: SubmissionData[],
  fileNameSuffix?: string
) => {
  const doc = new jsPDF();

  submissions.forEach((s, index) => {
    if (index > 0) doc.addPage();

    doc.setFontSize(20);
    doc.setTextColor(41, 128, 185);
    doc.text(`Project Brief: ${s.summary?.businessName || "Unnamed"}`, 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    const name = s.summary?.contactName || s.userName || "Anonymous";
    const date =
      typeof s.createdAt?.toDate === "function"
        ? s.createdAt.toDate().toLocaleString()
        : s.createdAt;
    doc.text(
      `User: ${name} | Email: ${s.userEmail || "N/A"} | Date: ${date}`,
      14,
      28
    );

    let currentY = 35;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, userId, userEmail, createdAt, completedAt, version, ...data } =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      s as any;

    Object.entries(data).forEach(([sectionKey, sectionValue]) => {
      if (typeof sectionValue === "object" && sectionValue !== null) {
        const rows = Object.entries(sectionValue).map(([key, value]) => [
          formatKey(key),
          String(
            value === true ? "Yes" : value === false ? "No" : value || "-"
          ),
        ]);

        doc.setFontSize(14);
        doc.setTextColor(41, 128, 185);
        doc.text(formatKey(sectionKey), 14, currentY);
        currentY += 5;

        autoTable(doc, {
          body: rows,
          startY: currentY,
          margin: { left: 14 },
          styles: { fontSize: 9, cellPadding: 2 },
          columnStyles: { 0: { fontStyle: "bold", cellWidth: 50 } },
          theme: "plain",
        });

        // @ts-expect-error - autoTable adds lastAutoTable to doc
        currentY = doc.lastAutoTable.finalY + 10;

        if (currentY > 270) {
          doc.addPage();
          currentY = 20;
        }
      }
    });
  });

  const suffix =
    fileNameSuffix || `briefs-export-${new Date().toISOString().split("T")[0]}`;
  doc.save(`${suffix}.pdf`);
};
