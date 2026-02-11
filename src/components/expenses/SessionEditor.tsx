"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Session, Transaction } from "@/types";
import { saveSession, updateSession } from "@/app/actions/sessions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { calculateMultiCurrencySummary, calculateMultiCurrencyDebts } from "@/lib/calculations";
import { SettleUp } from "./SettleUp";
import { parseTransactions } from "@/lib/parser";
import { formatCurrency } from "@/lib/utils";
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
    CheckSquare,
    Square,
    CheckCircle2,
    Coins,
    X,
    Search,
    Filter,
    Users,
} from "lucide-react";
import { getAvatarColor } from "@/lib/avatarUtils";
import { useLanguage } from "@/context/LanguageContext";
import { useAppStore } from "@/store/useAppStore";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { exportSessionPdf } from "@/lib/pdfExport";
import { FileDown, Loader2 } from "lucide-react";

interface SessionEditorProps {
    userId: string;
    initialSession?: Session;
    participants: string[];
    onSaved: (sessionId: string) => void;
    onCancel: () => void;
}

// Common currencies
const CURRENCY_OPTIONS = [
    "USD", "EUR", "GBP", "COP", "PEN", "MXN", "ARS", "BRL", "JPY",
    "CAD", "AUD", "CHF", "INR", "CNY", "KRW", "SEK", "NOK",
    "DKK", "NZD", "ZAR", "CLP",
];

