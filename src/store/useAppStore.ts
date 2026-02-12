"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Session, Transaction, UserData } from "@/types";
import { openDB } from "idb";

const DB_NAME = "expense-genie-store";
const STORE_NAME = "app-state";

// Custom IndexedDB storage for Zustand persist
const idbStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const db = await openDB(DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore(STORE_NAME);
      },
    });
    const value = await db.get(STORE_NAME, name);
    return value ? JSON.stringify(value) : null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    const db = await openDB(DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore(STORE_NAME);
      },
    });
    await db.put(STORE_NAME, JSON.parse(value), name);
  },
  removeItem: async (name: string): Promise<void> => {
    const db = await openDB(DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore(STORE_NAME);
      },
    });
    await db.delete(STORE_NAME, name);
  },
};

interface AppState {
  userId: string | null;
  participants: string[];
  frequentParticipants: string[];
  sessions: Session[];
  activeSession: Session | null;
  lastSyncedTimestamp: number | null;
  isSyncing: boolean;
  hasHydrated: boolean;
  error: string | null;

  // Actions
  setUserId: (userId: string | null) => void;
  setParticipants: (participants: string[]) => void;
  setFrequentParticipants: (participants: string[]) => void;
  setSessions: (sessions: Session[]) => void;
  setActiveSession: (session: Session | null) => void;
  updateActiveSession: (updater: Partial<Session> | ((session: Session) => Session)) => void;
  resetActiveSession: () => void;
  setIsSyncing: (isSyncing: boolean) => void;
  setSyncMetadata: (timestamp: number | null) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  setError: (error: string | null) => void;

  // Transaction specific actions
  addTransaction: (transaction: Transaction) => void;
  addManyTransactions: (transactions: Transaction[]) => void;
  removeTransaction: (index: number) => void;
  updateTransaction: (index: number, transaction: Partial<Transaction> | ((tx: Transaction) => Transaction)) => void;

  toggleFrequentParticipant: (name: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      userId: null,
      participants: [],
      frequentParticipants: [],
      sessions: [],
      activeSession: null,
      lastSyncedTimestamp: null,
      isSyncing: false,
      hasHydrated: false,
      error: null,

      setUserId: (userId) => set({ userId }),
      setParticipants: (participants) => set({ participants }),
      setFrequentParticipants: (frequentParticipants) => set({ frequentParticipants }),
      setSessions: (sessions) => set({ sessions }),
      setActiveSession: (activeSession) => set({ activeSession }),
      updateActiveSession: (updater) =>
        set((state) => ({
          activeSession: state.activeSession
            ? typeof updater === "function"
              ? updater(state.activeSession)
              : { ...state.activeSession, ...updater }
            : null,
        })),
      resetActiveSession: () =>
        set((state) => ({
          activeSession: {
            name: "",
            description: "",
            transactions: [],
            participants: [...state.participants],
            mainCurrency: "USD",
            currencies: {},
          },
        })),
      setIsSyncing: (isSyncing) => set({ isSyncing }),
      setSyncMetadata: (lastSyncedTimestamp) => set({ lastSyncedTimestamp }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      setError: (error) => set({ error }),

      addTransaction: (transaction) =>
        set((state) => ({
          activeSession: state.activeSession
            ? {
                ...state.activeSession,
                transactions: [transaction, ...state.activeSession.transactions], // Add to start like the UI does
              }
            : null,
        })),
      addManyTransactions: (transactions) =>
        set((state) => ({
          activeSession: state.activeSession
            ? {
                ...state.activeSession,
                transactions: [...transactions, ...state.activeSession.transactions],
              }
            : null,
        })),
      removeTransaction: (index) =>
        set((state) => ({
          activeSession: state.activeSession
            ? {
                ...state.activeSession,
                transactions: state.activeSession.transactions.filter((_, i) => i !== index),
              }
            : null,
        })),
      updateTransaction: (index, updater) =>
        set((state) => ({
          activeSession: state.activeSession
            ? {
                ...state.activeSession,
                transactions: state.activeSession.transactions.map((tx, i) =>
                  i === index
                    ? typeof updater === "function"
                      ? updater(tx)
                      : { ...tx, ...updater }
                    : tx
                ),
              }
            : null,
        })),
      toggleFrequentParticipant: (name) =>
        set((state) => {
          const isFrequent = state.frequentParticipants.includes(name);
          const newFrequent = isFrequent
            ? state.frequentParticipants.filter((p) => p !== name)
            : [...state.frequentParticipants, name];
          return { frequentParticipants: newFrequent };
        }),
    }),
    {
      name: "expense-genie-storage",
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({
        userId: state.userId,
        participants: state.participants,
        frequentParticipants: state.frequentParticipants,
        sessions: state.sessions,
        activeSession: state.activeSession,
        lastSyncedTimestamp: state.lastSyncedTimestamp,
      }),
      onRehydrateStorage: (state) => {
        return () => {
          state.setHasHydrated(true);
        };
      },
    }
  )
);
