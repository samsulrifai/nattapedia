import type { Metadata } from "next";
import { isAuthConfigured } from "@/lib/env";

export const metadata: Metadata = { title: "Login Admin", robots: { index: false } };

// Placeholder. Form login (Better Auth email + password, lihat src/lib/auth/client.ts) dikerjakan Web Developer.
export default function AdminLoginPage() {
  return (
    <main className="mx-auto w-full max-w-sm px-4 py-20">
      <h1 className="text-2xl font-bold">Login Admin</h1>
      {isAuthConfigured ? (
        <p className="mt-4 text-neutral-600">[PLACEHOLDER] Form login akan ditambahkan.</p>
      ) : (
        <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm text-amber-900">
          Database atau auth belum dikonfigurasi. Isi DATABASE_URL dan BETTER_AUTH_SECRET di .env.local (lihat .env.example).
        </p>
      )}
    </main>
  );
}
