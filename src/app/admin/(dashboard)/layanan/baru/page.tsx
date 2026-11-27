import type { Metadata } from "next";
import { AdminForm } from "@/components/admin/AdminForm";
import { BackLink, PageHeader } from "@/components/admin/ui";
import { createService } from "../actions";
import { ServiceFields } from "../ServiceFields";

export const metadata: Metadata = { title: "Tambah Layanan" };

export default function NewServicePage() {
  return (
    <div>
      <BackLink href="/admin/layanan" label="Kembali ke daftar layanan" />
      <PageHeader title="Tambah Layanan" />
      <AdminForm action={createService}>
        <ServiceFields />
      </AdminForm>
    </div>
  );
}
