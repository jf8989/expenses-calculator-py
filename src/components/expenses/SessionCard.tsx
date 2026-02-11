"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Session } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, CreditCard, Trash2, Save, FileDown, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface SessionCardProps {
    session: Session;
    index: number;
    activeSessionId?: string;
    exportingId?: string | null;
    t: any;
    onSelect: (session: Session) => void;
    onExport: (e: React.MouseEvent, session: Session) => void;
    onOverwrite: (id: string) => void;
    onDelete: (id: string) => void;
}

export const SessionCard = memo(function SessionCard({
    session,
    index,
    activeSessionId,
    exportingId,
    t,
    onSelect,
    onExport,
    onOverwrite,
    onDelete,
}: SessionCardProps) {
    const getSessionColor = (name: string) => {
        const colors = [
            "from-violet-500 to-purple-600",
            "from-blue-500 to-cyan-500",
            "from-emerald-500 to-teal-500",
            "from-orange-500 to-amber-500",
            "from-pink-500 to-rose-500",
        ];
        const colorIndex = name.charCodeAt(0) % colors.length;
        return colors[colorIndex];
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="cursor-pointer"
            onClick={() => onSelect(session)}
        >
            <Card
                className="h-full border-border/50 bg-card/50 backdrop-blur-xl hover:bg-card/70 transition-all group overflow-hidden"
                hover={false}
            >
                <div className={`h-1.5 w-full bg-gradient-to-r ${getSessionColor(session.name)}`} />

                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-3">
                        <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-1">
                            {session.name}
                        </CardTitle>
                        <div className="flex gap-1">
                            {activeSessionId && activeSessionId !== session.id && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onOverwrite(session.id!);
                                    }}
                                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 hover:text-primary hover:bg-primary/10 transition-all"
                                    title={t.session.overwrite}
                                >
                                    <Save className="w-4 h-4" />
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => onExport(e, session)}
                                disabled={exportingId === session.id}
                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all"
                                title={t.session.exportPdf}
                            >
                                {exportingId === session.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <FileDown className="w-4 h-4" />
                                )}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(session.id!);
                                }}
                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 shrink-0 transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                    <CardDescription className="line-clamp-2 min-h-[40px]">
                        {session.description || t.dashboard.noDescription}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="flex flex-wrap justify-between items-center gap-2 text-xs text-muted-foreground mt-2">
                        <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                                <CreditCard className="w-3 h-3" />
                                {session.transactions.length} {t.dashboard.transactions}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 text-accent font-medium">
                                <Users className="w-3 h-3" />
                                {session.participants.length} {t.dashboard.people}
                            </span>
                            {session.transactions.length > 0 && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                                    {formatCurrency(session.transactions.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0), session.mainCurrency || "USD")}
                                </span>
                            )}
                        </div>
                        <span className="inline-flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            {session.createdAt?.seconds ? new Date(session.createdAt.seconds * 1000).toLocaleDateString() : t.dashboard.noDate}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
});
