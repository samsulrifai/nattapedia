import { defineConfig } from "drizzle-kit";

// Migrasi memakai koneksi langsung (unpooled) jika tersedia.
// Jalankan dengan env dari .env.local: `npm run db:migrate`.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || "",
  },
  strict: true,
});
