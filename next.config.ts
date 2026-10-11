import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Admin pages are always user-specific and must stay live.
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
