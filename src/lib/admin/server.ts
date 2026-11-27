import "server-only";
import { eq } from "drizzle-orm";
import { connection } from "next/server";
import { getDb, schema, type Db } from "@/lib/db";

// Helper bersama untuk Server Action dan halaman admin.

export const DB_NOT_CONFIGURED = "Database belum dikonfigurasi. Hubungi pengelola server.";

export function getAdminDb(): Db {
  const db = getDb();
  if (!db) throw new Error(DB_NOT_CONFIGURED);
  return db;
}

// Untuk halaman admin: data selalu dibaca saat request (tidak di-prerender/cache).
export async function adminPageDb(): Promise<Db> {
  await connection();
  return getAdminDb();
}

// Error dari Postgres (Neon) dibungkus oleh Drizzle; kode asli ada di `cause`.
function pgCode(error: unknown): string | undefined {
  let e: unknown = error;
  for (let i = 0; i < 3 && e && typeof e === "object"; i++) {
    const code = (e as { code?: unknown }).code;
    if (typeof code === "string") return code;
    e = (e as { cause?: unknown }).cause;
  }
  return undefined;
}

export const isUniqueViolation = (error: unknown) => pgCode(error) === "23505";

export function logAdminError(scope: string, error: unknown) {
  console.error(`[admin] ${scope}:`, error);
}

// Baris pengaturan situs (id = 1). Null jika baris belum ada.
export async function getSettingsRow() {
  const [row] = await (await adminPageDb())
    .select()
    .from(schema.site_settings)
    .where(eq(schema.site_settings.id, 1))
    .limit(1);
  return row ?? null;
}
