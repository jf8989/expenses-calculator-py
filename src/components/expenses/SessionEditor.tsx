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

interface SessionEditorProps {
    userId: string;
    initialSession?: Session;
    participants: string[];
    onSaved: (sessionId: string) => void;
    onCancel: () => void;
}

export function SessionEditor({ userId, initialSession, participants, onSaved, onCancel }: SessionEditorProps) {
    const [name, setName] = useState(initialSession?.name || "");
    const [description, setDescription] = useState(initialSession?.description || "");
    const [transactions, setTransactions] = useState<Transaction[]>(initialSession?.transactions || []);
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
        const splitWith = tx.splitWith.includes(pName)
            ? tx.splitWith.filter(p => p !== pName)
            : [...tx.splitWith, pName];
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
            <div className="flex items-center justify-between sticky top-24 z-20 bg-background/80 backdrop-blur-md p-4 rounded-3xl border border-border/50 shadow-lg">
                <Button variant="ghost" onClick={onCancel} className="rounded-xl">← Dashboard</Button>
                <div className="flex gap-3">
                    <Button
                        variant={showSettleUp ? "secondary" : "outline"}
                        onClick={() => setShowSettleUp(!showSettleUp)}
                        className="rounded-xl"
                    >
                        {showSettleUp ? "Edit Transactions" : "View Settle Up"}
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving || !name.trim()} className="rounded-xl px-8 shadow-primary/20 shadow-lg">
                        {isSaving ? "Saving..." : "Save Session"}
                    </Button>
                </div>
            </div>

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
                        <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-xl overflow-hidden border-t-4 border-t-primary">
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold">
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
                                    className="bg-background/50 h-10 min-h-[40px]"
                                />
                            </CardContent>
                        </Card>

                        <div className="space-y-6">
                            <div className="flex justify-between items-center bg-secondary/20 p-4 rounded-2xl border border-border/50">
                                <div className="flex flex-col">
                                    <h3 className="text-xl font-bold">Transactions</h3>
                                    <p className="text-sm text-muted-foreground">{transactions.length} items recorded</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => setShowBulk(!showBulk)} className="rounded-xl">
                                        {showBulk ? "Cancel Import" : "Bulk Import"}
                                    </Button>
                                    <Button onClick={addTransaction} className="rounded-xl shadow-primary/10 shadow-lg">
                                        + Add Item
                                    </Button>
                                </div>
                            </div>

                            <AnimatePresence>
                                {showBulk && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <Card className="border-primary/20 bg-primary/5 mb-6">
                                            <CardContent className="pt-6 space-y-4">
                                                <Textarea
                                                    placeholder="DD/MM/YYYY : Description - Amount (one per line)"
                                                    value={bulkText}
                                                    onChange={(e) => setBulkText(e.target.value)}
                                                    className="min-h-[150px] font-mono text-sm"
                                                />
                                                <div className="flex justify-between items-center">
                                                    <p className="text-xs text-muted-foreground">Format: 25/03/2024 : Coffee - 15.50</p>
                                                    <Button onClick={handleBulkImport} disabled={!bulkText.trim()}>Import Transactions</Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-4">
                                {transactions.map((tx, idx) => (
                                    <motion.div
                                        key={idx}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-6 rounded-3xl bg-card border border-border/50 shadow-sm space-y-6 relative group"
                                    >
                                        <div className="flex flex-wrap gap-6 items-start">
                                            <div className="flex-1 min-w-[250px] space-y-4">
                                                <Input
                                                    label="Description"
                                                    placeholder="What was bought?"
                                                    value={tx.description}
                                                    onChange={(e) => updateTransaction(idx, "description", e.target.value)}
                                                />
                                                <div className="flex gap-4">
                                                    <div className="flex-1">
                                                        <Input
                                                            label="Amount"
                                                            type="number"
                                                            value={tx.amount || ""}
                                                            onChange={(e) => updateTransaction(idx, "amount", parseFloat(e.target.value) || 0)}
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5 block">Paid By</label>
                                                        <select
                                                            className="w-full h-11 rounded-xl bg-secondary/50 border border-border px-4 text-sm focus:ring-2 ring-primary/20 outline-none transition-all"
                                                            value={tx.payer}
                                                            onChange={(e) => updateTransaction(idx, "payer", e.target.value)}
                                                        >
                                                            {participants.map(p => <option key={p} value={p}>{p}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="min-w-[200px] bg-secondary/10 p-4 rounded-2xl border border-border/50">
                                                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 block">Split With</label>
                                                <div className="space-y-2">
                                                    {participants.map(p => (
                                                        <label key={p} className="flex items-center gap-2 cursor-pointer hover:bg-primary/5 p-1 rounded-lg transition-colors">
                                                            <input
                                                                type="checkbox"
                                                                checked={tx.splitWith.includes(p)}
                                                                onChange={() => toggleSplitParticipant(idx, p)}
                                                                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                                                            />
                                                            <span className="text-sm">{p}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center pt-4 border-t border-border/50">
                                            <span className="text-xs text-muted-foreground">Added on {new Date(tx.date).toLocaleDateString()}</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeTransaction(idx)}
                                                className="text-destructive hover:bg-destructive/10 rounded-xl"
                                            >
                                                Remove Item
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
