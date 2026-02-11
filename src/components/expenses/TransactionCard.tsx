"use client";

import { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Transaction } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Calendar, Trash2, Check, Square, CheckSquare, X } from "lucide-react";
import { getAvatarColor } from "@/lib/avatarUtils";
import { formatCurrency } from "@/lib/utils";

interface TransactionCardProps {
    tx: Transaction;
    index: number;
    originalIdx: number;
    sessionParticipants: string[];
    availableCurrencies: string[];
    mainCurrency: string;
    t: any;
    updateTransaction: (index: number, field: keyof Transaction, value: any) => void;
    toggleSplitParticipant: (txIdx: number, pName: string) => void;
    toggleAllParticipants: (txIdx: number) => void;
    setTxToDelete: (index: number) => void;
    handleDescriptionBlur: (txIdx: number, description: string) => void;
}

export const TransactionCard = memo(function TransactionCard({
    tx,
    originalIdx,
    sessionParticipants,
    availableCurrencies,
    mainCurrency,
    t,
    updateTransaction,
    toggleSplitParticipant,
    toggleAllParticipants,
    setTxToDelete,
    handleDescriptionBlur,
}: TransactionCardProps) {
    // Local state for debouncing
    const [localDescription, setLocalDescription] = useState(tx.description);
    const [localAmount, setLocalAmount] = useState(tx.amount || 0);

    // Sync local state when external data changes (e.g. from bulk import)
    useEffect(() => {
        setLocalDescription(tx.description);
    }, [tx.description]);

    useEffect(() => {
        setLocalAmount(tx.amount || 0);
    }, [tx.amount]);

    // Handle debounced updates
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localDescription !== tx.description) {
                updateTransaction(originalIdx, "description", localDescription);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [localDescription, originalIdx, updateTransaction, tx.description]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localAmount !== tx.amount) {
                updateTransaction(originalIdx, "amount", localAmount);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [localAmount, originalIdx, updateTransaction, tx.amount]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 sm:p-6 rounded-2xl bg-card border border-border/50 shadow-sm space-y-5 relative group"
        >
            <div className="flex flex-wrap gap-6 items-start">
                <div className="flex-1 min-w-[250px] space-y-4">
                    <Input
                        label={<div className="flex items-center gap-1.5">{t.session.description} <Pencil className="w-3 h-3 text-muted-foreground/50" /></div>}
                        placeholder={t.session.whatWasBought}
                        value={localDescription}
                        onChange={(e) => setLocalDescription(e.target.value)}
                        onBlur={(e) => handleDescriptionBlur(originalIdx, e.target.value)}
                    />
                    <div className="grid grid-cols-3 gap-4">
                        <Input
                            label={<div className="flex items-center gap-1.5">{t.session.amount} <Pencil className="w-3 h-3 text-muted-foreground/50" /></div>}
                            type="number"
                            value={localAmount || ""}
                            onChange={(e) => setLocalAmount(parseFloat(e.target.value) || 0)}
                        />
                        {/* Per-transaction currency toggle */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">{t.session.currency}</label>
                            <button
                                type="button"
                                onClick={() => {
                                    if (availableCurrencies.length <= 1) return;
                                    const currentCurrency = tx.currency || mainCurrency;
                                    const currentIndex = availableCurrencies.indexOf(currentCurrency);
                                    const nextIndex = (currentIndex + 1) % availableCurrencies.length;
                                    updateTransaction(originalIdx, "currency", availableCurrencies[nextIndex]);
                                }}
                                className={`w-full h-12 rounded-xl border-2 flex items-center justify-center font-bold transition-all ${availableCurrencies.length > 1
                                    ? "bg-primary/5 border-primary/20 hover:border-primary/40 hover:bg-primary/10 cursor-pointer"
                                    : "bg-muted/30 border-border/50 cursor-default"
                                    }`}
                            >
                                <span className="gradient-text">{tx.currency || mainCurrency}</span>
                            </button>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                {t.session.paidBy} <Pencil className="w-3 h-3 text-muted-foreground/50" />
                            </label>
                            <AnimatePresence mode="wait">
                                {tx.payer ? (
                                    <motion.div
                                        key="payer-select"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="flex items-center gap-2"
                                    >
                                        <select
                                            className="flex-1 h-12 rounded-xl bg-background/50 border-2 border-border px-4 text-sm focus:border-primary focus:shadow-[0_0_0_4px_hsl(var(--primary)/0.1)] outline-none transition-all hover:border-muted-foreground/30"
                                            value={tx.payer}
                                            onChange={(e) => updateTransaction(originalIdx, "payer", e.target.value)}
                                        >
                                            {sessionParticipants.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => updateTransaction(originalIdx, "payer", undefined)}
                                            className="h-12 w-12 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="payer-button"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                    >
                                        <Button
                                            variant="outline"
                                            onClick={() => updateTransaction(originalIdx, "payer", sessionParticipants[0])}
                                            className="w-full h-12 rounded-xl border-dashed border-2 text-muted-foreground hover:text-primary hover:border-primary transition-all text-xs"
                                        >
                                            {t.session.whoPaid || "Who paid?"}
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                <div className="min-w-[200px] bg-muted/30 p-4 rounded-xl border border-border/50">
                    <div className="flex justify-between items-center mb-3">
                        <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t.session.splitWith}</label>
                        <div className="flex items-center gap-2">
                            {tx.amount > 0 && tx.assigned_to?.length > 0 && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                    {formatCurrency(tx.amount / (tx.assigned_to?.length || 1), tx.currency || mainCurrency)} {t.session.each}
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={() => toggleAllParticipants(originalIdx)}
                                className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                            >
                                {sessionParticipants.every(p => tx.assigned_to?.includes(p)) ? (
                                    <><Square className="w-2.5 h-2.5" /> {t.session.none}</>
                                ) : (
                                    <><CheckSquare className="w-2.5 h-2.5" /> {t.session.all}</>
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {sessionParticipants.map(p => {
                            const isSelected = tx.assigned_to?.includes(p) || false;
                            return (
                                <label
                                    key={p}
                                    className={`flex items-center gap-2.5 cursor-pointer p-2 rounded-lg transition-colors ${isSelected ? 'bg-primary/10' : 'hover:bg-muted/50'}`}
                                >
                                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/30'}`}>
                                        {isSelected && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleSplitParticipant(originalIdx, p)}
                                        className="sr-only"
                                    />
                                    <div className={`w-6 h-6 rounded-md ${getAvatarColor(p)} flex items-center justify-center text-white text-[10px] font-bold`}>
                                        {p[0].toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium">{p}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-4 border-t border-border/50">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {t.session.addedOn} {new Date(tx.date).toLocaleDateString()}
                </span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTxToDelete(originalIdx)}
                    className="text-destructive hover:bg-destructive/10 rounded-xl gap-2"
                >
                    <Trash2 className="w-4 h-4" />
                    {t.session.remove}
                </Button>
            </div>
        </motion.div>
    );
});
