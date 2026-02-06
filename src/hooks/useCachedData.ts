"use client";

import { useState, useEffect, useCallback } from "react";
import { localDB } from "@/lib/storage/indexedDb";
import { getSessions } from "@/app/actions/sessions";
import { getUserData } from "@/app/actions/participants";
import { Session } from "@/types";

export function useCachedData(userId: string | undefined) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [participants, setParticipants] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(
    async (forceRefresh = false) => {
      if (!userId) return;

      try {
        // 1. Try to load from Local Cache first (Instant Load)
        if (!forceRefresh) {
          const cachedSessions = await localDB.getSessions();
          const cachedUserData = await localDB.getUserData(userId);

          if (cachedSessions.length > 0 || cachedUserData) {
            setSessions(cachedSessions);
            setParticipants(cachedUserData?.participants || []);
            setLoading(false); // We have enough to show the UI
          }
        }

        // 2. Background Refresh / Initial Load from Firestore
        setIsSyncing(true);

        const [freshSessions, freshUserData] = await Promise.all([
          getSessions(userId),
          getUserData(userId),
        ]);

        // 3. Update Local Cache with fresh data
        await localDB.saveSessions(freshSessions);
        if (freshUserData) {
          await localDB.saveUserData(userId, freshUserData);
        }

        // 4. Update UI with fresh data
        setSessions(freshSessions);
        setParticipants(freshUserData?.participants || []);
        setError(null);
      } catch (err) {
        console.error("Error syncing data:", err);
        setError(err instanceof Error ? err : new Error("Failed to sync data"));
      } finally {
        setLoading(false);
        setIsSyncing(false);
      }
    },
    [userId],
  );

  useEffect(() => {
    if (userId) {
      fetchData();
    } else {
      setSessions([]);
      setParticipants([]);
      setLoading(false);
    }
  }, [userId, fetchData]);

  return {
    sessions,
    participants,
    loading,
    isSyncing,
    error,
    refresh: () => fetchData(true),
  };
}
