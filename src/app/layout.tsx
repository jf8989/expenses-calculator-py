// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/context/ThemeProvider";
import { AuthProvider } from "@/context/AuthProvider";
import { LanguageProvider } from "@/context/LanguageContext";

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
    default: "Next.js Template | Professional Starter Kit",
    template: "%s | Next.js Template",
  },
  description:
    "A stunning, production-ready Next.js template with Tailwind CSS, Framer Motion animations, Firebase authentication, and WCAG AAA accessibility. Built for modern web development.",
  keywords: [
    "Next.js",
    "React",
    "TypeScript",
    "Tailwind CSS",
    "Framer Motion",
    "Firebase",
    "Template",
    "Starter Kit",
    "Accessible",
    "WCAG AAA",
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
    title: "Next.js Template | Professional Starter Kit",
    description:
      "A stunning, production-ready Next.js template with modern UI and full accessibility.",
    siteName: "Next.js Template",
  },
  twitter: {
    card: "summary_large_image",
    title: "Next.js Template | Professional Starter Kit",
    description:
      "A stunning, production-ready Next.js template with modern UI and full accessibility.",
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
              <div className="relative flex min-h-screen flex-col" suppressHydrationWarning>
                {children}
              </div>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
