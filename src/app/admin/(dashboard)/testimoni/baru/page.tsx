import type { Metadata } from "next";
import { AdminForm } from "@/components/admin/AdminForm";
import { BackLink, PageHeader } from "@/components/admin/ui";
import { createTestimonial } from "../actions";
import { TestimonialFields } from "../TestimonialFields";

export const metadata: Metadata = { title: "Tambah Testimoni" };

export default function NewTestimonialPage() {
  return (
    <div>
      <BackLink href="/admin/testimoni" label="Kembali ke daftar testimoni" />
      <PageHeader title="Tambah Testimoni" />
      <AdminForm action={createTestimonial}>
        <TestimonialFields />
      </AdminForm>
    </div>
  );
}
