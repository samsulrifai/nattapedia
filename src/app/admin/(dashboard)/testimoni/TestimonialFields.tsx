import { asc } from "drizzle-orm";
import { schema } from "@/lib/db";
import { adminPageDb } from "@/lib/admin/server";
import { storageUrl } from "@/lib/storage-url";
import { Checkbox, ImageField, SelectField, TextArea, TextField } from "@/components/admin/fields";
import type { Testimonial } from "@/types/database";

export async function TestimonialFields({ testimonial: t }: { testimonial?: Testimonial }) {
  const projects = await (await adminPageDb())
    .select({ id: schema.portfolio_projects.id, title: schema.portfolio_projects.title })
    .from(schema.portfolio_projects)
    .orderBy(asc(schema.portfolio_projects.title));

  return (
    <>
      <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">
        Isi hanya dengan testimoni asli yang sudah diizinkan klien untuk ditampilkan.
      </p>
      <TextField name="author_name" label="Nama pemberi testimoni" required maxLength={120} defaultValue={t?.author_name} />
      <TextField name="author_role" label="Jabatan" maxLength={120} defaultValue={t?.author_role} placeholder="Contoh: Pemilik" />
      <TextField name="company" label="Perusahaan" maxLength={160} defaultValue={t?.company} />
      <TextArea name="quote" label="Isi testimoni" required rows={5} maxLength={1500} defaultValue={t?.quote} />
      <ImageField name="avatar" label="Foto (opsional)" currentUrl={storageUrl(t?.avatar_image)} removeName="remove_avatar" />
      <SelectField
        name="project_id"
        label="Proyek terkait (opsional)"
        emptyLabel="(Tidak ada)"
        options={projects.map((p) => ({ value: p.id, label: p.title }))}
        defaultValue={t?.project_id}
      />
      <TextField name="sort_order" label="Urutan tampil" type="number" defaultValue={t?.sort_order ?? 0} hint="Angka kecil tampil lebih dulu." />
      <Checkbox name="is_published" label="Tayangkan di situs" defaultChecked={t?.is_published} />
    </>
  );
}
