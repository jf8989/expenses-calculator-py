// src/context/AuthProvider.tsx
"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client"; // This can now be null
import { Spinner } from "@/components/icons/spinner";

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
    // --- THIS IS THE FIX ---
    // We directly check if 'auth' exists. This serves as a type guard for TypeScript.
    if (!auth) {
      setLoading(false);
      return; // Exit if Firebase is not configured
    }

    // If we get here, TypeScript now knows 'auth' is of type 'Auth', not 'Auth | null'.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []); // The dependency array is empty because 'auth' will not change during the component's lifecycle.

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" suppressHydrationWarning>
        <Spinner />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, isFirebaseActive }}>
      {children}
    </AuthContext.Provider>
  );
};