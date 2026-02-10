"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Spinner } from "@/components/icons/spinner";
import { Header } from "@/components/ui/header";
import { Shield, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function LoginPage() {
    const router = useRouter();
    const { user, isFirebaseActive } = useAuth();
    const [isSigningIn, setIsSigningIn] = useState(false);
    const { t } = useLanguage();

    // If already logged in, redirect to home or dashboard
    useEffect(() => {
        if (user) {
            router.push("/");
        }
    }, [user, router]);

    const handleGoogleSignIn = async () => {
        if (!isFirebaseActive) {
            alert("Firebase is not configured. Please check your .env.local file.");
            return;
        }
        if (!auth || isSigningIn) return;

        setIsSigningIn(true);
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            router.push("/");
        } catch (error) {
            const err = error as { code?: string };
            if (err.code !== "auth/cancelled-popup-request" && err.code !== "auth/popup-closed-by-user") {
                console.error("Error signing in with Google", error);
            }
        } finally {
            setIsSigningIn(false);
        }
    };

    return (
        <>
            <Header />
            <main className="flex-1 flex items-center justify-center relative overflow-hidden bg-background px-4 py-12 min-h-[calc(100vh-80px)]">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <motion.div
                        className="absolute top-[-20%] left-[-15%] w-[50%] h-[50%] rounded-full blur-[150px]"
                        style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)" }}
                        animate={{
                            x: [0, 80, 0],
                            y: [0, 50, 0],
                            scale: [1, 1.1, 1],
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div
                        className="absolute bottom-[-20%] right-[-15%] w-[50%] h-[50%] rounded-full blur-[150px]"
                        style={{ background: "radial-gradient(circle, hsl(var(--accent) / 0.15) 0%, transparent 70%)" }}
                        animate={{
                            x: [0, -80, 0],
                            y: [0, -50, 0],
                            scale: [1, 1.15, 1],
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div
                        className="absolute top-[30%] right-[10%] w-[30%] h-[30%] rounded-full blur-[120px]"
                        style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.1) 0%, transparent 70%)" }}
                        animate={{
                            x: [0, -40, 0],
                            y: [0, 40, 0],
                        }}
                        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-md z-10"
                >
                    <Card className="border-border/50 bg-card/40 backdrop-blur-2xl shadow-2xl overflow-hidden" hover={false}>
                        {/* Animated gradient bar */}
                        <motion.div
                            className="h-1.5 w-full"
                            style={{
                                background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary)))",
                                backgroundSize: "200% 100%",
                            }}
                            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        />

                        <CardHeader className="text-center pt-8 pb-4">
                            {/* Logo Icon */}
                            <motion.div
                                className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center shadow-xl shadow-primary/30"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            >
                                <Sparkles className="w-8 h-8 text-white" />
                            </motion.div>

                            <CardTitle className="text-3xl font-bold tracking-tight">
                                {t.login.welcomeTitle} <span className="gradient-text">{t.login.welcomeHighlight}</span>
                            </CardTitle>
                            <CardDescription className="text-muted-foreground mt-2 max-w-[280px] mx-auto">
                                {t.login.loginDesc}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6 pb-10 px-8">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-border/50" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-card/80 backdrop-blur-sm px-3 py-1 rounded-full text-muted-foreground font-medium flex items-center gap-1.5">
                                        <Shield className="w-3 h-3" />
                                        {t.login.secureAuth}
                                    </span>
                                </div>
                            </div>

                            <Button
                                onClick={handleGoogleSignIn}
                                disabled={isSigningIn}
                                variant="outline"
                                className="w-full h-14 flex items-center justify-center gap-4 text-base border-2 border-border/50 bg-background/50 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 relative group overflow-hidden"
                            >
                                {!isFirebaseActive && (
                                    <div className="absolute inset-x-0 -bottom-1 h-1 bg-destructive/50" />
                                )}

                                {isSigningIn ? (
                                    <>
                                        <Spinner className="w-6 h-6" />
                                        <span className="font-medium">{t.login.connecting}</span>
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
                                        <span className="font-medium">{t.login.continueGoogle}</span>
                                    </>
                                )}
                            </Button>

                            {!isFirebaseActive && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3"
                                >
                                    <div className="w-5 h-5 rounded-full bg-destructive flex items-center justify-center shrink-0 mt-0.5">
                                        <Shield className="w-3 h-3 text-white" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-destructive">
                                            {t.header.firebaseNotConfigured}
                                        </p>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Configure <code>.env.local</code> with your Firebase credentials to enable cloud sync and authentication.
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-center text-sm text-muted-foreground"
                            >
                                {t.login.noAccount}
                            </motion.div>
                        </CardContent>
                    </Card>

                    {/* Trust indicators */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-wrap justify-center gap-4 mt-6 text-xs text-muted-foreground"
                    >
                        <span className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {t.login.encryption}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {t.login.firebaseSecure}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {t.login.noPassword}
                        </span>
                    </motion.div>
                </motion.div>
            </main>
        </>
    );
}
