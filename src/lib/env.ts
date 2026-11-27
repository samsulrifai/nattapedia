// Variabel lingkungan. Nilai asli disimpan di Vercel / Paperclip Secrets, bukan di repo.
// File ini juga diimpor dari kode client: hanya baca variabel NEXT_PUBLIC_ di
// properti publik. Variabel rahasia dibaca langsung di modul server-only.
export const env = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  databaseUrl: process.env.DATABASE_URL ?? "",
  storagePublicUrl: (process.env.NEXT_PUBLIC_STORAGE_PUBLIC_URL ?? "").replace(/\/+$/, ""),
};

export const isDatabaseConfigured = Boolean(env.databaseUrl);
export const isAuthConfigured = Boolean(isDatabaseConfigured && process.env.BETTER_AUTH_SECRET);
