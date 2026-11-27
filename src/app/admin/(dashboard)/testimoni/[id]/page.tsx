import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { schema } from "@/lib/db";
import { adminPageDb } from "@/lib/admin/server";
import { isUuid } from "@/lib/admin/validate";
import { AdminForm } from "@/components/admin/AdminForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { BackLink, PageHeader } from "@/components/admin/ui";
import { deleteTestimonial, updateTestimonial } from "../actions";
import { TestimonialFields } from "../TestimonialFields";

export const metadata: Metadata = { title: "Ubah Testimoni" };

export default async function EditTestimonialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const [t] = await (await adminPageDb()).select().from(schema.testimonials).where(eq(schema.testimonials.id, id)).limit(1);
  if (!t) notFound();

  return (
    <div>
      <BackLink href="/admin/testimoni" label="Kembali ke daftar testimoni" />
      <PageHeader title={`Ubah Testimoni: ${t.author_name}`} />
      <AdminForm action={updateTestimonial.bind(null, t.id)}>
        <TestimonialFields testimonial={t} />
      </AdminForm>
      <div className="mt-10 border-t border-neutral-200 pt-6">
        <DeleteButton
          action={deleteTestimonial.bind(null, t.id)}
          label="Hapus testimoni"
          confirmText={`Hapus testimoni dari "${t.author_name}"? Tindakan ini tidak bisa dibatalkan.`}
        />
      </div>
    </div>
  );
}
