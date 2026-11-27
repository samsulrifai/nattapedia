import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { schema } from "@/lib/db";
import { adminPageDb } from "@/lib/admin/server";
import { isUuid } from "@/lib/admin/validate";
import { AdminForm } from "@/components/admin/AdminForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { BackLink, PageHeader } from "@/components/admin/ui";
import { deleteService, updateService } from "../actions";
import { ServiceFields } from "../ServiceFields";

export const metadata: Metadata = { title: "Ubah Layanan" };

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const [service] = await (await adminPageDb()).select().from(schema.services).where(eq(schema.services.id, id)).limit(1);
  if (!service) notFound();

  return (
    <div>
      <BackLink href="/admin/layanan" label="Kembali ke daftar layanan" />
      <PageHeader title={`Ubah Layanan: ${service.title}`} />
      <AdminForm action={updateService.bind(null, service.id)}>
        <ServiceFields service={service} />
      </AdminForm>
      <div className="mt-10 border-t border-neutral-200 pt-6">
        <DeleteButton
          action={deleteService.bind(null, service.id)}
          label="Hapus layanan"
          confirmText={`Hapus layanan "${service.title}"? Tindakan ini tidak bisa dibatalkan.`}
        />
      </div>
    </div>
  );
}
