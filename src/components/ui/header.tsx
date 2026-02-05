// src/components/ui/header.tsx
"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { signOut } from "firebase/auth";
import { motion, useScroll, useTransform } from "framer-motion";
import { auth } from "@/lib/firebase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "./button";

export function Header() {
  const { theme, setTheme } = useTheme();
  const { user, isFirebaseActive } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { scrollY } = useScroll();

  // Create shadow effect on scroll
  const headerShadow = useTransform(
    scrollY,
    [0, 100],
    ["0 0 0 0 rgba(0,0,0,0)", "0 4px 6px -1px rgba(0,0,0,0.1)"]
  );


  const handleSignOut = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  return (
    <motion.header
      className="sticky top-0 z-50 w-full border-b border-border/40 backdrop-blur-xl"
      style={{
        boxShadow: headerShadow as unknown as string,
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="container flex h-20 items-center justify-between px-4 sm:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center space-x-2 transition-opacity hover:opacity-80 shrink-0"
          aria-label="Home"
        >
          <motion.div
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg"
            whileHover={{ rotate: 5, scale: 1.1 }}
          >
            EG
          </motion.div>
          <motion.span
            className="text-lg sm:text-xl font-bold tracking-tight gradient-text whitespace-nowrap"
            whileHover={{ scale: 1.02 }}
          >
            Expense Genie
          </motion.span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1.5 sm:gap-3" role="navigation" aria-label="Main navigation">
          {user ? (
            <>
              <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Authenticated</span>
                <span className="text-sm text-muted-foreground leading-tight">
                  {user.email}
                </span>
              </div>
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="hover:bg-destructive/10 hover:text-destructive transition-colors"
                disabled={!isFirebaseActive}
                aria-label={t.header.signOut}
              >
                {t.header.signOut}
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button
                disabled={!isFirebaseActive}
                size="sm"
                className="shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                title={!isFirebaseActive ? t.header.firebaseNotConfigured : t.header.signIn}
                aria-label={!isFirebaseActive ? t.header.firebaseNotConfigured : t.header.signIn}
              >
                <span className="hidden sm:inline">{t.header.signIn}</span>
                <span className="sm:hidden">{t.header.signInShort}</span>
              </Button>
            </Link>
          )}

          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === "es" ? "en" : "es")}
            className="font-medium px-2"
            aria-label={`Switch to ${language === "es" ? "English" : "Español"}`}
          >
            {language === "es" ? "🇺🇸 EN" : "🇪🇸 ES"}
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            className="relative overflow-hidden"
          >
            <motion.span
              initial={false}
              animate={{
                scale: theme === "dark" ? 0 : 1,
                rotate: theme === "dark" ? 90 : 0,
              }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              ☀️
            </motion.span>
            <motion.span
              initial={false}
              animate={{
                scale: theme === "dark" ? 1 : 0,
                rotate: theme === "dark" ? 0 : -90,
              }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              🌙
            </motion.span>
            <span className="sr-only">Toggle theme</span>
          </Button>
        </nav>
      </div>
    </motion.header>
  );
}