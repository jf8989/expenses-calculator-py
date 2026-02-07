"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addParticipant, removeParticipant } from "@/app/actions/participants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, X, Users } from "lucide-react";

interface ParticipantsManagerProps {
    userId: string;
    initialParticipants: string[];
}

// Generate avatar color based on name
const getAvatarColor = (name: string) => {
    const colors = [
        "from-violet-500 to-purple-600",
        "from-blue-500 to-cyan-500",
        "from-emerald-500 to-teal-500",
        "from-orange-500 to-amber-500",
        "from-pink-500 to-rose-500",
        "from-red-500 to-orange-500",
        "from-indigo-500 to-blue-500",
        "from-lime-500 to-green-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
};

// Get initials from name
const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

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
        <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-xl overflow-hidden sticky top-24" hover={false}>
            {/* Top gradient accent */}
            <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent to-primary" />

            <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
                        <Users className="w-4 h-4 text-white" />
                    </div>
                    Participants
                    <span className="ml-auto text-sm font-normal text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                        {participants.length}
                    </span>
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
                <div className="flex gap-2">
                    <Input
                        placeholder="Add someone..."
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                        className="bg-background/30 border-primary/20 focus:border-primary/50"
                    />
                    <Button
                        onClick={handleAdd}
                        disabled={isAdding || !newName.trim()}
                        size="icon"
                        className="shrink-0"
                    >
                        <UserPlus className="w-4 h-4" />
                    </Button>
                </div>

                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
                    <AnimatePresence mode="popLayout">
                        {participants.map((p, index) => (
                            <motion.div
                                key={p}
                                initial={{ opacity: 0, x: -10, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 10, scale: 0.95 }}
                                transition={{ delay: index * 0.02 }}
                                className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    {/* Avatar */}
                                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getAvatarColor(p)} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                                        {getInitials(p)}
                                    </div>
                                    <span className="font-medium text-sm">{p}</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemove(p)}
                                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </Button>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {participants.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center gap-2 py-8"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center">
                                <Users className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground text-center">
                                No participants yet.<br />Add someone to get started!
                            </p>
                        </motion.div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
