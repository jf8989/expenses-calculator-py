// src/app/admin/components/ExportButtons.tsx
"use client";

import { Trash2, FileText, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubmissionData } from "./SubmissionsTable";
import { exportToJSON, exportToMarkdown, exportToPDF } from "../utils/export-utils";
import { useLanguage } from "@/context/LanguageContext";

interface ExportButtonsProps {
  submissions: SubmissionData[];
  onClearAll: () => Promise<void>;
  isDeleting: boolean;
}

export function ExportButtons({
  submissions,
  onClearAll,
  isDeleting,
}: ExportButtonsProps) {
  const { t } = useLanguage();
  const handleExportJSON = () => exportToJSON(submissions);
  const handleExportMarkdown = () => exportToMarkdown(submissions);
  const handleExportPDF = () => exportToPDF(submissions);

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between items-end sm:items-center">
      <div className="flex gap-2 w-full sm:w-auto">
        <Button
          onClick={onClearAll}
          variant="destructive"
          size="sm"
          disabled={isDeleting || submissions.length === 0}
          className="w-full sm:w-auto"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          {isDeleting ? t.admin.buttons.clearing : t.admin.buttons.clearAll}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.admin.buttons.exportAll}</span>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={handleExportJSON} variant="outline" size="sm" className="flex-1 sm:flex-initial" disabled={submissions.length === 0}>
            <FileCode className="w-4 h-4 mr-2" />
            {t.admin.buttons.json}
          </Button>
          <Button onClick={handleExportMarkdown} variant="outline" size="sm" className="flex-1 sm:flex-initial" disabled={submissions.length === 0}>
            <FileText className="w-4 h-4 mr-2" />
            {t.admin.buttons.markdown}
          </Button>
          <Button onClick={handleExportPDF} variant="outline" size="sm" className="flex-1 sm:flex-initial font-bold border-primary/50 text-primary" disabled={submissions.length === 0}>
            <FileText className="w-4 h-4 mr-2" />
            {t.admin.buttons.pdf}
          </Button>
        </div>
      </div>
    </div>
  );
}
