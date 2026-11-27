import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { LogoutButton } from "@/components/admin/LogoutButton";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/admin", label: "Dasbor" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/portofolio", label: "Portofolio" },
  { href: "/admin/layanan", label: "Layanan" },
  { href: "/admin/testimoni", label: "Testimoni" },
  { href: "/admin/konten", label: "Teks Halaman" },
  { href: "/admin/kontak", label: "Kontak" },
  { href: "/admin/seo", label: "SEO" },
];

// Gerbang kedua setelah proxy: sesi divalidasi ke database (Better Auth).
// Ini bukan otorisasi untuk Server Action; setiap action memanggil requireAdmin().
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p className="p-4">Memuat...</p>}>
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}

async function AdminGate({ children }: { children: React.ReactNode }) {
  await connection(); // selalu dievaluasi per request, tidak pernah di-prerender
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="flex min-h-full flex-col bg-white text-neutral-900">
      <header className="border-b border-neutral-200 px-4 py-3">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <nav aria-label="Navigasi admin" className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="text-neutral-700 hover:text-neutral-900 hover:underline">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" target="_blank" className="text-neutral-600 hover:text-neutral-900">
              Lihat situs
            </Link>
            <span className="hidden text-neutral-500 sm:inline">{session.user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
