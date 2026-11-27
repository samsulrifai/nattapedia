import type { Metadata } from "next";
import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";
import { schema } from "@/lib/db";
import { adminPageDb } from "@/lib/admin/server";
import { leadStatusMeta } from "@/lib/admin/leads";
import { Badge, formatDateTime, PageHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Dasbor" };

export default async function AdminDashboardPage() {
  const db = await adminPageDb();
  const { leads, portfolio_projects, services, testimonials } = schema;
  const [[newLeads], [projects], [svc], [testi], recent] = await Promise.all([
    db.select({ n: count() }).from(leads).where(eq(leads.status, "baru")),
    db.select({ n: count() }).from(portfolio_projects),
    db.select({ n: count() }).from(services),
    db.select({ n: count() }).from(testimonials),
    db
      .select({ id: leads.id, name: leads.name, status: leads.status, created_at: leads.created_at })
      .from(leads)
      .orderBy(desc(leads.created_at))
      .limit(5),
  ]);

  const stats = [
    { label: "Lead baru", value: newLeads.n, href: "/admin/leads?status=baru" },
    { label: "Proyek portofolio", value: projects.n, href: "/admin/portofolio" },
    { label: "Layanan", value: svc.n, href: "/admin/layanan" },
    { label: "Testimoni", value: testi.n, href: "/admin/testimoni" },
  ];

  return (
    <div>
      <PageHeader title="Dasbor Admin" description="Kelola isi situs dan tindak lanjuti permintaan penawaran." />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-md border border-neutral-200 p-4 hover:bg-neutral-50">
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-sm text-neutral-600">{s.label}</div>
          </Link>
        ))}
      </div>
      <h2 className="mt-8 mb-3 text-lg font-semibold">Lead terbaru</h2>
      {recent.length === 0 ? (
        <p className="text-sm text-neutral-600">Belum ada lead.</p>
      ) : (
        <ul className="divide-y divide-neutral-100 border-y border-neutral-200 text-sm">
          {recent.map((l) => {
            const meta = leadStatusMeta(l.status);
            return (
              <li key={l.id} className="flex items-center justify-between gap-4 py-2">
                <Link href={`/admin/leads/${l.id}`} className="font-medium hover:underline">
                  {l.name}
                </Link>
                <span className="flex items-center gap-3 text-neutral-500">
                  {formatDateTime(l.created_at)} <Badge tone={meta.tone}>{meta.label}</Badge>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
