"use client";

import { Header } from "@/components/ui/header";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { ParticipantsManager } from "@/components/expenses/ParticipantsManager";
import { SessionsList } from "@/components/expenses/SessionsList";
import { SessionEditor } from "@/components/expenses/SessionEditor";
import { Session } from "@/types";
import { getParticipants } from "@/app/actions/participants";
import { getSessions } from "@/app/actions/sessions";
import { Spinner } from "@/components/icons/spinner";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ParticlesBackground } from "@/components/ui/particles-background";

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [participants, setParticipants] = useState<string[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          const [p, s] = await Promise.all([
            getParticipants(user.uid),
            getSessions(user.uid)
          ]);
          setParticipants(p);
          setSessions(s);
        } catch (error) {
          console.error("Error fetching data", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleSessionSaved = async () => {
    if (user) {
      const s = await getSessions(user.uid);
      setSessions(s);
      setActiveSession(null);
      setIsCreating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <ParticlesBackground />
      <Header />
      <main id="main-content" className="flex-1 container max-w-7xl mx-auto px-4 py-12 z-10">
        {!user ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h1 className="text-display-lg drop-shadow-sm">
                Your <span className="gradient-text">Ultimate</span> Expense Companion
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Split bills, track group expenses, and settle up effortlessly.
                Experience bill splitting with a premium, modern touch.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button size="lg" className="h-14 px-8 text-lg rounded-2xl shadow-xl hover:shadow-primary/20 transition-all hover:scale-105 active:scale-95" onClick={() => window.location.href = "/login"}>
                Get Started for Free
              </Button>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-24">
              {[
                { title: "Smart Splitting", desc: "Easily split any bill among multiple participants with custom shares." },
                { title: "Sync Everywhere", desc: "Your data is securely stored in the cloud and synced across all your devices.", delay: 0.1 },
                { title: "Premium Design", desc: "A beautiful, dark-themed experience with smooth animations and glassmorphism.", delay: 0.2 }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + (feature.delay || 0) }}
                  className="p-8 rounded-3xl bg-card/30 backdrop-blur-sm border border-border/50 text-left hover:bg-card/50 transition-colors"
                >
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
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
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-12"
              >
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1 space-y-8">
                    <div className="flex justify-between items-center">
                      <div>
                        <h1 className="text-4xl font-bold tracking-tight">Welcome, <span className="gradient-text">{user.displayName || "Explorer"}</span></h1>
                        <p className="text-muted-foreground mt-1">Here&apos;s an overview of your expense sessions.</p>
                      </div>
                      <Button size="lg" onClick={() => setIsCreating(true)} className="rounded-2xl shadow-lg">
                        + New Session
                      </Button>
                    </div>

                    <SessionsList
                      userId={user.uid}
                      initialSessions={sessions}
                      onSelect={setActiveSession}
                    />
                  </div>

                  <div className="w-full md:w-80">
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

      <footer className="relative border-t bg-muted/20 mt-24">
        <div className="container px-4 sm:px-8 py-8">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Expense Genie. Built for seamless financial collaboration.
            </p>
          </div>
        </div>
      </footer>
      <ScrollToTop />
    </div>
  );
}
