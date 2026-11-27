import type { Metadata } from "next";
import Link from "next/link";
import { asc } from "drizzle-orm";
import { schema } from "@/lib/db";
import { adminPageDb } from "@/lib/admin/server";
import { EmptyState, PageHeader, PublishedBadge } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Layanan" };

export default async function AdminServicesPage() {
  const rows = await (await adminPageDb())
    .select()
    .from(schema.services)
    .orderBy(asc(schema.services.sort_order), asc(schema.services.created_at));

  return (
    <div>
      <PageHeader title="Layanan" description="Layanan yang tampil di halaman Layanan dan Beranda." action={{ href: "/admin/layanan/baru", label: "Tambah layanan" }} />
      {rows.length === 0 ? (
        <EmptyState>Belum ada layanan. Klik &quot;Tambah layanan&quot; untuk mulai.</EmptyState>
      ) : (
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 text-neutral-600">
            <tr>
              <th className="py-2 pr-4 font-medium">Urutan</th>
              <th className="py-2 pr-4 font-medium">Nama</th>
              <th className="py-2 pr-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id} className="border-b border-neutral-100">
                <td className="py-2 pr-4 text-neutral-500">{s.sort_order}</td>
                <td className="py-2 pr-4">
                  <Link href={`/admin/layanan/${s.id}`} className="font-medium hover:underline">
                    {s.title}
                  </Link>
                  <div className="text-xs text-neutral-500">/{s.slug}</div>
                </td>
                <td className="py-2 pr-4">
                  <PublishedBadge published={s.is_published} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
