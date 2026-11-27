import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { getDb, schema } from "@/lib/db";
import { isAuthConfigured } from "@/lib/env";

function trustedOrigins(): string[] {
  const origins = [process.env.BETTER_AUTH_URL, process.env.NEXT_PUBLIC_SITE_URL];
  // URL preview Vercel berubah per deployment; izinkan URL deployment saat ini.
  for (const host of [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL]) {
    if (host) origins.push(`https://${host}`);
  }
  return origins.filter((o): o is string => Boolean(o));
}

function createAuth() {
  const db = getDb();
  if (!db) throw new Error("DATABASE_URL belum diisi");
  return betterAuth({
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL:
      process.env.BETTER_AUTH_URL ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined),
    trustedOrigins: trustedOrigins(),
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
        rateLimit: schema.rateLimit,
      },
    }),
    emailAndPassword: {
      enabled: true,
      // Pendaftaran publik DITUTUP. Akun admin dibuat lewat `npm run admin:create`.
      disableSignUp: true,
      minPasswordLength: 12,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 hari
      updateAge: 60 * 60 * 24,
    },
    rateLimit: {
      enabled: true,
      storage: "database",
      customRules: {
        "/sign-in/email": { window: 60, max: 5 },
      },
    },
    plugins: [nextCookies()], // harus plugin terakhir
  });
}

type Auth = ReturnType<typeof createAuth>;
let cached: Auth | null = null;

// Instance Better Auth. null jika DATABASE_URL atau BETTER_AUTH_SECRET belum diisi.
export function getAuth(): Auth | null {
  if (!isAuthConfigured) return null;
  cached ??= createAuth();
  return cached;
}
