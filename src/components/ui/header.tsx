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
import { Sun, Moon, LogOut, Sparkles } from "lucide-react";

export function Header() {
  const { theme, setTheme } = useTheme();
  const { user, isFirebaseActive } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { scrollY } = useScroll();

  // Create dynamic effects based on scroll
  const headerBg = useTransform(
    scrollY,
    [0, 50],
    ["hsl(var(--background) / 0.5)", "hsl(var(--background) / 0.85)"]
  );

  const headerBorder = useTransform(
    scrollY,
    [0, 50],
    ["hsl(var(--border) / 0)", "hsl(var(--border) / 0.5)"]
  );

  const handleSignOut = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  return (
    <motion.header
      className="sticky top-0 z-50 w-full backdrop-blur-xl"
      style={{
        backgroundColor: headerBg as unknown as string,
        borderBottom: `1px solid`,
        borderColor: headerBorder as unknown as string,
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Subtle gradient line at top */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-60" />

      <div className="container flex h-16 sm:h-20 items-center justify-between px-4 sm:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center space-x-2.5 transition-opacity hover:opacity-80 shrink-0 group"
          aria-label="Home"
        >
          <motion.div
            className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/30"
            whileHover={{ rotate: 5, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
          </motion.div>
          <div className="flex flex-col">
            <motion.span
              className="text-base sm:text-lg font-bold tracking-tight gradient-text whitespace-nowrap"
              whileHover={{ scale: 1.02 }}
            >
              {t.header.title}
            </motion.span>
            <span className="text-[10px] text-muted-foreground font-medium tracking-wide hidden sm:block">
              {t.header.splitSmarter}
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1 sm:gap-2" role="navigation" aria-label="Main navigation">
          {user ? (
            <>
              <div className="hidden md:flex flex-col items-end mr-3 pr-3 border-r border-border/50">
                <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">{t.header.signedIn}</span>
                <span className="text-sm text-muted-foreground leading-tight max-w-[200px] truncate">
                  {user.email}
                </span>
              </div>
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="hover:bg-destructive/10 hover:text-destructive transition-colors gap-2"
                disabled={!isFirebaseActive}
                aria-label={t.header.signOut}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t.header.signOut}</span>
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button
                disabled={!isFirebaseActive}
                size="sm"
                variant="gradient"
                className="shadow-lg"
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
            className="font-medium px-2.5 text-xs"
            aria-label={`Switch to ${language === "es" ? "English" : "Español"}`}
          >
            {language === "es" ? "🇺🇸" : "🇪🇸"}
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            className="relative overflow-hidden w-9 h-9 sm:w-10 sm:h-10"
          >
            <motion.span
              initial={false}
              animate={{
                scale: theme === "dark" ? 0 : 1,
                rotate: theme === "dark" ? 90 : 0,
                opacity: theme === "dark" ? 0 : 1,
              }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center text-amber-500"
            >
              <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.span>
            <motion.span
              initial={false}
              animate={{
                scale: theme === "dark" ? 1 : 0,
                rotate: theme === "dark" ? 0 : -90,
                opacity: theme === "dark" ? 1 : 0,
              }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center text-indigo-400"
            >
              <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.span>
            <span className="sr-only">Toggle theme</span>
          </Button>
        </nav>
      </div>
    </motion.header>
  );
}