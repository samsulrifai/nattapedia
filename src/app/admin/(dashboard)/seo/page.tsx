import type { Metadata } from "next";
import { getSettingsRow } from "@/lib/admin/server";
import { storageUrl } from "@/lib/storage-url";
import { AdminForm } from "@/components/admin/AdminForm";
import { ImageField, TextArea, TextField } from "@/components/admin/fields";
import { PageHeader } from "@/components/admin/ui";
import { updateSeo } from "../settings-actions";

export const metadata: Metadata = { title: "SEO" };

export default async function SeoSettingsPage() {
  const s = await getSettingsRow();
  return (
    <div>
      <PageHeader title="Pengaturan SEO" description="Judul dan deskripsi yang tampil di hasil pencarian Google dan saat tautan dibagikan." />
      <AdminForm action={updateSeo}>
        <TextField name="site_name" label="Nama situs" required maxLength={80} defaultValue={s?.site_name ?? "Nattapedia"} />
        <TextField name="seo_title" label="Judul SEO beranda" maxLength={70} defaultValue={s?.seo_title} hint="Disarankan 50-60 karakter. Kosongkan untuk memakai nama situs." />
        <TextArea name="seo_description" label="Deskripsi SEO" rows={3} maxLength={160} defaultValue={s?.seo_description} hint="Disarankan 120-160 karakter, jelaskan layanan utama." />
        <ImageField
          name="og_image"
          label="Gambar saat dibagikan (Open Graph)"
          currentUrl={storageUrl(s?.og_image)}
          removeName="remove_og_image"
          hint="Ukuran ideal 1200 x 630 piksel. JPG, PNG, WEBP, atau AVIF, maksimal 4 MB."
        />
      </AdminForm>
    </div>
  );
}
