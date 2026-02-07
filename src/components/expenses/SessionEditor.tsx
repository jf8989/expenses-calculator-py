"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Session, Transaction } from "@/types";
import { saveSession, updateSession } from "@/app/actions/sessions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { calculateSummary, calculateDebts } from "@/lib/calculations";
import { SettleUp } from "./SettleUp";
import { parseTransactions } from "@/lib/parser";
import {
    ArrowLeft,
    Save,
    BarChart3,
    Plus,
    FileText,
    Trash2,
    Calendar,
    Check,
    TrendingUp,
    TrendingDown,
    DollarSign
} from "lucide-react";

interface SessionEditorProps {
    userId: string;
    initialSession?: Session;
    participants: string[];
    onSaved: (sessionId: string) => void;
    onCancel: () => void;
}

// Get avatar color based on name
const getAvatarColor = (name: string) => {
    const colors = [
        "bg-violet-500",
        "bg-blue-500",
        "bg-emerald-500",
        "bg-orange-500",
        "bg-pink-500",
        "bg-red-500",
        "bg-indigo-500",
        "bg-lime-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
};

export function SessionEditor({ userId, initialSession, participants, onSaved, onCancel }: SessionEditorProps) {
    const [name, setName] = useState(initialSession?.name || "");
    const [description, setDescription] = useState(initialSession?.description || "");
    const [transactions, setTransactions] = useState<Transaction[]>(
        initialSession?.transactions.map(tx => ({
            ...tx,
            splitWith: tx.splitWith || [] // Ensure splitWith is always an array
        })) || []
    );
    const [isSaving, setIsSaving] = useState(false);
    const [showSettleUp, setShowSettleUp] = useState(false);
    const [bulkText, setBulkText] = useState("");
    const [showBulk, setShowBulk] = useState(false);

    // Calculate summaries and debts memoized
    const { summaries, debts } = useMemo(() => {
        const s = calculateSummary(transactions, initialSession?.participants || participants);
        const d = calculateDebts(s);
        return { summaries: s, debts: d };
    }, [transactions, participants, initialSession]);

    const handleSave = async () => {
        if (!name.trim()) return;

        setIsSaving(true);
        const sessionData: Omit<Session, "id"> = {
            name: name.trim(),
            description: description.trim(),
            transactions,
            participants: initialSession?.participants || participants,
            currencies: initialSession?.currencies || { "USD": 1 },
        };

        try {
            if (initialSession?.id) {
                await updateSession(userId, initialSession.id, sessionData);
                onSaved(initialSession.id);
            } else {
                const newId = await saveSession(userId, sessionData);
                onSaved(newId);
            }
        } catch (error) {
            console.error("Error saving session", error);
        } finally {
            setIsSaving(false);
        }
    };

    const addTransaction = () => {
        const newTx: Transaction = {
            description: "",
            amount: 0,
            payer: participants[0] || "",
            splitWith: [...participants],
            date: new Date().toISOString().split('T')[0],
        };
        setTransactions(prev => [newTx, ...prev]);
    };

    const updateTransaction = <K extends keyof Transaction>(index: number, field: K, value: Transaction[K]) => {
        const newTxs = [...transactions];
        newTxs[index] = { ...newTxs[index], [field]: value };
        setTransactions(newTxs);
    };

    const toggleSplitParticipant = (txIdx: number, pName: string) => {
        const tx = transactions[txIdx];
        const currentSplitWith = tx.splitWith || []; // Handle undefined
        const splitWith = currentSplitWith.includes(pName)
            ? currentSplitWith.filter(p => p !== pName)
            : [...currentSplitWith, pName];
        updateTransaction(txIdx, "splitWith", splitWith);
    };

    const removeTransaction = (index: number) => {
        setTransactions(prev => prev.filter((_, i) => i !== index));
    };

    const handleBulkImport = () => {
        const parsed = parseTransactions(bulkText, participants[0] || "", participants);
        if (parsed.length > 0) {
            setTransactions(prev => [...parsed, ...prev]);
            setBulkText("");
            setShowBulk(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Sticky Action Bar */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sticky top-20 sm:top-24 z-20 bg-background/80 backdrop-blur-xl p-4 rounded-2xl border border-border/50 shadow-lg"
            >
                <Button variant="ghost" onClick={onCancel} className="rounded-xl gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Dashboard
                </Button>
                <div className="flex gap-3">
                    <Button
                        variant={showSettleUp ? "secondary" : "outline"}
                        onClick={() => setShowSettleUp(!showSettleUp)}
                        className="rounded-xl gap-2 flex-1 sm:flex-none"
                    >
                        <BarChart3 className="w-4 h-4" />
                        {showSettleUp ? "Edit" : "Settle Up"}
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving || !name.trim()}
                        variant="gradient"
                        className="rounded-xl gap-2 flex-1 sm:flex-none"
                    >
                        <Save className="w-4 h-4" />
                        {isSaving ? "Saving..." : "Save"}
                    </Button>
                </div>
            </motion.div>

            <AnimatePresence mode="wait">
                {showSettleUp ? (
                    <motion.div
                        key="settle"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="space-y-8"
                    >
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-bold tracking-tight">Financial <span className="gradient-text">Summary</span></h2>
                            <p className="text-muted-foreground">Here is how to settle up the expenses.</p>
                        </div>
                        <SettleUp summaries={summaries} debts={debts} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="edit"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-8"
                    >
                        {/* Session Info Card */}
                        <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-xl overflow-hidden" hover={false}>
                            <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent to-primary" />
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                    <FileText className="w-6 h-6 text-primary" />
                                    {initialSession ? "Edit" : "Create"} <span className="gradient-text">Session</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Session Name"
                                    placeholder="e.g., Road Trip 2024"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-background/50"
                                />
                                <Textarea
                                    label="Description"
                                    placeholder="Additional notes..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="bg-background/50 min-h-[48px]"
                                />
                            </CardContent>
                        </Card>

                        {/* Live Summary Widget */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {Object.values(summaries).map((s) => {
                                const isPositive = s.balance >= 0;
                                return (
                                    <motion.div
                                        key={s.name}
                                        layout
                                        className={`p-4 rounded-2xl border backdrop-blur-md transition-all ${isPositive
                                            ? "bg-emerald-500/5 border-emerald-500/20"
                                            : "bg-red-500/5 border-red-500/20"
                                            }`}
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{s.name}</span>
                                            {isPositive ? (
                                                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                                            ) : (
                                                <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                                            )}
                                        </div>
                                        <div className={`text-xl font-bold tabular-nums ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
                                            {isPositive ? "+" : ""}{s.balance.toFixed(2)}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Transactions Section */}
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card/30 p-4 rounded-2xl border border-border/50">
                                <div className="flex flex-col">
                                    <h3 className="text-xl font-bold flex items-center gap-2">
                                        <span className="w-2 h-6 rounded-full bg-gradient-to-b from-primary to-accent" />
                                        Transactions
                                    </h3>
                                    <p className="text-sm text-muted-foreground">{transactions.length} items recorded</p>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <Button variant="outline" onClick={() => setShowBulk(!showBulk)} className="rounded-xl flex-1 sm:flex-none">
                                        {showBulk ? "Cancel" : "Bulk Import"}
                                    </Button>
                                    <Button onClick={addTransaction} variant="gradient" className="rounded-xl gap-2 flex-1 sm:flex-none">
                                        <Plus className="w-4 h-4" />
                                        Add Item
                                    </Button>
                                </div>
                            </div>

                            {/* Bulk Import Panel */}
                            <AnimatePresence>
                                {showBulk && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <Card className="border-primary/20 bg-primary/5 mb-6" hover={false}>
                                            <CardContent className="pt-6 space-y-4">
                                                <Textarea
                                                    placeholder="DD/MM/YYYY : Description - Amount (one per line)"
                                                    value={bulkText}
                                                    onChange={(e) => setBulkText(e.target.value)}
                                                    className="min-h-[150px] font-mono text-sm"
                                                />
                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                                    <p className="text-xs text-muted-foreground">Format: 25/03/2024 : Coffee - 15.50</p>
                                                    <Button onClick={handleBulkImport} disabled={!bulkText.trim()}>Import Transactions</Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Transaction Cards */}
                            <div className="space-y-4">
                                {transactions.map((tx, idx) => (
                                    <motion.div
                                        key={idx}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-5 sm:p-6 rounded-2xl bg-card border border-border/50 shadow-sm space-y-5 relative group"
                                    >
                                        <div className="flex flex-wrap gap-6 items-start">
                                            <div className="flex-1 min-w-[250px] space-y-4">
                                                <Input
                                                    label="Description"
                                                    placeholder="What was bought?"
                                                    value={tx.description}
                                                    onChange={(e) => updateTransaction(idx, "description", e.target.value)}
                                                />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <Input
                                                        label="Amount"
                                                        type="number"
                                                        value={tx.amount || ""}
                                                        onChange={(e) => updateTransaction(idx, "amount", parseFloat(e.target.value) || 0)}
                                                    />
                                                    <div>
                                                        <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Paid By</label>
                                                        <select
                                                            className="w-full h-12 rounded-xl bg-background/50 border-2 border-border px-4 text-sm focus:border-primary focus:shadow-[0_0_0_4px_hsl(var(--primary)/0.1)] outline-none transition-all hover:border-muted-foreground/30"
                                                            value={tx.payer}
                                                            onChange={(e) => updateTransaction(idx, "payer", e.target.value)}
                                                        >
                                                            {participants.map(p => <option key={p} value={p}>{p}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="min-w-[200px] bg-muted/30 p-4 rounded-xl border border-border/50">
                                                <div className="flex justify-between items-center mb-3">
                                                    <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Split With</label>
                                                    {tx.amount > 0 && tx.splitWith?.length > 0 && (
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                                            ${(tx.amount / (tx.splitWith?.length || 1)).toFixed(2)} each
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    {participants.map(p => {
                                                        const isSelected = tx.splitWith?.includes(p) || false;
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
                                                                    onChange={() => toggleSplitParticipant(idx, p)}
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
                                                Added on {new Date(tx.date).toLocaleDateString()}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeTransaction(idx)}
                                                className="text-destructive hover:bg-destructive/10 rounded-xl gap-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Remove
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {transactions.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center gap-3 py-12 text-center"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
                                        <FileText className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <p className="text-muted-foreground">No transactions yet. Add your first expense!</p>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
