import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { schema } from "@/lib/db";
import { adminPageDb } from "@/lib/admin/server";
import { isUuid, normalizeWhatsapp } from "@/lib/admin/validate";
import { LEAD_STATUSES } from "@/lib/admin/leads";
import { AdminForm } from "@/components/admin/AdminForm";
import { SelectField, TextArea } from "@/components/admin/fields";
import { BackLink, formatDateTime, PageHeader } from "@/components/admin/ui";
import { updateLead } from "../actions";

export const metadata: Metadata = { title: "Detail Lead" };

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const { leads, services } = schema;
  const [row] = await (await adminPageDb())
    .select({ lead: leads, service: services.title })
    .from(leads)
    .leftJoin(services, eq(leads.service_id, services.id))
    .where(eq(leads.id, id))
    .limit(1);
  if (!row) notFound();
  const { lead, service } = row;
  const wa = lead.phone ? normalizeWhatsapp(lead.phone) : null;

  const info: [string, React.ReactNode][] = [
    ["Masuk", formatDateTime(lead.created_at)],
    ["Perusahaan", lead.company ?? "-"],
    [
      "Email",
      lead.email ? (
        <a href={`mailto:${lead.email}`} className="underline">
          {lead.email}
        </a>
      ) : (
        "-"
      ),
    ],
    [
      "Telepon / WhatsApp",
      lead.phone ? (
        <>
          {lead.phone}
          {wa && (
            <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="ml-2 underline">
              Buka WhatsApp
            </a>
          )}
        </>
      ) : (
        "-"
      ),
    ],
    ["Layanan", service ?? "-"],
    ["Perkiraan anggaran", lead.budget_range ?? "-"],
    ["Halaman asal", lead.source_page ?? "-"],
  ];

  return (
    <div className="max-w-3xl">
      <BackLink href="/admin/leads" label="Kembali ke daftar leads" />
      <PageHeader title={lead.name} />
      <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-[180px_1fr]">
        {info.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="font-medium text-neutral-600">{label}</dt>
            <dd className="break-words">{value}</dd>
          </div>
        ))}
      </dl>
      <h2 className="mt-6 text-sm font-medium text-neutral-600">Pesan</h2>
      <p className="mt-1 whitespace-pre-line rounded-md bg-neutral-50 p-4 text-sm">{lead.message}</p>

      <h2 className="mt-8 mb-3 text-lg font-semibold">Tindak lanjut</h2>
      <AdminForm action={updateLead.bind(null, lead.id)}>
        <SelectField name="status" label="Status" options={LEAD_STATUSES} defaultValue={lead.status} />
        <TextArea name="admin_notes" label="Catatan internal" rows={5} maxLength={5000} defaultValue={lead.admin_notes} hint="Hanya terlihat di admin." />
      </AdminForm>
    </div>
  );
}
