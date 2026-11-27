import type { NextConfig } from "next";

// Host gambar dari storage publik (Cloudflare R2), untuk next/image.
const storageHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_STORAGE_PUBLIC_URL
      ? new URL(process.env.NEXT_PUBLIC_STORAGE_PUBLIC_URL).hostname
      : null;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: storageHost ? [{ protocol: "https", hostname: storageHost }] : [],
  },
  experimental: {
    // Upload gambar admin lewat Server Action (maks. 4 MB, lihat src/lib/storage.ts).
    serverActions: { bodySizeLimit: "5mb" },
  },
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
