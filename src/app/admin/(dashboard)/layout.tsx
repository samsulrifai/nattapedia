import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";

export const metadata: Metadata = { robots: { index: false, follow: false } };

// Gerbang kedua setelah proxy: sesi divalidasi ke database (Better Auth).
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p className="p-4">Memuat...</p>}>
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}

async function AdminGate({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

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
