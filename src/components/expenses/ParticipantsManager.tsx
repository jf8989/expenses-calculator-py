import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addParticipant, removeParticipant } from "@/app/actions/participants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAvatarGradient, getInitials } from "@/lib/avatarUtils";
import { UserPlus, X, Users, Star, Trash2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAppStore } from "@/store/useAppStore";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";

interface ParticipantsManagerProps {
    userId: string;
    initialParticipants: string[];
}
export function ParticipantsManager({ userId, initialParticipants }: ParticipantsManagerProps) {
    const { participants, setParticipants, frequentParticipants, toggleFrequentParticipant } = useAppStore();
    const [newName, setNewName] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [participantToDelete, setParticipantToDelete] = useState<string | null>(null);
    const { t } = useLanguage();
    const { showToast } = useToast();

    const handleAdd = async () => {
        const name = newName.trim();
        if (!name || participants.includes(name)) return;

        setIsAdding(true);
        try {
            await addParticipant(userId, name);
            setParticipants([...participants, name].sort());
            setNewName("");
            showToast(`${name} ${t.participants.added || "added"}`);
        } catch (error) {
            console.error("Error adding participant", error);
            showToast(t.common?.error || "Error adding participant", "error");
        } finally {
            setIsAdding(false);
        }
    };

    const handleRemove = async () => {
        if (!participantToDelete) return;

        const name = participantToDelete;
        try {
            await removeParticipant(userId, name);
            setParticipants(participants.filter(p => p !== name));
            showToast(`${name} ${t.participants.removed || "removed"}`);
        } catch (error) {
            console.error("Error removing participant", error);
            showToast(t.common?.error || "Error removing participant", "error");
        } finally {
            setParticipantToDelete(null);
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
                    {t.participants.title}
                    <span className="ml-auto text-sm font-normal text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                        {participants.length}
                    </span>
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Input
                            placeholder={t.participants.addPlaceholder}
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                            className="bg-background/30 border-primary/20 focus:border-primary/50"
                            list="frequent-participants"
                        />
                        <datalist id="frequent-participants">
                            {frequentParticipants.filter(p => !participants.includes(p)).map(p => (
                                <option key={p} value={p} />
                            ))}
                        </datalist>
                    </div>
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
                                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getAvatarGradient(p)} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                                        {getInitials(p)}
                                    </div>
                                    <span className="font-medium text-sm">{p}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleFrequentParticipant(p)}
                                        className={`h-7 w-7 p-0 transition-all ${frequentParticipants.includes(p)
                                                ? 'text-amber-500 opacity-100'
                                                : 'text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-amber-500 hover:bg-amber-500/10'
                                            }`}
                                    >
                                        <Star className={`w-3.5 h-3.5 ${frequentParticipants.includes(p) ? 'fill-current' : ''}`} />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setParticipantToDelete(p)}
                                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
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
                                {t.participants.noParticipants}<br />{t.participants.getStarted}
                            </p>
                        </motion.div>
                    )}
                </div>
            </CardContent>

            <ConfirmDialog
                isOpen={!!participantToDelete}
                title={t.participants.removeTitle || "Remove Participant"}
                message={`${t.participants.removeConfirm || "Are you sure you want to remove"} ${participantToDelete}? ${t.participants.removeWarning || "Their assignments will be cleared."}`}
                onConfirm={handleRemove}
                onCancel={() => setParticipantToDelete(null)}
            />
        </Card>
    );
}
