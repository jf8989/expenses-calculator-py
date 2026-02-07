"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Session } from "@/types";
import { deleteSession } from "@/app/actions/sessions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, CreditCard, Trash2, Sparkles } from "lucide-react";

interface SessionsListProps {
    userId: string;
    initialSessions: Session[];
    onSelect: (session: Session) => void;
}

export function SessionsList({ userId, initialSessions, onSelect }: SessionsListProps) {
    const [sessions, setSessions] = useState<Session[]>(initialSessions);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this session?")) return;

        try {
            await deleteSession(userId, id);
            setSessions(prev => prev.filter(s => s.id !== id));
        } catch (error) {
            console.error("Error deleting session", error);
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
                    Your <span className="gradient-text">Sessions</span>
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                    {sessions.map((session, index) => (
                        <motion.div
                            key={session.id}
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
                                {/* Top colored accent bar */}
                                <div className={`h-1.5 w-full bg-gradient-to-r ${getSessionColor(session.name)}`} />

                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start gap-3">
                                        <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-1">
                                            {session.name}
                                        </CardTitle>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => handleDelete(session.id!, e)}
                                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 shrink-0 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <CardDescription className="line-clamp-2 min-h-[40px]">
                                        {session.description || "No description provided."}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent>
                                    <div className="flex flex-wrap justify-between items-center gap-2 text-xs text-muted-foreground mt-2">
                                        <div className="flex flex-wrap gap-2">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                                                <CreditCard className="w-3 h-3" />
                                                {session.transactions.length} transactions
                                            </span>
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 text-accent font-medium">
                                                <Users className="w-3 h-3" />
                                                {session.participants.length} people
                                            </span>
                                        </div>
                                        <span className="inline-flex items-center gap-1.5">
                                            <Calendar className="w-3 h-3" />
                                            {session.createdAt?.seconds ? new Date(session.createdAt.seconds * 1000).toLocaleDateString() : "No date"}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {sessions.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="border-dashed border-2 py-12 text-center bg-transparent" hover={false}>
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
                                <Sparkles className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <p className="text-muted-foreground">No sessions yet. Create your first one!</p>
                        </div>
                    </Card>
                </motion.div>
            )}
        </div>
    );
}
