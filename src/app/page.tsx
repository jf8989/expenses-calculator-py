"use client";

import { Header } from "@/components/ui/header";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { ParticipantsManager } from "@/components/expenses/ParticipantsManager";
import { SessionsList } from "@/components/expenses/SessionsList";
import { SessionEditor } from "@/components/expenses/SessionEditor";
import { Session } from "@/types";
import { Spinner } from "@/components/icons/spinner";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ParticlesBackground } from "@/components/ui/particles-background";
import { useCachedData } from "@/hooks/useCachedData";
import { useMounted } from "@/hooks/useMounted";
import { useLanguage } from "@/context/LanguageContext";
import { RefreshCw, Zap, Cloud, Palette, Plus } from "lucide-react";

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const {
    sessions,
    participants,
    loading,
    isSyncing,
    refresh: handleSessionSaved
  } = useCachedData(user?.uid);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { t } = useLanguage();

  const mounted = useMounted();

  if (!mounted || authLoading || (loading && !sessions.length)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4 text-center">
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 rounded-full border-t-2 border-primary"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner className="w-6 h-6 text-primary/50" />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-lg font-medium gradient-text animate-pulse">
            {!mounted ? t.loading.initializing : t.loading.loadingData}
          </p>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            {t.loading.loadingHint}
          </p>
        </div>

        {/* Fallback button if stuck */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 8 }} // Show after 8s
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="rounded-full gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {t.loading.refresh}
          </Button>
        </motion.div>
      </div>
    );
  }

  const features = [
    {
      icon: Zap,
      title: t.landing.smartSplitting,
      desc: t.landing.smartSplittingDesc,
      color: "from-amber-500 to-orange-500"
    },
    {
      icon: Cloud,
      title: t.landing.syncEverywhere,
      desc: t.landing.syncEverywhereDesc,
      color: "from-cyan-500 to-blue-500"
    },
    {
      icon: Palette,
      title: t.landing.premiumDesign,
      desc: t.landing.premiumDesignDesc,
      color: "from-violet-500 to-purple-500"
    }
  ];

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <ParticlesBackground />
      <Header />

      {/* Decorative gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          className="absolute -top-[300px] -left-[200px] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-[300px] -right-[200px] w-[600px] h-[600px] bg-accent/10 rounded-full blur-[150px]"
          animate={{
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <main id="main-content" className="flex-1 container max-w-7xl mx-auto px-4 py-8 sm:py-12 z-10">
        {!user ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4"
              >
                <Zap className="w-4 h-4" />
                {t.landing.badge}
              </motion.div>

              <h1 className="text-4xl sm:text-5xl md:text-display-lg font-bold tracking-tight">
                {t.landing.heroTitle} <span className="gradient-text-animated">{t.landing.heroHighlight}</span>
                <br className="sm:hidden" /> {t.landing.heroSubtitle}
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {t.landing.heroDescription}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button
                size="xl"
                variant="gradient"
                className="group"
                onClick={() => window.location.href = "/login"}
              >
                {t.landing.getStarted}
                <motion.span
                  className="ml-2"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </Button>
            </motion.div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-16 sm:mt-24">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + (i * 0.1), duration: 0.5 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="group p-6 sm:p-8 rounded-3xl bg-card/40 backdrop-blur-lg border border-border/50 text-left hover:bg-card/60 hover:border-primary/30 transition-all duration-300 cursor-default"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeSession || isCreating ? (
              <motion.div
                key="editor"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <SessionEditor
                  userId={user.uid}
                  initialSession={activeSession || undefined}
                  participants={participants}
                  onSaved={handleSessionSaved}
                  onCancel={() => {
                    setActiveSession(null);
                    setIsCreating(false);
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8 sm:space-y-12"
              >
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex-1 space-y-6 sm:space-y-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                            {t.dashboard.welcome} <span className="gradient-text">{user.displayName || "Explorer"}</span>
                          </h1>
                          {isSyncing && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium"
                            >
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              {t.dashboard.syncing}
                            </motion.div>
                          )}
                        </div>
                        <p className="text-muted-foreground mt-1.5">{t.dashboard.overview}</p>
                      </div>
                      <Button
                        size="lg"
                        variant="gradient"
                        onClick={() => setIsCreating(true)}
                        className="shadow-xl w-full sm:w-auto gap-2"
                      >
                        <Plus className="w-5 h-5" />
                        {t.dashboard.newSession}
                      </Button>
                    </div>

                    <SessionsList
                      userId={user.uid}
                      initialSessions={sessions}
                      onSelect={setActiveSession}
                    />
                  </div>

                  <div className="w-full lg:w-80 lg:shrink-0">
                    <ParticipantsManager
                      userId={user.uid}
                      initialParticipants={participants}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      <footer className="relative border-t border-border/50 bg-card/30 backdrop-blur-sm mt-16 sm:mt-24 z-10">
        <div className="container px-4 sm:px-8 py-6 sm:py-8">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} <span className="font-medium text-foreground">{t.header.title}</span>. {t.footer.tagline}
            </p>
          </div>
        </div>
      </footer>
      <ScrollToTop />
    </div>
  );
}
