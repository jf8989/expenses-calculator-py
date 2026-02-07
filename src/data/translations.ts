// src/data/translations.ts

export const translations = {
  en: {
    header: {
      title: "Expense Genie",
      signIn: "Sign In with Google",
      signInShort: "Sign In",
      signOut: "Sign Out",
      firebaseNotConfigured: "Firebase not configured",
    },
  },
  es: {
    header: {
      title: "Expense Genie",
      signIn: "Iniciar sesión con Google",
      signInShort: "Acceder",
      signOut: "Cerrar Sesión",
      firebaseNotConfigured: "Firebase no configurado",
    },
  },
};

export type Language = keyof typeof translations;
export type TranslationDict = (typeof translations)["en"];
