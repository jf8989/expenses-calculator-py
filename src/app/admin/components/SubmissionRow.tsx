// src/app/admin/components/SubmissionRow.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Trash2, FileCode, FileText } from "lucide-react";
import { SubmissionData } from "./SubmissionsTable";
import { SubmissionDetails } from "./SubmissionDetails";
import { Button } from "@/components/ui/button";
import { exportToJSON, exportToMarkdown, exportToPDF } from "../utils/export-utils";
import { useLanguage } from "@/context/LanguageContext";

interface SubmissionRowProps {
  submission: SubmissionData;
  onDelete: () => void;
  isDeleting: boolean;
}

export function SubmissionRow({ submission, onDelete, isDeleting }: SubmissionRowProps) {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = typeof timestamp.toDate === "function" ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  const getFileName = () => {
    const business = submission.summary?.businessName?.toLowerCase().replace(/\s+/g, "-") || "sin-nombre";
    const date = typeof submission.createdAt?.toDate === "function"
      ? submission.createdAt.toDate().toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];
    return `brief-${business}-${date}`;
  };

  return (
    <>
      <tr className="border-b hover:bg-muted/30 transition-colors">
        <td className="p-4">{formatDate(submission.createdAt)}</td>
        <td className="p-4 font-medium">
          {submission.summary?.businessName || t.admin.details.unspecified}
        </td>
        <td className="p-4">
          <div className="text-sm">
            <div className="font-medium">
              {submission.summary?.contactName || submission.userName || "Anónimo"}
            </div>
            <div className="text-xs text-muted-foreground">
              {submission.userEmail || submission.userId}
            </div>
          </div>
        </td>
        <td className="p-4">
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? <ChevronUp className="w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
              {isExpanded ? t.admin.buttons.hide : t.admin.buttons.view}
            </Button>

            <div className="h-4 w-[1px] bg-border mx-1 self-center" />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => exportToJSON([submission], getFileName())}
              title={t.admin.buttons.json}
            >
              <FileCode className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => exportToMarkdown([submission], getFileName())}
              title={t.admin.buttons.markdown}
            >
              <FileText className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => exportToPDF([submission], getFileName())}
              title={t.admin.buttons.pdf}
              className="font-bold text-primary px-2"
            >
              <FileText className="w-4 h-4 mr-1" />
              <span className="text-[10px]">PDF</span>
            </Button>

            <div className="h-4 w-[1px] bg-border mx-1 self-center" />

            <Button variant="ghost" size="sm" onClick={onDelete} disabled={isDeleting} title={t.admin.buttons.delete} className="text-destructive hover:bg-destructive/10">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </td>
      </tr>

      <AnimatePresence>
        {isExpanded && (
          <tr>
            <td colSpan={4} className="p-0">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 bg-muted/20 border-t">
                  <SubmissionDetails submission={submission} />
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}
