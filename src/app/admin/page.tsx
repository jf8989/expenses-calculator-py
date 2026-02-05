// src/app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "@/components/icons/spinner";
import { Header } from "@/components/ui/header";
import { SubmissionsTable } from "./components/SubmissionsTable";
import { useLanguage } from "@/context/LanguageContext";
import { AuthGate } from "@/components/auth/AuthGate";

const ADMIN_EMAIL = "jf.apps.lab@gmail.com";

export default function AdminPage() {
  const { language, t } = useLanguage();
  const { user, loading, isFirebaseActive } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Wait for auth to finish loading
    if (loading) return;

    // If Firebase is not active, deny access
    if (!isFirebaseActive) {
      setIsAuthorized(false);
      return;
    }

    // Check if user is logged in and has the correct email
    if (user && user.email === ADMIN_EMAIL) {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }
  }, [user, loading, isFirebaseActive]);

  // Loading state
  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Spinner className="w-8 h-8 mx-auto mb-4" />
            <p className="text-muted-foreground">Verificando acceso...</p>
          </div>
        </div>
      </>
    );
  }

  // Forbidden state
  if (!isAuthorized) {
    return (
      <>
        <Header />
        <AuthGate
          mode="admin"
          customTitle={language === "es" ? "Panel de" : "Admin"}
          customSubtitle={
            language === "es"
              ? "Autenticación requerida para acceder al panel de administración"
              : "Authentication required to access the admin panel"
          }
          customMessage={
            !isFirebaseActive
              ? language === "es"
                ? "Firebase no está configurado"
                : "Firebase is not configured"
              : language === "es"
                ? "Inicia sesión con tu cuenta de Google autorizada"
                : "Sign in with your authorized Google account"
          }
        />
      </>
    );
  }

  // Authorized - show admin dashboard
  return (
    <>
      <Header />
      <div className="container max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-display mb-2">
            {t.admin.title.split(" ")[0]} <span className="gradient-text">{t.admin.title.split(" ").slice(1).join(" ")}</span>
          </h1>
          <p className="text-muted-foreground">
            {language === "es" ? "Visualiza todas las respuestas del formulario de planificación" : "View all responses from the planning form"}
          </p>
        </div>

        <SubmissionsTable />
      </div>
    </>
  );
}
