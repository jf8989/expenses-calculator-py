"use client";

import { motion } from "framer-motion";
import { Debt, ParticipantSummary } from "@/lib/calculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SettleUpProps {
    summaries: Record<string, ParticipantSummary>;
    debts: Debt[];
}

export function SettleUp({ summaries, debts }: SettleUpProps) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold">Balances</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {Object.values(summaries).sort((a, b) => b.balance - a.balance).map((s) => (
                            <div key={s.name} className="flex justify-between items-center p-3 rounded-xl bg-background/50 border border-border/50">
                                <span className="font-medium">{s.name}</span>
                                <span className={`font-bold ${s.balance >= 0 ? "text-green-500" : "text-red-500"}`}>
                                    {s.balance >= 0 ? "+" : ""}{s.balance.toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold">Suggested Payments</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {debts.length > 0 ? debts.map((debt, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between"
                            >
                                <div className="flex flex-col">
                                    <span className="text-sm text-muted-foreground"><span className="font-bold text-foreground">{debt.from}</span> pays</span>
                                    <span className="text-lg font-bold text-primary">${debt.amount.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl text-primary">→</span>
                                    <span className="font-bold">{debt.to}</span>
                                </div>
                            </motion.div>
                        )) : (
                            <p className="text-center py-8 text-muted-foreground italic">No debts to settle. Everything is balanced!</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
