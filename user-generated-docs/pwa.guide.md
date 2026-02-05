# 🚀 Next.js PWA Setup: The Direct & Organized Path (with `next-pwa`)

This guide details the steps to make your Next.js (App Router) project PWA-ready, focusing on organized asset management and configurations that resolve common TypeScript compatibility issues with `next-pwa`.

---

## ⚠️ Understanding Potential Type Issues

When integrating `next-pwa` (a JavaScript library) with a TypeScript Next.js project (especially newer versions), type errors can occur. This is often because the official `@types/next-pwa` package might not perfectly align with your Next.js version, or `next-pwa` may not have its own up-to-date type declarations.

The most reliable solution involves **not using `@types/next-pwa`** and instead creating a **custom type declaration file (`.d.ts`)** that aligns with your project's specific Next.js types.

---

## 🛠️ Step 1: Install Dependencies

1.  **Install `next-pwa`:**
    ```bash
    npm install next-pwa
    # or
    # yarn add next-pwa
    ```

2.  **Install `workbox-build` (for custom types):**
    Our custom type definition for `next-pwa` uses types from `workbox-build`.
    ```bash
    npm install --save-dev workbox-build
    # or
    # yarn add --dev workbox-build
    ```

3.  **Crucially: DO NOT Install `@types/next-pwa`:**
    If you previously installed it, **uninstall it** to prevent type conflicts:
    ```bash
    npm uninstall @types/next-pwa
    # or
    # yarn remove @types/next-pwa
    ```

---

## 📄 Step 2: Create Custom Type Definition (`next-pwa.d.ts`)

Create a file named `next-pwa.d.ts` in the **root of your project**. Paste the following code:

```typescript
// next-pwa.d.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "next-pwa" {
  import { NextConfig } from "next";
  import { WorkboxOptions } from "workbox-build";

  interface FallbackEntry {
    url: string;
    revision?: string | null;
  }

  interface NextPWAConfig {
    dest?: string;
    sw?: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    scope?: string;
    cacheOnFrontEndNav?: boolean;
    reloadOnOnline?: boolean;
    fallbacks?: {
      document?: string;
      image?: string;
      audio?: string;
      video?: string;
      font?: string;
      entries?: FallbackEntry[];
    };
    publicExcludes?: string[];
    buildExcludes?: (string | RegExp)[];
    runtimeCaching?: WorkboxOptions["runtimeCaching"];
    workboxOptions?: Omit<
      WorkboxOptions,
      "swDest" | "globDirectory" | "runtimeCaching"
    >;
    customWorkerDir?: string;
    extendDefaultRuntimeCaching?: boolean;
    dynamicStartUrl?: boolean;
    dynamicStartUrlRedirect?: string | boolean;
    cacheStartUrl?: boolean;
    additionalManifestEntries?: ReadonlyArray<any>;
    cleanupOutdatedCaches?: boolean;
    swSrc?: string;
  }

  type WithPWA = (config: NextConfig) => NextConfig;
  const withPWA: (pwaConfig: NextPWAConfig) => WithPWA;
  export default withPWA;
}
```

---

## ⚙️ Step 3: Configure `tsconfig.json`

Ensure your `tsconfig.json` includes the custom declaration file.

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    "next-pwa.d.ts"
  ],
  "exclude": ["node_modules"]
}
```
**Key:** Make sure `"next-pwa.d.ts"` is in the `"include"` array.
**Action:** Restart your TypeScript server / IDE (VS Code: `Ctrl+Shift+P` > "TypeScript: Restart TS server").

---

## 🔧 Step 4: Configure `next.config.ts`

Modify your `next.config.ts` to use `next-pwa`.

```typescript
// next.config.ts
import type { NextConfig } from "next";
import withPWAImport from "next-pwa";

const withPWA = withPWAImport({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
    loader: "default",
    remotePatterns: [],
  },
  pageExtensions: ["js", "jsx", "ts", "tsx", "mdx"],
  transpilePackages: [],
  experimental: {},
};

