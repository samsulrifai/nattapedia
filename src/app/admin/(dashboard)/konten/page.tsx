import type { Metadata } from "next";
import { getSettingsRow } from "@/lib/admin/server";
import { AdminForm } from "@/components/admin/AdminForm";
import { TextArea, TextField } from "@/components/admin/fields";
import { PageHeader, Section } from "@/components/admin/ui";
import { updatePageTexts } from "../settings-actions";

export const metadata: Metadata = { title: "Teks Halaman" };

export default async function PageTextsPage() {
  const s = await getSettingsRow();
  return (
    <div>
      <PageHeader title="Teks Halaman" description="Teks yang tampil di Beranda dan halaman Tentang Kami. Teks bertanda [CONTOH] adalah placeholder yang perlu diganti." />
      <AdminForm action={updatePageTexts}>
        <Section title="Beranda">
          <TextField name="hero_title" label="Judul utama" required maxLength={160} defaultValue={s?.hero_title} />
          <TextArea name="hero_subtitle" label="Subjudul" rows={3} maxLength={400} defaultValue={s?.hero_subtitle} />
          <TextArea name="process_content" label="Proses kerja" rows={6} maxLength={5000} defaultValue={s?.process_content} hint="Pisahkan paragraf dengan baris kosong." />
        </Section>
        <Section title="Tentang Kami">
          <TextArea name="about_content" label="Isi halaman Tentang Kami" rows={12} maxLength={10000} defaultValue={s?.about_content} hint="Pisahkan paragraf dengan baris kosong." />
        </Section>
      </AdminForm>
    </div>
  );
}