export function SessionEditor({ userId, initialSession, participants, onSaved, onCancel }: SessionEditorProps) {
    const {
        activeSession,
        setActiveSession,
        updateActiveSession,
        addTransaction: addStoreTransaction,
        removeTransaction: removeStoreTransaction,
        updateTransaction: updateStoreTransaction,
        resetActiveSession,
    } = useAppStore();

    const { t, language } = useLanguage();

    // Local UI-only state
    const [isSaving, setIsSaving] = useState(false);
    const [showSettleUp, setShowSettleUp] = useState(false);
    const [bulkText, setBulkText] = useState("");
    const [showBulk, setShowBulk] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [newCurrencyCode, setNewCurrencyCode] = useState("");
    const [newCurrencyRate, setNewCurrencyRate] = useState("");
    const [isExporting, setIsExporting] = useState(false);
    const [participantInput, setParticipantInput] = useState("");

    // Dialog states
    const [txToDelete, setTxToDelete] = useState<number | null>(null);
    const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    const { showToast } = useToast();

    // Initialize/Sync active session with initialSession
    useEffect(() => {
        // Only initialize if we don't have an active session yet,
        // OR if the initialSession id is different from the active one (switching sessions)
        const isDifferentSession = initialSession && activeSession?.id !== initialSession.id;

        if (initialSession && (!activeSession || isDifferentSession)) {
            setActiveSession({
                ...initialSession,
                mainCurrency: initialSession.mainCurrency || "USD",
                transactions: (initialSession.transactions || []).map(tx => ({
                    ...tx,
                    assigned_to: tx.assigned_to || (tx as any).splitWith || [],
                    currency: tx.currency || undefined,
                }))
            });
        } else if (!activeSession) {
            setActiveSession({
                name: "",
                description: "",
                transactions: [],
                participants: participants,
                mainCurrency: "USD",
                currencies: {},
            });
        } else if (!initialSession && activeSession.participants.length === 0 && participants.length > 0) {
            // Case where we are creating a new session and global participants were loaded or added
            // and the session currently has 0. We should probably offer to sync or auto-sync if it's brand new.
            // For now, let's just make sure they are available in the 'suggested' list which we'll add below.
        }
    }, [initialSession, setActiveSession, participants, activeSession?.id, activeSession?.participants?.length]);

    // Computed states from activeSession
    const name = activeSession?.name || "";
    const description = activeSession?.description || "";
    const transactions = activeSession?.transactions || [];
    const mainCurrency = activeSession?.mainCurrency || "USD";
    const secondaryCurrency = activeSession?.secondaryCurrency || "";
    const currencies = activeSession?.currencies || {};

    // Helper setters for activeSession fields
    const setName = (newName: string) => updateActiveSession({ name: newName });
    const setDescription = (newDesc: string) => updateActiveSession({ description: newDesc });
    const setSecondaryCurrency = (newSecondary: string) => updateActiveSession({ secondaryCurrency: newSecondary });
    const setCurrencies = (newCurrencies: Record<string, number> | ((prev: Record<string, number>) => Record<string, number>)) => {
        updateActiveSession(prev => ({
            ...prev,
            currencies: typeof newCurrencies === "function" ? newCurrencies(prev.currencies) : newCurrencies
        }));
    };

    // All available currencies for this session (for per-transaction toggle)
    const availableCurrencies = useMemo(() => {
        const set = new Set<string>([mainCurrency]);
        if (secondaryCurrency) set.add(secondaryCurrency);
        Object.keys(currencies).forEach(c => set.add(c));
        return Array.from(set);
    }, [mainCurrency, secondaryCurrency, currencies]);

    // Filtered transactions for visual search
    const filteredTransactions = useMemo(() => {
        if (!searchQuery.trim()) return transactions;
        const query = searchQuery.toLowerCase();
        return transactions.filter(tx =>
            tx.description.toLowerCase().includes(query) ||
            tx.amount.toString().includes(query) ||
            tx.date.includes(query)
        );
    }, [transactions, searchQuery]);

    // Calculate per-currency summaries and debts (no conversion — each currency stays separate)
    const { multiSummaries, multiDebts } = useMemo(() => {
        const ms = calculateMultiCurrencySummary(
            transactions,
            activeSession?.participants || participants,
            mainCurrency,
        );
        const md = calculateMultiCurrencyDebts(ms);
        return { multiSummaries: ms, multiDebts: md };
    }, [transactions, participants, activeSession?.participants, mainCurrency]);

    const sessionParticipants = activeSession?.participants || [];

    const suggestedParticipants = useMemo(() => {
        return participants.filter(p => !sessionParticipants.includes(p));
    }, [participants, sessionParticipants]);

    const fmt = (amount: number, currency?: string) => formatCurrency(Math.abs(amount), currency || mainCurrency);

    const handleExport = async () => {
        if (!activeSession) return;
        setIsExporting(true);
        try {
            await exportSessionPdf(activeSession, language);
            showToast("PDF exported successfully");
        } catch (error) {
            console.error("Error exporting PDF", error);
            showToast(t.common?.error || "Error", "error");
        } finally {
            setIsExporting(false);
        }
    };

    const handleSave = async () => {
        if (!name.trim() || !activeSession) return;

        setIsSaving(true);
        const sessionData: Omit<Session, "id"> = {
            ...activeSession,
            name: name.trim(),
            description: description.trim(),
        };

        try {
            if (activeSession.id) {
                await updateSession(userId, activeSession.id, sessionData);
                onSaved(activeSession.id);
                showToast(t.session.savedSuccess);
            } else {
                const newId = await saveSession(userId, sessionData);
                onSaved(newId);
                // Update active session with the new ID
                updateActiveSession({ id: newId });
                showToast(t.session.savedSuccess);
            }
        } catch (error) {
            console.error("Error saving session", error);
            showToast(t.common?.error || "Error saving session", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const addTransaction = () => {
        const newTx: Transaction = {
            description: "",
            amount: 0,
            assigned_to: [...sessionParticipants],
            date: new Date().toISOString().split('T')[0],
            currency: mainCurrency,
        };
        addStoreTransaction(newTx);
    };

    const updateTransaction = <K extends keyof Transaction>(index: number, field: K, value: Transaction[K]) => {
        updateStoreTransaction(index, { [field]: value });
    };

    const toggleSplitParticipant = (txIdx: number, pName: string) => {
        const tx = transactions[txIdx];
        const currentAssignedTo = tx.assigned_to || [];
        const assigned_to = currentAssignedTo.includes(pName)
            ? currentAssignedTo.filter(p => p !== pName)
            : [...currentAssignedTo, pName];
        updateTransaction(txIdx, "assigned_to", assigned_to);
    };

    const removeTransaction = () => {
        if (txToDelete !== null) {
            removeStoreTransaction(txToDelete);
            setTxToDelete(null);
            showToast(t.session.remove + " success");
        }
    };

    const clearAllTransactions = () => {
        updateActiveSession({ transactions: [] });
        setShowClearAllConfirm(false);
        showToast("Cleared all transactions");
    };

    const handleBulkImport = () => {
        if (!bulkText.trim()) return;
        const parsed = parseTransactions(bulkText, participants[0] || "", participants);
        if (parsed.length > 0) {
            parsed.forEach(tx => addStoreTransaction(tx));
            showToast(`${parsed.length} transactions imported`);
            setBulkText("");
            setShowBulk(false);
        } else {
            showToast("No valid transactions found", "error");
        }
    };

    const toggleAllParticipants = (txIdx: number) => {
        const tx = transactions[txIdx];
        const allSelected = sessionParticipants.every(p => tx.assigned_to?.includes(p));
        updateTransaction(txIdx, "assigned_to", allSelected ? [] : [...sessionParticipants]);
    };

    const addExtraCurrency = () => {
        const code = newCurrencyCode.trim().toUpperCase();
        const rate = parseFloat(newCurrencyRate);
        if (!code || isNaN(rate) || rate <= 0) return;
        if (code === mainCurrency) return;
        updateActiveSession(prev => ({
            ...prev,
            currencies: { ...prev.currencies, [code]: rate }
        }));
        setNewCurrencyCode("");
        setNewCurrencyRate("");
    };

    const addSessionParticipant = () => {
        const name = participantInput.trim();
        if (!name) return;

        const currentParticipants = activeSession?.participants || [];
        if (currentParticipants.includes(name)) {
            showToast(t.participants.alreadyAdded || "Already added", "error");
            return;
        }

        updateActiveSession({
            participants: [...currentParticipants, name]
        });
        setParticipantInput("");
    };

    const removeSessionParticipant = (participant: string) => {
        const currentParticipants = activeSession?.participants || [];
        updateActiveSession({
            participants: currentParticipants.filter(p => p !== participant)
        });

        // Also cleanup transactions if they were assigned to this person
        const updatedTransactions = transactions.map(tx => ({
            ...tx,
            payer: tx.payer === participant ? undefined : tx.payer,
            assigned_to: tx.assigned_to.filter(p => p !== participant)
        }));
        updateActiveSession({ transactions: updatedTransactions });
    };

    const removeExtraCurrency = (code: string) => {
        updateActiveSession(prev => {
            const nextCurrencies = { ...prev.currencies };
            delete nextCurrencies[code];

            // Reset any transactions using this currency back to main
            const nextTransactions = prev.transactions.map(tx =>
                tx.currency === code ? { ...tx, currency: mainCurrency } : tx
            );

            return {
                ...prev,
                currencies: nextCurrencies,
                transactions: nextTransactions
            };
        });
    };

    // When main currency changes, update secondary's rate context
    const handleMainCurrencyChange = (newMain: string) => {
        updateActiveSession(prev => {
            const nextCurrencies = { ...prev.currencies };
            if (nextCurrencies[newMain]) {
                delete nextCurrencies[newMain];
            }

            // Reset transaction currencies that were the old main
            const nextTransactions = prev.transactions.map(tx =>
                (!tx.currency || tx.currency === mainCurrency) ? { ...tx, currency: newMain } : tx
            );

            return {
                ...prev,
                mainCurrency: newMain,
                currencies: nextCurrencies,
                transactions: nextTransactions
            };
        });
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Sticky Action Bar */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sticky top-20 sm:top-24 z-20 bg-background/80 backdrop-blur-xl p-4 rounded-2xl border border-border/50 shadow-lg"
            >
                <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={onCancel} className="rounded-xl gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        {t.session.dashboard}
                    </Button>
                    <Button variant="ghost" onClick={() => setShowResetConfirm(true)} className="rounded-xl gap-2 text-primary hover:bg-primary/10">
                        <Plus className="w-4 h-4" />
                        {t.dashboard.newSession}
                    </Button>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant={showSettleUp ? "secondary" : "outline"}
                        onClick={() => setShowSettleUp(!showSettleUp)}
                        className="rounded-xl gap-2 flex-1 sm:flex-none"
                    >
                        <BarChart3 className="w-4 h-4" />
                        {showSettleUp ? t.session.edit : t.session.settleUp}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleExport}
                        disabled={isExporting || !activeSession}
                        className="rounded-xl gap-2 flex-1 sm:flex-none"
                    >
                        {isExporting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <FileDown className="w-4 h-4" />
                        )}
                        {t.session.exportPdf}
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving || !name.trim()}
                        variant="gradient"
                        className="rounded-xl gap-2 flex-1 sm:flex-none min-w-[120px]"
                    >
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        {isSaving ? t.session.saving : t.session.save}
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
                            <h2 className="text-3xl font-bold tracking-tight">{t.settle.financialSummary} <span className="gradient-text">{t.settle.summaryHighlight}</span></h2>
                            <p className="text-muted-foreground">{t.settle.howToSettle}</p>
                        </div>
                        <SettleUp multiSummaries={multiSummaries} multiDebts={multiDebts} mainCurrency={mainCurrency} />
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
                                    {initialSession ? t.session.edit : t.session.create} <span className="gradient-text">{t.session.sessionLabel}</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label={t.session.sessionName}
                                    placeholder={t.session.sessionNamePlaceholder}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-background/50"
                                />
                                <Textarea
                                    label={t.session.description}
                                    placeholder={t.session.descriptionPlaceholder}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="bg-background/50 min-h-[48px]"
                                />
                            </CardContent>
                        </Card>

                        {/* Session Participants Card */}
                        <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-xl overflow-hidden" hover={false}>
                            <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-violet-500" />
                            <CardHeader>
                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                    <Users className="w-5 h-5 text-violet-500" />
                                    {t.session.sessionParticipants}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder={t.session.participantName}
                                        value={participantInput}
                                        onChange={(e) => setParticipantInput(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && addSessionParticipant()}
                                        className="bg-background/50"
                                    />
                                    <Button
                                        variant="outline"
                                        onClick={addSessionParticipant}
                                        className="gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span className="hidden sm:inline">{t.session.addParticipant}</span>
                                    </Button>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-2">
                                    {sessionParticipants.map((p) => (
                                        <motion.div
                                            key={p}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-500"
                                        >
                                            <div
                                                className="w-2 h-2 rounded-full"
                                                style={{ backgroundColor: getAvatarColor(p) }}
                                            />
                                            <span className="text-sm font-medium">{p}</span>
                                            <button
                                                onClick={() => removeSessionParticipant(p)}
                                                className="p-0.5 hover:bg-violet-500/20 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </motion.div>
                                    ))}
                                    {sessionParticipants.length === 0 && (
                                        <p className="text-sm text-muted-foreground italic w-full text-center py-4">
                                            {t.participants.noParticipants}
                                        </p>
                                    )}
                                </div>

                                {suggestedParticipants.length > 0 && (
                                    <div className="pt-4 space-y-2">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                                            {t.session.suggestedParticipants || "Suggested from your list"}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {suggestedParticipants.map((p) => (
                                                <button
                                                    key={p}
                                                    onClick={() => {
                                                        const currentParticipants = activeSession?.participants || [];
                                                        updateActiveSession({
                                                            participants: [...currentParticipants, p]
                                                        });
                                                    }}
                                                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50 border border-border hover:bg-violet-500/10 hover:border-violet-500/30 hover:text-violet-500 transition-all text-sm group"
                                                >
                                                    <Plus className="w-3 h-3 text-muted-foreground group-hover:text-violet-500" />
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Currency Settings Card */}
                        <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-xl overflow-hidden" hover={false}>
                            <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500" />
                            <CardHeader>
                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                    <Coins className="w-5 h-5 text-amber-500" />
                                    {t.session.currencySettings}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Main & Secondary Currency */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">{t.session.mainCurrency}</label>
                                        <select
                                            className="w-full h-12 rounded-xl bg-background/50 border-2 border-border px-4 text-sm focus:border-primary focus:shadow-[0_0_0_4px_hsl(var(--primary)/0.1)] outline-none transition-all hover:border-muted-foreground/30"
                                            value={mainCurrency}
                                            onChange={(e) => handleMainCurrencyChange(e.target.value)}
                                        >
                                            {CURRENCY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">{t.session.secondaryCurrency}</label>
                                        <select
                                            className="w-full h-12 rounded-xl bg-background/50 border-2 border-border px-4 text-sm focus:border-primary focus:shadow-[0_0_0_4px_hsl(var(--primary)/0.1)] outline-none transition-all hover:border-muted-foreground/30"
                                            value={secondaryCurrency}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setSecondaryCurrency(val);
                                                // Auto-add to currencies if not already there (with rate 1 as placeholder)
                                                if (val && val !== mainCurrency && !currencies[val]) {
                                                    setCurrencies(prev => ({ ...prev, [val]: 1 }));
                                                }
                                            }}
                                        >
                                            <option value="">—</option>
                                            {CURRENCY_OPTIONS.filter(c => c !== mainCurrency).map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Extra Currencies with Rates */}
                                <div className="space-y-3">
                                    {Object.entries(currencies).length > 0 && (
                                        <div className="space-y-2">
                                            {Object.entries(currencies).map(([code, rate]) => (
                                                <div key={code} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                                                    <span className="text-sm font-bold text-primary min-w-[50px]">{code}</span>
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <input
                                                            type="number"
                                                            value={rate}
                                                            onChange={(e) => {
                                                                const newRate = parseFloat(e.target.value) || 0;
                                                                setCurrencies(prev => ({ ...prev, [code]: newRate }));
                                                            }}
                                                            className="w-28 h-9 rounded-lg bg-background/70 border border-border px-3 text-sm outline-none focus:border-primary transition-colors tabular-nums"
                                                            step="any"
                                                            min="0"
                                                        />
                                                        <span className="text-xs text-muted-foreground whitespace-nowrap">{t.session.rateHint} {mainCurrency}</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeExtraCurrency(code)}
                                                        className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Add New Currency */}
                                    <div className="flex items-end gap-3">
                                        <div className="flex-1">
                                            <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">{t.session.currency}</label>
                                            <select
                                                className="w-full h-10 rounded-xl bg-background/50 border-2 border-border px-3 text-sm outline-none focus:border-primary transition-all"
                                                value={newCurrencyCode}
                                                onChange={(e) => setNewCurrencyCode(e.target.value)}
                                            >
                                                <option value="">—</option>
                                                {CURRENCY_OPTIONS.filter(c => c !== mainCurrency && !currencies[c]).map(c => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">{t.session.exchangeRate}</label>
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                value={newCurrencyRate}
                                                onChange={(e) => setNewCurrencyRate(e.target.value)}
                                                className="w-full h-10 rounded-xl bg-background/50 border-2 border-border px-3 text-sm outline-none focus:border-primary transition-all tabular-nums"
                                                step="any"
                                                min="0"
                                            />
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={addExtraCurrency}
                                            disabled={!newCurrencyCode || !newCurrencyRate}
                                            className="rounded-xl gap-1 h-10"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            {t.session.addCurrency}
                                        </Button>
                                    </div>

                                    {Object.keys(currencies).length === 0 && (
                                        <p className="text-xs text-muted-foreground text-center py-2">{t.session.noCurrencyHint}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Live Summary Widget — per currency */}
                        <div className="space-y-4">
                            {Object.entries(multiSummaries).map(([currency, summaries]) => {
                                const activeSummaries = Object.values(summaries).filter(
                                    s => Math.abs(s.balance) > 0.01 || s.totalPaid > 0.01 || s.fairShare > 0.01
                                );
                                if (activeSummaries.length === 0) return null;
                                return (
                                    <div key={currency}>
                                        {Object.keys(multiSummaries).length > 1 && (
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-wider">
                                                    {currency}
                                                </span>
                                                <div className="flex-1 h-px bg-border/50" />
                                            </div>
                                        )}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                            {activeSummaries.map((s) => {
                                                const isPositive = s.balance >= 0;
                                                return (
                                                    <motion.div
                                                        key={`${currency}-${s.name}`}
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
                                                        <div className={`text-lg font-bold tabular-nums ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
                                                            {isPositive ? t.settle.getsBack : t.settle.owes} {fmt(s.balance, currency)}
                                                        </div>
                                                        <div className="flex gap-3 mt-1 text-[10px] text-muted-foreground">
                                                            <span>{t.settle.paid}: {fmt(s.totalPaid, currency)}</span>
                                                            <span>{t.settle.fairShare}: {fmt(s.fairShare, currency)}</span>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Transactions Section */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <span className="w-2 h-6 rounded-full bg-gradient-to-b from-primary to-accent" />
                                {t.session.transactions}
                            </h3>
                            <p className="text-sm text-muted-foreground">{transactions.length} {t.session.itemsRecorded}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto flex-1 max-w-2xl px-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search transactions..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 bg-background/50 border-border/50 focus:border-primary/50"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setShowBulk(!showBulk)} className="rounded-xl flex-1 sm:flex-none">
                                    {showBulk ? t.session.cancel : t.session.bulkImport}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowClearAllConfirm(true)}
                                    disabled={transactions.length === 0}
                                    className="rounded-xl flex-1 sm:flex-none text-destructive hover:bg-destructive/10"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                                <Button onClick={addTransaction} variant="gradient" className="rounded-xl gap-2 flex-1 sm:flex-none">
                                    <Plus className="w-4 h-4" />
                                    {t.session.addItem}
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
                                                <p className="text-xs text-muted-foreground">{t.session.bulkFormat}</p>
                                                <Button onClick={handleBulkImport} disabled={!bulkText.trim()}>{t.session.importTransactions}</Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Transaction Cards */}
                        <div className="space-y-4">
                            {filteredTransactions.map((tx, idx) => {
                                // Need to find original index for store updates as map order might differ due to filtering
                                const originalIdx = transactions.indexOf(tx);
                                return (
                                    <motion.div
                                        key={originalIdx}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-5 sm:p-6 rounded-2xl bg-card border border-border/50 shadow-sm space-y-5 relative group"
                                    >
                                        <div className="flex flex-wrap gap-6 items-start">
                                            <div className="flex-1 min-w-[250px] space-y-4">
                                                <Input
                                                    label={t.session.description}
                                                    placeholder={t.session.whatWasBought}
                                                    value={tx.description}
                                                    onChange={(e) => updateTransaction(originalIdx, "description", e.target.value)}
                                                />
                                                <div className="grid grid-cols-3 gap-4">
                                                    <Input
                                                        label={t.session.amount}
                                                        type="number"
                                                        value={tx.amount || ""}
                                                        onChange={(e) => updateTransaction(originalIdx, "amount", parseFloat(e.target.value) || 0)}
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
                                                        <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t.session.paidBy}</label>
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
                            })}
                        </div>

                        {filteredTransactions.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center gap-3 py-12 text-center"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
                                    <FileText className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <p className="text-muted-foreground">{searchQuery ? "No matching transactions" : t.session.noTransactions}</p>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Dialogs */}
            <ConfirmDialog
                isOpen={txToDelete !== null}
                title="Delete Transaction"
                message="Are you sure you want to delete this transaction?"
                onConfirm={removeTransaction}
                onCancel={() => setTxToDelete(null)}
            />

            <ConfirmDialog
                isOpen={showClearAllConfirm}
                title={t.session.confirmClear}
                message={t.session.confirmClearMsg}
                onConfirm={clearAllTransactions}
                onCancel={() => setShowClearAllConfirm(false)}
            />

            <ConfirmDialog
                isOpen={showResetConfirm}
                title={t.session.confirmReset}
                message={t.session.confirmResetMsg}
                onConfirm={() => {
                    resetActiveSession();
                    setShowResetConfirm(false);
                    showToast("New session started");
                }}
                onCancel={() => setShowResetConfirm(false)}
            />
        </div >
    );
}
