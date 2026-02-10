// src/context/AuthProvider.tsx
"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client"; // This can now be null

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isFirebaseActive: boolean; // Let the app know if Firebase is configured
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isFirebaseActive: false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if the auth object was successfully initialized
  const isFirebaseActive = !!auth;

  useEffect(() => {
    // Check if the auth object was successfully initialized
    if (!auth) {
      console.warn("Firebase Auth not initialized, skipping auth check.");
      setLoading(false);
      return;
    }

    let resolved = false;

    // Safety timeout: If Firebase takes too long to respond, proceed anyway
    const safetyTimeout = setTimeout(() => {
      if (!resolved) {
        console.warn("Auth state check timed out after 5s, proceeding as unauthenticated.");
        setLoading(false);
      }
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      resolved = true;
      clearTimeout(safetyTimeout);
      setUser(user);
      setLoading(false);
    });

    return () => {
      clearTimeout(safetyTimeout);
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isFirebaseActive }}>
      {children}
    </AuthContext.Provider>
  );
};