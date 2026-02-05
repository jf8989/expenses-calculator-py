"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Session } from "@/types";
import { deleteSession } from "@/app/actions/sessions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold tracking-tight">Your <span className="gradient-text">Sessions</span></h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                    {sessions.map((session, index) => (
                        <motion.div
                            key={session.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ y: -4 }}
                            className="cursor-pointer"
                            onClick={() => onSelect(session)}
                        >
                            <Card className="h-full border-border/50 bg-card/50 backdrop-blur-xl hover:bg-card/80 transition-all border-l-4 border-l-primary group">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-xl group-hover:text-primary transition-colors">
                                            {session.name}
                                        </CardTitle>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => handleDelete(session.id!, e)}
                                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10"
                                        >
                                            🗑️
                                        </Button>
                                    </div>
                                    <CardDescription className="line-clamp-2 min-h-[40px]">
                                        {session.description || "No description provided."}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
                                        <div className="flex gap-2">
                                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                                {session.transactions.length} transactions
                                            </span>
                                            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 font-medium">
                                                {session.participants.length} people
                                            </span>
                                        </div>
                                        <span>{session.createdAt?.seconds ? new Date(session.createdAt.seconds * 1000).toLocaleDateString() : "No date"}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {sessions.length === 0 && (
                <Card className="border-dashed border-2 py-12 text-center bg-transparent">
                    <p className="text-muted-foreground">No sessions found. Create your first one!</p>
                </Card>
            )}
        </div>
    );
}
