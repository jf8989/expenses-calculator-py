"use client";

import { useState, useEffect, useCallback } from "react";
import { getSessions } from "@/app/actions/sessions";
import { getUserData } from "@/app/actions/participants";
import { useAppStore } from "@/store/useAppStore";

const FETCH_TIMEOUT_MS = 10_000; // 10 second timeout for server actions

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), ms)
    ),
  ]);
}

export function useCachedData(userId: string | undefined) {
  const {
    sessions,
    participants,
    setSessions,
    setParticipants,
    setUserId,
    setIsSyncing,
    setError,
    error,
    isSyncing,
  } = useAppStore();

  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(
    async (forceRefresh = false) => {
      if (!userId) return;

      try {
        setUserId(userId);
        setIsSyncing(true);

        const [freshSessions, freshUserData] = await withTimeout(
          Promise.all([
            getSessions(userId),
            getUserData(userId),
          ]),
          FETCH_TIMEOUT_MS,
        );

        // Update UI with fresh data
        setSessions(freshSessions);
        setParticipants(freshUserData?.participants || []);
        setError(null);
      } catch (err) {
        console.error("Error syncing data:", err);
        setError(err instanceof Error ? err.message : "Failed to sync data");
      } finally {
        setLoading(false);
        setIsSyncing(false);
      }
    },
    [userId, setSessions, setParticipants, setUserId, setIsSyncing, setError],
  );

  useEffect(() => {
    if (userId) {
      fetchData();
    } else {
      setUserId(null);
      setSessions([]);
      setParticipants([]);
      setLoading(false);
    }
  }, [userId, fetchData, setUserId, setSessions, setParticipants]);

  return {
    sessions,
    participants,
    loading,
    isSyncing,
    error,
    refresh: () => fetchData(true),
  };
}

