import type { Metadata } from "next";
import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";
import { schema } from "@/lib/db";
import { adminPageDb } from "@/lib/admin/server";
import { LEAD_STATUSES, leadStatusMeta } from "@/lib/admin/leads";
import { Badge, EmptyState, formatDateTime, PageHeader } from "@/components/admin/ui";
import type { LeadStatus } from "@/types/database";

export const metadata: Metadata = { title: "Leads" };

const PAGE_SIZE = 25;

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; hal?: string }>;
}) {
  const sp = await searchParams;
  const status = LEAD_STATUSES.some((s) => s.value === sp.status) ? (sp.status as LeadStatus) : undefined;
  const page = Math.max(1, Number.parseInt(sp.hal ?? "1", 10) || 1);
  const { leads, services } = schema;
  const where = status ? eq(leads.status, status) : undefined;
  const db = await adminPageDb();

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: leads.id,
        name: leads.name,
        company: leads.company,
        email: leads.email,
        phone: leads.phone,
        status: leads.status,
        created_at: leads.created_at,
        service: services.title,
      })
      .from(leads)
      .leftJoin(services, eq(leads.service_id, services.id))
      .where(where)
      .orderBy(desc(leads.created_at))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ total: count() }).from(leads).where(where),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const qs = (p: number) => `/admin/leads?${new URLSearchParams({ ...(status ? { status } : {}), hal: String(p) })}`;

  return (
    <div>
      <PageHeader title="Leads" description="Permintaan penawaran dari formulir Kontak, terbaru di atas." />
      <nav aria-label="Filter status" className="mb-4 flex flex-wrap gap-2 text-sm">
        {[{ value: undefined, label: "Semua" }, ...LEAD_STATUSES].map((s) => {
          const active = s.value === status;
          return (
            <Link
              key={s.label}
              href={s.value ? `/admin/leads?status=${s.value}` : "/admin/leads"}
              aria-current={active ? "page" : undefined}
              className={`rounded-full border px-3 py-1 ${active ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 hover:bg-neutral-50"}`}
            >
              {s.label}
            </Link>
          );
        })}
      </nav>
      {rows.length === 0 ? (
        <EmptyState>Belum ada lead{status ? " dengan status ini" : ""}.</EmptyState>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-neutral-200 text-neutral-600">
              <tr>
                <th className="py-2 pr-4 font-medium">Masuk</th>
                <th className="py-2 pr-4 font-medium">Nama</th>
                <th className="py-2 pr-4 font-medium">Kontak</th>
                <th className="py-2 pr-4 font-medium">Layanan</th>
                <th className="py-2 pr-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => {
                const meta = leadStatusMeta(l.status);
                return (
                  <tr key={l.id} className="border-b border-neutral-100 align-top">
                    <td className="py-2 pr-4 whitespace-nowrap text-neutral-500">{formatDateTime(l.created_at)}</td>
                    <td className="py-2 pr-4">
                      <Link href={`/admin/leads/${l.id}`} className="font-medium hover:underline">
                        {l.name}
                      </Link>
                      {l.company && <div className="text-xs text-neutral-500">{l.company}</div>}
                    </td>
                    <td className="py-2 pr-4 text-neutral-700">
                      {l.phone && <div>{l.phone}</div>}
                      {l.email && <div className="text-xs">{l.email}</div>}
                    </td>
                    <td className="py-2 pr-4 text-neutral-700">{l.service ?? "-"}</td>
                    <td className="py-2 pr-4">
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {pages > 1 && (
        <nav aria-label="Halaman" className="mt-4 flex items-center gap-4 text-sm">
          {page > 1 && <Link href={qs(page - 1)}>&larr; Sebelumnya</Link>}
          <span className="text-neutral-500">
            Halaman {page} dari {pages}
          </span>
          {page < pages && <Link href={qs(page + 1)}>Berikutnya &rarr;</Link>}
        </nav>
      )}
    </div>
  );
}
