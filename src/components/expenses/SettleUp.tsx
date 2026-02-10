"use client";

import { motion } from "framer-motion";
import { Debt, ParticipantSummary } from "@/lib/calculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, TrendingUp, TrendingDown, CheckCircle2, Wallet } from "lucide-react";

interface SettleUpProps {
    summaries: Record<string, ParticipantSummary>;
    debts: Debt[];
}

export function SettleUp({ summaries, debts }: SettleUpProps) {
    const sortedSummaries = Object.values(summaries).sort((a, b) => b.balance - a.balance);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Balances Card */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-xl overflow-hidden" hover={false}>
                    <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500" />
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-primary" />
                            Balances
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {sortedSummaries.map((s, idx) => {
                            const isPositive = s.balance >= 0;
                            return (
                                <motion.div
                                    key={s.name}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={`p-3 rounded-xl border transition-colors ${isPositive
                                        ? "bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10"
                                        : "bg-red-500/5 border-red-500/20 hover:bg-red-500/10"
                                        }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            {isPositive ? (
                                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                                            ) : (
                                                <TrendingDown className="w-4 h-4 text-red-500" />
                                            )}
                                            <span className="font-medium">{s.name}</span>
                                        </div>
                                        <span className={`font-bold tabular-nums ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
                                            {isPositive ? "+" : ""}${s.balance.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex gap-4 mt-1.5 ml-6 text-xs text-muted-foreground">
                                        <span>Spent: <strong className="text-foreground">${s.totalSpent.toFixed(2)}</strong></span>
                                        <span>Owed: <strong className="text-foreground">${s.totalOwed.toFixed(2)}</strong></span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </CardContent>
                </Card>

                {/* Suggested Payments Card */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-xl overflow-hidden" hover={false}>
                    <div className="h-1 w-full bg-gradient-to-r from-primary to-accent" />
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <ArrowRight className="w-5 h-5 text-primary" />
                            Suggested Payments
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {debts.length > 0 ? (
                            debts.map((debt, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group hover:from-primary/10 hover:to-accent/10 transition-colors"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-sm text-muted-foreground">
                                            <span className="font-bold text-foreground">{debt.from}</span> pays
                                        </span>
                                        <span className="text-2xl font-bold gradient-text">${debt.amount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <motion.div
                                            className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10"
                                            animate={{ x: [0, 5, 0] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        >
                                            <ArrowRight className="w-5 h-5 text-primary" />
                                        </motion.div>
                                        <span className="font-bold text-lg">{debt.to}</span>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center gap-3 text-center py-8"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                </div>
                                <div>
                                    <p className="font-medium text-emerald-500">All settled up!</p>
                                    <p className="text-sm text-muted-foreground">No debts to settle. Everything is balanced.</p>
                                </div>
                            </motion.div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
