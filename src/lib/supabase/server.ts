import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { env, isSupabaseConfigured } from "@/lib/env";
import type { Database } from "@/types/database";

// Klien Supabase untuk Server Components, Server Actions, dan Route Handlers.
// Mengembalikan null jika Supabase belum dikonfigurasi, agar `npm run dev`
// tetap jalan tanpa .env.local.
export async function createClient() {
  if (!isSupabaseConfigured) return null;
  const cookieStore = await cookies();

  return createServerClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Dipanggil dari Server Component: abaikan, sesi di-refresh oleh proxy.
        }
      },
    },
  });
}
