import type { Metadata } from "next";
import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { schema } from "@/lib/db";
import { adminPageDb } from "@/lib/admin/server";
import { isUuid } from "@/lib/admin/validate";
import { storageUrl } from "@/lib/storage-url";
import { AdminForm } from "@/components/admin/AdminForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { ImageField, TextField } from "@/components/admin/fields";
import { BackLink, PageHeader } from "@/components/admin/ui";
import {
  addGalleryImage,
  deleteGalleryImage,
  deleteProject,
  updateGalleryImage,
  updateProject,
} from "../actions";
import { ProjectFields } from "../ProjectFields";

export const metadata: Metadata = { title: "Ubah Proyek" };

export default async function EditProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ dibuat?: string }>;
}) {
  const { id } = await params;
  const { dibuat } = await searchParams;
  if (!isUuid(id)) notFound();
  const db = await adminPageDb();
  const [project] = await db
    .select()
    .from(schema.portfolio_projects)
    .where(eq(schema.portfolio_projects.id, id))
    .limit(1);
  if (!project) notFound();
  const gallery = await db
    .select()
    .from(schema.portfolio_images)
    .where(eq(schema.portfolio_images.project_id, id))
    .orderBy(asc(schema.portfolio_images.sort_order), asc(schema.portfolio_images.created_at));

  return (
    <div>
      <BackLink href="/admin/portofolio" label="Kembali ke daftar portofolio" />
      <PageHeader title={`Ubah Proyek: ${project.title}`} />
      {dibuat && (
        <p className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          Proyek berhasil dibuat. Tambahkan gambar galeri di bagian bawah jika perlu.
        </p>
      )}
      <AdminForm action={updateProject.bind(null, project.id)}>
        <ProjectFields project={project} />
      </AdminForm>

      <section className="mt-12 max-w-3xl border-t border-neutral-200 pt-6">
        <h2 className="text-lg font-semibold">Galeri gambar</h2>
        <p className="mt-1 text-sm text-neutral-600">Tampil di halaman detail proyek. Unggah satu gambar per kali.</p>
        {gallery.length > 0 && (
          <ul className="mt-4 space-y-4">
            {gallery.map((img) => (
              <li key={img.id} className="flex flex-wrap items-start gap-4 rounded-md border border-neutral-200 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={storageUrl(img.image_path) ?? ""} alt={img.alt_text} className="h-24 w-36 rounded object-cover" />
                <div className="min-w-60 flex-1">
                  <AdminForm action={updateGalleryImage.bind(null, project.id, img.id)} className="space-y-3" submitLabel="Simpan gambar">
                    <TextField name="alt_text" label="Deskripsi gambar (alt)" maxLength={200} defaultValue={img.alt_text} />
                    <TextField name="sort_order" label="Urutan" type="number" defaultValue={img.sort_order} />
                  </AdminForm>
                </div>
                <DeleteButton
                  action={deleteGalleryImage.bind(null, project.id, img.id)}
                  confirmText="Hapus gambar ini dari galeri?"
                />
              </li>
            ))}
          </ul>
        )}
        <div className="mt-6 rounded-md bg-neutral-50 p-4">
          <h3 className="mb-3 text-sm font-semibold">Tambah gambar</h3>
          <AdminForm action={addGalleryImage.bind(null, project.id)} className="space-y-3" submitLabel="Unggah gambar">
            <ImageField name="image" label="File gambar" />
            <TextField name="alt_text" label="Deskripsi gambar (alt)" maxLength={200} hint="Jelaskan isi gambar, mis. Tampilan beranda di ponsel." />
          </AdminForm>
        </div>
      </section>

      <div className="mt-12 border-t border-neutral-200 pt-6">
        <DeleteButton
          action={deleteProject.bind(null, project.id)}
          label="Hapus proyek"
          confirmText={`Hapus proyek "${project.title}" beserta semua gambarnya? Tindakan ini tidak bisa dibatalkan.`}
        />
      </div>
    </div>
  );
}
