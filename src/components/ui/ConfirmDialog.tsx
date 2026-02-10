"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { Button } from "./button";

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "danger" | "warning" | "info";
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    variant = "danger",
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const getIcon = () => {
        switch (variant) {
            case "danger":
                return <AlertCircle className="w-6 h-6 text-destructive" />;
            case "warning":
                return <AlertTriangle className="w-6 h-6 text-amber-500" />;
            case "info":
                return <Info className="w-6 h-6 text-blue-500" />;
        }
    };

    const getConfirmButtonVariant = () => {
        switch (variant) {
            case "danger":
                return "destructive";
            case "warning":
                return "default";
            case "info":
                return "default";
            default:
                return "default";
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCancel}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    />

                    {/* Dialog */}
                    <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`p-3 rounded-xl ${variant === 'danger' ? 'bg-destructive/10' :
                                            variant === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30' :
                                                'bg-blue-100 dark:bg-blue-900/30'
                                        }`}>
                                        {getIcon()}
                                    </div>
                                    <h3 className="text-xl font-bold">{title}</h3>
                                </div>
                                <p className="text-muted-foreground leading-relaxed">
                                    {message}
                                </p>
                            </div>

                            <div className="bg-muted/30 p-4 flex gap-3 justify-end items-center">
                                <Button variant="ghost" onClick={onCancel}>
                                    {cancelLabel}
                                </Button>
                                <Button variant={getConfirmButtonVariant()} onClick={onConfirm}>
                                    {confirmLabel}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
