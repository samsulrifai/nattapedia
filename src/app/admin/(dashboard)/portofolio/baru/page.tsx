import type { Metadata } from "next";
import { AdminForm } from "@/components/admin/AdminForm";
import { BackLink, PageHeader } from "@/components/admin/ui";
import { createProject } from "../actions";
import { ProjectFields } from "../ProjectFields";

export const metadata: Metadata = { title: "Tambah Proyek" };

export default function NewProjectPage() {
  return (
    <div>
      <BackLink href="/admin/portofolio" label="Kembali ke daftar portofolio" />
      <PageHeader title="Tambah Proyek" description="Galeri gambar bisa ditambahkan setelah proyek disimpan." />
      <AdminForm action={createProject}>
        <ProjectFields />
      </AdminForm>
    </div>
  );
}
