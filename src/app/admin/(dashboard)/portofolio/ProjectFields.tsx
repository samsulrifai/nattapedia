import { storageUrl } from "@/lib/storage-url";
import { Checkbox, ImageField, TextArea, TextField } from "@/components/admin/fields";
import { Section } from "@/components/admin/ui";
import type { PortfolioProject } from "@/types/database";

export function ProjectFields({ project: p }: { project?: PortfolioProject }) {
  return (
    <>
      <Section title="Informasi utama">
        <TextField name="title" label="Judul proyek" required maxLength={160} defaultValue={p?.title} />
        <TextField name="slug" label="Slug (alamat URL)" maxLength={80} defaultValue={p?.slug} hint="Kosongkan agar dibuat otomatis dari judul. Mengubah slug akan mengubah alamat halaman proyek." />
        <TextField name="client_name" label="Nama klien" maxLength={160} defaultValue={p?.client_name} hint="Kosongkan jika klien tidak ingin disebut." />
        <TextField name="category" label="Kategori" maxLength={80} defaultValue={p?.category} placeholder="Contoh: Company Profile" />
        <TextArea name="summary" label="Ringkasan" rows={3} maxLength={400} defaultValue={p?.summary} hint="Tampil di kartu portofolio." />
        <ImageField name="cover" label="Gambar sampul" currentUrl={storageUrl(p?.cover_image)} removeName="remove_cover" />
      </Section>
      <Section title="Studi kasus">
        <TextArea name="problem" label="Masalah / kebutuhan klien" rows={5} maxLength={5000} defaultValue={p?.problem} />
        <TextArea name="solution" label="Solusi yang dibuat" rows={5} maxLength={5000} defaultValue={p?.solution} />
        <TextField name="tech_stack" label="Teknologi" defaultValue={p?.tech_stack.join(", ")} hint="Pisahkan dengan koma, mis. Next.js, Tailwind CSS." />
        <TextField name="project_url" label="URL proyek (opsional)" type="url" defaultValue={p?.project_url} placeholder="https://" />
        <TextField name="completed_at" label="Tanggal selesai (opsional)" type="date" defaultValue={p?.completed_at} />
      </Section>
      <Section title="Tampilan">
        <TextField name="sort_order" label="Urutan tampil" type="number" defaultValue={p?.sort_order ?? 0} hint="Angka kecil tampil lebih dulu." />
        <Checkbox name="is_featured" label="Unggulan (tampil di Beranda)" defaultChecked={p?.is_featured} />
        <Checkbox name="is_published" label="Tayangkan di situs" defaultChecked={p?.is_published} hint="Jika tidak dicentang, proyek disimpan sebagai draf." />
      </Section>
    </>
  );
}
