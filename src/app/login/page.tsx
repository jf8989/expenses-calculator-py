"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Spinner } from "@/components/icons/spinner";
import { Header } from "@/components/ui/header";

export default function LoginPage() {
    const router = useRouter();
    const { user, isFirebaseActive } = useAuth();
    const [isSigningIn, setIsSigningIn] = useState(false);

    // If already logged in, redirect to home or dashboard
    if (user) {
        router.push("/");
    }

    const handleGoogleSignIn = async () => {
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
            <main className="flex-1 flex items-center justify-center relative overflow-hidden bg-background px-4">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 z-0">
                    <motion.div
                        className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]"
                        animate={{
                            x: [0, 50, 0],
                            y: [0, 30, 0],
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div
                        className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]"
                        animate={{
                            x: [0, -50, 0],
                            y: [0, -30, 0],
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-md z-10"
                >
                    <Card className="border-border/50 bg-card/50 backdrop-blur-2xl shadow-2xl overflow-hidden">
                        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-blue-500 to-purple-600" />
                        <CardHeader className="text-center pt-8 pb-4">
                            <CardTitle className="text-3xl font-bold tracking-tight">
                                Welcome <span className="gradient-text">Back</span>
                            </CardTitle>
                            <CardDescription className="text-muted-foreground mt-2">
                                Sign in to manage your expenses and split bills with ease.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pb-10">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-transparent px-2 text-muted-foreground font-medium">
                                        Secure Authentication
                                    </span>
                                </div>
                            </div>

                            <Button
                                onClick={handleGoogleSignIn}
                                disabled={!isFirebaseActive || isSigningIn}
                                variant="outline"
                                className="w-full h-14 flex items-center justify-center gap-4 text-lg border-primary/20 hover:bg-primary/5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {isSigningIn ? (
                                    <>
                                        <Spinner className="w-6 h-6" />
                                        Connecting...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-6 h-6" viewBox="0 0 24 24">
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
                                        Continue with Google
                                    </>
                                )}
                            </Button>

                            <div className="text-center text-sm text-muted-foreground mt-4">
                                Don&apos;t have an account? No worries, we&apos;ll create one for you automatically.
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </main>
        </>
    );
}
