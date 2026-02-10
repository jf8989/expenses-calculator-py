// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/context/ThemeProvider";
import { AuthProvider } from "@/context/AuthProvider";
import { LanguageProvider } from "@/context/LanguageContext";
import { ToastProvider } from "@/components/ui/Toast";

// VIEWPORT CONFIGURATION for optimal mobile experience
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0f" },
  ],
};

// METADATA OBJECT - Enhanced for SEO and social sharing
export const metadata: Metadata = {
  title: {
    default: "Expense Genie | Split Bills Effortlessly",
    template: "%s | Expense Genie",
  },
  description:
    "Split bills, track group expenses, and settle up effortlessly. A premium expense-splitting app with real-time sync, smart calculations, and a beautiful modern interface.",
  keywords: [
    "Expense Splitting",
    "Bill Splitter",
    "Group Expenses",
    "Settle Up",
    "Debt Calculator",
    "Firebase",
    "Next.js",
    "React",
  ],
  authors: [{ name: "Juan Francisco Marcenaro A." }],
  creator: "Juan Francisco Marcenaro A.",
  publisher: "Juan Francisco Marcenaro A.",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Expense Genie | Split Bills Effortlessly",
    description:
      "Split bills, track group expenses, and settle up effortlessly with a premium modern interface.",
    siteName: "Expense Genie",
  },
  twitter: {
    card: "summary_large_image",
    title: "Expense Genie | Split Bills Effortlessly",
    description:
      "Split bills, track group expenses, and settle up effortlessly with a premium modern interface.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          GeistSans.variable
        )}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <AuthProvider>
              <ToastProvider>
                <div className="relative flex min-h-screen flex-col" suppressHydrationWarning>
                  {children}
                </div>
              </ToastProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
