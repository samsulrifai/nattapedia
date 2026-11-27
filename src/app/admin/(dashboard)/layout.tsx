import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { robots: { index: false, follow: false } };

// Gerbang kedua setelah proxy: user harus login DAN terdaftar di admin_users.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p className="p-4">Memuat...</p>}>
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}

async function AdminGate({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  if (!supabase) redirect("/admin/login");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) redirect("/admin/login");

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-neutral-200 px-4 py-3">
        <nav aria-label="Navigasi admin" className="flex gap-4 text-sm">
          <Link href="/admin">Dasbor</Link>
          <Link href="/admin/leads">Leads</Link>
        </nav>
      </header>
      <main className="flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
