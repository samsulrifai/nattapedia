import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { env, isDatabaseConfigured } from "@/lib/env";
import * as schema from "./schema";

export type Db = NeonHttpDatabase<typeof schema>;

let cached: Db | null = null;

// Klien Drizzle di atas driver HTTP Neon (cocok untuk serverless/Vercel).
// Mengembalikan null jika DATABASE_URL belum diisi, agar `npm run dev` dan
// `npm run build` tetap jalan tanpa .env.local (halaman tampil placeholder).
export function getDb(): Db | null {
  if (!isDatabaseConfigured) return null;
  cached ??= drizzle(neon(env.databaseUrl), { schema });
  return cached;
}

export { schema };
