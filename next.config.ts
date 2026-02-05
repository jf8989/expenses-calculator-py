// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: [], // You can add domains like 'images.unsplash.com' when needed
    loader: "default",
    remotePatterns: [
      // Example pattern (commented out) - uncomment and modify when needed
      // {
      //   protocol: 'https',
      //   hostname: 'example.com',
      //   port: '',
      //   pathname: '/images/**',
      // },
    ],
  },
  pageExtensions: ["js", "jsx", "ts", "tsx", "mdx"],
  // Useful when using npm packages that depend on Node.js modules
  transpilePackages: [], // Add packages that need transpilation
  // Enable experimental features if needed
  experimental: {
    // typedRoutes: true,
    // serverActions: true,
  },
};

export default nextConfig;
