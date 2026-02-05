// src/app/admin/components/SubmissionsTable.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  Timestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Spinner } from "@/components/icons/spinner";
import { Card } from "@/components/ui/card";
import { SubmissionRow } from "./SubmissionRow";
import { ExportButtons } from "./ExportButtons";
import { ProjectBriefData } from "@/types/project-brief";
import { useLanguage } from "@/context/LanguageContext";

export interface SubmissionData extends ProjectBriefData {
  id: string;
  // Metadata
  userId: string;
  userName: string | null;
  userEmail: string | null;
  createdAt: Timestamp;
  completedAt: Timestamp;
  version: number;
}

export function SubmissionsTable() {
  const { t } = useLanguage();
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async () => {
    if (!db) {
      setError(t.admin.messages.firebaseNotConfigured);
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, "project-planning-responses"),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SubmissionData[];

      setSubmissions(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching submissions:", err);
      setError(t.admin.messages.error);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleDelete = async (id: string) => {
    const firestore = db;
    if (!firestore) return;

    if (!window.confirm(t.admin.messages.confirmDelete)) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteDoc(doc(firestore, "project-planning-responses", id));
      await fetchSubmissions();
    } catch (err) {
      console.error("Error deleting submission:", err);
      alert(t.admin.messages.deleteError);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearAll = async () => {
    const firestore = db;
    if (!firestore) return;

    const confirmClear = window.confirm(t.admin.messages.confirmClearAll);

    if (!confirmClear) return;

    setIsDeleting(true);
    try {
      // Delete all docs one by one (Firestore doesn't have a clear collection method)
      const deletePromises = submissions.map((submission) =>
        deleteDoc(doc(firestore, "project-planning-responses", submission.id))
      );

      await Promise.all(deletePromises);
      await fetchSubmissions();
    } catch (err) {
      console.error("Error clearing submissions:", err);
      alert(t.admin.messages.clearError);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <Spinner className="w-8 h-8 mx-auto mb-4" />
          <p className="text-muted-foreground">{t.admin.messages.loading}</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8">
        <p className="text-center text-destructive">{error}</p>
      </Card>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="space-y-6">
        <ExportButtons
          submissions={[]}
          onClearAll={handleClearAll}
          isDeleting={isDeleting}
        />
        <Card className="p-8">
          <p className="text-center text-muted-foreground">
            {t.admin.messages.noSubmissions}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Export buttons at top */}
      <ExportButtons
        submissions={submissions}
        onClearAll={handleClearAll}
        isDeleting={isDeleting}
      />

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left p-4 font-semibold">{t.admin.table.date}</th>
                <th className="text-left p-4 font-semibold">{t.admin.table.business}</th>
                <th className="text-left p-4 font-semibold">{t.admin.table.user}</th>
                <th className="text-left p-4 font-semibold">{t.admin.table.actions}</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <SubmissionRow
                  key={submission.id}
                  submission={submission}
                  onDelete={() => handleDelete(submission.id)}
                  isDeleting={isDeleting}
                />
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
