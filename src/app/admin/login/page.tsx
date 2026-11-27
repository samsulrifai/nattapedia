import type { Metadata } from "next";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = { title: "Login Admin", robots: { index: false } };

// Placeholder. Form login (Supabase Auth email + password) dikerjakan Web Developer.
export default function AdminLoginPage() {
  return (
    <main className="mx-auto w-full max-w-sm px-4 py-20">
      <h1 className="text-2xl font-bold">Login Admin</h1>
      {isSupabaseConfigured ? (
        <p className="mt-4 text-neutral-600">[PLACEHOLDER] Form login akan ditambahkan.</p>
      ) : (
        <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm text-amber-900">
          Supabase belum dikonfigurasi. Isi variabel di .env.local (lihat .env.example).
        </p>
      )}
    </main>
  );
}
