"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addParticipant, removeParticipant } from "@/app/actions/participants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ParticipantsManagerProps {
    userId: string;
    initialParticipants: string[];
}

export function ParticipantsManager({ userId, initialParticipants }: ParticipantsManagerProps) {
    const [participants, setParticipants] = useState<string[]>(initialParticipants);
    const [newName, setNewName] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const handleAdd = async () => {
        if (!newName.trim() || participants.includes(newName.trim())) return;

        setIsAdding(true);
        const name = newName.trim();
        try {
            await addParticipant(userId, name);
            setParticipants(prev => [...prev, name].sort());
            setNewName("");
        } catch (error) {
            console.error("Error adding participant", error);
        } finally {
            setIsAdding(false);
        }
    };

    const handleRemove = async (name: string) => {
        try {
            await removeParticipant(userId, name);
            setParticipants(prev => prev.filter(p => p !== name));
        } catch (error) {
            console.error("Error removing participant", error);
        }
    };

    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-xl overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <span className="w-2 h-6 bg-primary rounded-full" />
                    Participants
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
                <div className="flex gap-2">
                    <Input
                        placeholder="Name..."
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                        className="bg-background/30 border-primary/20 focus:border-primary/50"
                    />
                    <Button onClick={handleAdd} disabled={isAdding || !newName.trim()}>
                        {isAdding ? "Adding..." : "Add"}
                    </Button>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                    <AnimatePresence mode="popLayout">
                        {participants.map((p) => (
                            <motion.div
                                key={p}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors group"
                            >
                                <span className="font-medium">{p}</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemove(p)}
                                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
                                >
                                    ✕
                                </Button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {participants.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4 italic">
                            No participants yet.
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