export default withPWA(nextConfig);
```

---

## 🎨 Step 5: Create and Organize App Icons

1.  **Create an `icons` folder** inside your `public` directory: `public/icons/`.
2.  **Generate your PWA icons** (various sizes, including maskable versions) and place them into `public/icons/`.
    *   **Required sizes typically include:** `72x72`, `96x96`, `128x128`, `144x144`, `152x152`, `192x192`, `384x384`, `512x512` (all `.png`).
    *   **Maskable Icons:** At least one `192x192` and one `512x512` icon should be designed as maskable (e.g., `icon-maskable-192x192.png`). Use tools like [Maskable.app editor](https://maskable.app/editor).
3.  Place your main browser tab icon `favicon.ico` directly in `public/favicon.ico`.
4.  Place your iOS home screen icon `apple-touch-icon.png` (e.g., 180x180 or 192x192) in `public/icons/apple-touch-icon.png`.

---

## 🌐 Step 6: Create Web App Manifest (`public/manifest.json`)

Create `public/manifest.json`. **All icon `src` paths must point to the `public/icons/` subfolder.**

```json
{
  "name": "International Mechanical Timekeeper",
  "short_name": "Timekeeper",
  "description": "An interactive mechanical clock displaying time across different timezones. Built with Next.js, React, and TypeScript.",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "background_color": "#1f2937",
  "theme_color": "#1f2937",
  "icons": [
    { "src": "/icons/icon-72x72.png", "sizes": "72x72", "type": "image/png" },
    { "src": "/icons/icon-96x96.png", "sizes": "96x96", "type": "image/png" },
    { "src": "/icons/icon-128x128.png", "sizes": "128x128", "type": "image/png" },
    { "src": "/icons/icon-144x144.png", "sizes": "144x144", "type": "image/png" },
    { "src": "/icons/icon-152x152.png", "sizes": "152x152", "type": "image/png" },
    { "src": "/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-384x384.png", "sizes": "384x384", "type": "image/png" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-maskable-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
    { "src": "/icons/icon-maskable-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```
**Action:** Update `name`, `short_name`, `description`, `background_color`, and `theme_color` for your app. Ensure all listed icon files exist in `public/icons/`.

---

## LAYOUT Step 7: Update Root Layout (`src/app/layout.tsx`)

Modify your root layout to link the manifest and define PWA metadata. Icon paths in `metadata.icons` should reflect the `public/icons/` structure.

```typescript
// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter, Poppins, Montserrat, Roboto, Open_Sans, Lato, Raleway } from "next/font/google"; // Example fonts
import { GeistSans, GeistMono } from "geist/font"; // Example fonts
import "./globals.css";
import { cn } from "../lib/utils"; // Your utility function

// --- Your Font Definitions ---
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap", weight: ["300", "400", "500", "600", "700"], });
const geistSans = GeistSans; // Assuming direct import usage
const geistMono = GeistMono; // Assuming direct import usage
// ... (include other fonts you use, like Poppins, Montserrat, etc.)
// --- End Font Definitions ---

export const metadata: Metadata = {
  title: {
    default: "International Mechanical Timekeeper", // << UPDATE
    template: "%s | Intl Timekeeper",             // << UPDATE
  },
  description: "An interactive mechanical clock...", // << UPDATE
  keywords: ["Next.js", "React", "Clock", "PWA"],  // << UPDATE
  authors: [{ name: "Your Name/Username", url: "https://your.link" }], // << UPDATE
  creator: "Your Name/Username", // << UPDATE
  publisher: "Your Name/Username", // << UPDATE

  manifest: "/manifest.json",

  icons: {
    icon: "/favicon.ico",                      // In public/
    shortcut: "/icons/icon-192x192.png",       // In public/icons/
    apple: "/icons/apple-touch-icon.png",      // In public/icons/
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1f2937", // << UPDATE to match manifest.json 'theme_color'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn( "scroll-smooth", inter.variable, geistSans.variable, geistMono.variable /* ...other font variables */ )}
    >
      <body className={cn( "min-h-screen bg-background font-sans text-foreground antialiased", "transition-colors duration-300 ease-in-out" )}>
        <div className="relative flex min-h-screen flex-col">
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
```
**Action:** Update all placeholder values (marked with `// << UPDATE`) and ensure `viewport.themeColor` matches `manifest.json`.

---

## 🧪 Step 8: Build and Test

1.  **Build for Production:**
    ```bash
    npm run build
    ```
2.  **Start Production Server:**
    ```bash
    npm run start
    ```
3.  **Test Thoroughly in Browser:**
    *   Open `http://localhost:3000`.
    *   Use Developer Tools (F12) > Application Tab (Manifest, Service Workers, Cache Storage).
    *   Run a Lighthouse PWA audit (focus on "Progressive Web App" category).
    *   Check for the install icon/prompt.
    *   Test offline functionality.

---

## 🌐 Step 9: Deploy

*   Deploy your application to a hosting provider that serves sites over **HTTPS** (e.g., Vercel).