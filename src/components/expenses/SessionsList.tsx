"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Session } from "@/types";
import { deleteSession } from "@/app/actions/sessions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, CreditCard, Trash2, Sparkles, Save, FileDown, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { formatCurrency } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { useState, useCallback } from "react";
import { SessionCard } from "./SessionCard";
import { updateSession as updateSessionAction } from "@/app/actions/sessions";
import { exportSessionPdf } from "@/lib/pdfExport";

interface SessionsListProps {
    userId: string;
    initialSessions: Session[];
    onSelect: (session: Session) => void;
    isLoading?: boolean;
}
export function SessionsList({ userId, initialSessions, onSelect, isLoading }: SessionsListProps) {
    const { sessions, setSessions, activeSession } = useAppStore();
    const { t, language } = useLanguage();
    const { showToast } = useToast();
    const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
    const [sessionToOverwrite, setSessionToOverwrite] = useState<string | null>(null);
    const [isOverwriting, setIsOverwriting] = useState(false);
    const [exportingId, setExportingId] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!sessionToDelete) return;
        const id = sessionToDelete;
        try {
            await deleteSession(userId, id);
            setSessions(sessions.filter(s => s.id !== id));
            showToast("Session deleted");
        } catch (error) {
            console.error("Error deleting session", error);
            showToast(t.common?.error || "Error", "error");
        } finally {
            setSessionToDelete(null);
        }
    };

    const handleExport = async (e: React.MouseEvent, session: Session) => {
        e.stopPropagation();
        setExportingId(session.id || null);
        try {
            await exportSessionPdf(session, language);
            showToast("PDF exported successfully");
        } catch (error) {
            console.error("Error exporting PDF", error);
            showToast(t.common?.error || "Error", "error");
        } finally {
            setExportingId(null);
        }
    };

    const handleOverwrite = async () => {
        if (!sessionToOverwrite || !activeSession) return;
        const id = sessionToOverwrite;
        setIsOverwriting(true);
        try {
            const sessionData: Omit<Session, "id"> = {
                ...activeSession,
                name: activeSession.name,
                description: activeSession.description,
            };
            await updateSessionAction(userId, id, sessionData);
            // Update local state if needed
            setSessions(sessions.map(s => s.id === id ? { ...sessionData, id } : s));
            showToast("Session overwritten successfully");
        } catch (error) {
            console.error("Error overwriting session", error);
            showToast(t.common?.error || "Error", "error");
        } finally {
            setIsOverwriting(false);
            setSessionToOverwrite(null);
        }
    };

    // Generate a consistent color based on session name
    const getSessionColor = (name: string) => {
        const colors = [
            "from-violet-500 to-purple-600",
            "from-blue-500 to-cyan-500",
            "from-emerald-500 to-teal-500",
            "from-orange-500 to-amber-500",
            "from-pink-500 to-rose-500",
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-primary to-accent" />
                <h2 className="text-2xl font-bold tracking-tight">
                    {t.dashboard.yourSessions} <span className="gradient-text">{t.dashboard.sessionsHighlight}</span>
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                    {sessions.map((session, index) => (
                        <SessionCard
                            key={session.id}
                            session={session}
                            index={index}
                            activeSessionId={activeSession?.id}
                            exportingId={exportingId}
                            t={t}
                            onSelect={onSelect}
                            onExport={handleExport}
                            onOverwrite={(id) => setSessionToOverwrite(id)}
                            onDelete={(id) => setSessionToDelete(id)}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {sessions.length === 0 && !isLoading && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="border-dashed border-2 py-10 px-6 text-center bg-transparent" hover={false}>
                        <div className="flex flex-col items-center gap-5 max-w-md mx-auto">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                <Sparkles className="w-8 h-8 text-primary" />
                            </div>
                            <div className="space-y-1.5">
                                <h3 className="text-lg font-bold">{t.dashboard.noSessionsTitle}</h3>
                                <p className="text-sm text-muted-foreground">{t.dashboard.noSessionsSubtitle}</p>
                            </div>
                            <div className="grid gap-3 text-left w-full">
                                <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">1</span>
                                    <div>
                                        <p className="text-sm font-medium">{t.dashboard.step1Title}</p>
                                        <p className="text-xs text-muted-foreground">{t.dashboard.step1Desc}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">2</span>
                                    <div>
                                        <p className="text-sm font-medium">{t.dashboard.step2Title}</p>
                                        <p className="text-xs text-muted-foreground">{t.dashboard.step2Desc}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">3</span>
                                    <div>
                                        <p className="text-sm font-medium">{t.dashboard.step3Title}</p>
                                        <p className="text-xs text-muted-foreground">{t.dashboard.step3Desc}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            )}

            {isLoading && sessions.length === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="space-y-3">
                            <div className="h-40 rounded-3xl bg-card/50 backdrop-blur-xl animate-pulse flex flex-col p-6 gap-4">
                                <div className="h-6 w-1/3 bg-primary/10 rounded-full" />
                                <div className="h-4 w-2/3 bg-muted/40 rounded-full" />
                                <div className="mt-auto flex gap-2">
                                    <div className="h-8 w-20 bg-muted/40 rounded-full" />
                                    <div className="h-8 w-20 bg-muted/40 rounded-full" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ConfirmDialog
                isOpen={!!sessionToDelete}
                title={t.session.confirmDelete}
                message={t.session.confirmDeleteMsg}
                onConfirm={handleDelete}
                onCancel={() => setSessionToDelete(null)}
            />

            <ConfirmDialog
                isOpen={!!sessionToOverwrite}
                title={t.session.confirmOverwrite}
                message={t.session.confirmOverwriteMsg}
                confirmLabel={t.session.overwrite}
                onConfirm={handleOverwrite}
                onCancel={() => setSessionToOverwrite(null)}
            />
        </div>
    );
}
