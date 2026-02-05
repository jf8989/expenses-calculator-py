// src/components/auth/AuthGate.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/icons/spinner";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

const fadeUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

interface AuthGateProps {
    mode: "admin" | "public";
    onManualUnlock?: () => void;
    formData?: {
        businessName: string;
        contactName: string;
        contactEmail: string;
    };
    onFormDataChange?: (field: string, value: string) => void;
    validationErrors?: Record<string, string>;
    customTitle?: string;
    customSubtitle?: string;
    customMessage?: string;
}

export function AuthGate({
    mode,
    onManualUnlock,
    formData,
    onFormDataChange,
    validationErrors = {},
    customTitle,
    customSubtitle,
    customMessage,
}: AuthGateProps) {
    const { t } = useLanguage();
    const { isFirebaseActive } = useAuth();
    const [isSigningIn, setIsSigningIn] = useState(false);

    const handleGoogleSignIn = async () => {
        if (!auth || isSigningIn) return;

        setIsSigningIn(true);
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            // Suppress the "cancelled-popup-request" error as it's expected when user clicks multiple times
            const err = error as { code?: string };
            if (err.code !== "auth/cancelled-popup-request" && err.code !== "auth/popup-closed-by-user") {
                console.error("Error signing in with Google", error);
            }
        } finally {
            setIsSigningIn(false);
        }
    };

    const title = customTitle || t.gate.title;
    const highlight = t.gate.highlight;
    const subtitle = customSubtitle || t.gate.subtitle;

    return (
        <div className="container max-w-2xl mx-auto px-4 py-12 min-h-[70vh] flex flex-col items-center justify-center">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUpVariants}
                className="text-center mb-8 w-full"
            >
                <h1 className="text-h1 sm:text-display-lg mb-4">
                    {title} <span className="gradient-text">{highlight}</span>
                </h1>
                <p className="text-muted-foreground">{subtitle}</p>
            </motion.div>

            <Card className="w-full overflow-hidden border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl">
                <CardHeader className="text-center space-y-2 pb-8">
                    <CardTitle>{t.gate.identification}</CardTitle>
                    {customMessage ? (
                        <p className="text-sm text-muted-foreground">{customMessage}</p>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            {mode === "admin"
                                ? "Se requiere autenticación con Google"
                                : t.gate.chooseMethod}
                        </p>
                    )}
                </CardHeader>
                <CardContent className="space-y-8">
                    <Button
                        onClick={handleGoogleSignIn}
                        disabled={!isFirebaseActive || isSigningIn}
                        variant="outline"
                        className="w-full h-12 flex items-center justify-center gap-3 border-primary/20 hover:bg-primary/5"
                    >
                        {isSigningIn ? (
                            <>
                                <Spinner className="w-5 h-5" />
                                {t.gate.continueGoogle}
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                {t.gate.continueGoogle}
                            </>
                        )}
                    </Button>

                    {mode === "public" && (
                        <>
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-border" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground font-medium">
                                        {t.gate.orManually}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Input
                                    label={t.gate.companyLabel}
                                    placeholder={t.gate.companyPlaceholder}
                                    value={formData?.businessName || ""}
                                    onChange={(e) =>
                                        onFormDataChange?.("businessName", e.target.value)
                                    }
                                />
                                <Input
                                    label={t.gate.nameLabel}
                                    placeholder={t.gate.namePlaceholder}
                                    value={formData?.contactName || ""}
                                    error={validationErrors.contactName}
                                    onChange={(e) =>
                                        onFormDataChange?.("contactName", e.target.value)
                                    }
                                />
                                <Input
                                    label={t.gate.emailLabel}
                                    placeholder={t.gate.emailPlaceholder}
                                    type="email"
                                    value={formData?.contactEmail || ""}
                                    error={validationErrors.contactEmail}
                                    onChange={(e) =>
                                        onFormDataChange?.("contactEmail", e.target.value)
                                    }
                                />
                                <Button
                                    onClick={onManualUnlock}
                                    className="w-full h-12 shadow-lg hover:shadow-primary/20 transition-all duration-300"
                                >
                                    {t.gate.accessButton}
                                </Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
