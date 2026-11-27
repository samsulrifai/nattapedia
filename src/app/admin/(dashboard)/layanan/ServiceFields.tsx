import { Checkbox, SelectField, TextArea, TextField } from "@/components/admin/fields";
import { SERVICE_ICON_OPTIONS } from "@/lib/admin/service-icons";
import type { Service } from "@/types/database";

export function ServiceFields({ service }: { service?: Service }) {
  return (
    <>
      <TextField name="title" label="Nama layanan" required maxLength={120} defaultValue={service?.title} placeholder="Contoh: Website Company Profile" />
      <TextField
        name="slug"
        label="Slug (alamat URL)"
        maxLength={80}
        defaultValue={service?.slug}
        hint="Kosongkan agar dibuat otomatis dari nama. Huruf kecil, angka, dan tanda strip."
      />
      <TextArea name="summary" label="Ringkasan singkat" rows={2} maxLength={300} defaultValue={service?.summary} hint="Tampil di kartu layanan. Maksimal 300 karakter." />
      <TextArea name="description" label="Deskripsi lengkap" rows={8} maxLength={5000} defaultValue={service?.description} hint="Pisahkan paragraf dengan baris kosong." />
      <SelectField name="icon" label="Ikon" options={SERVICE_ICON_OPTIONS} emptyLabel="(Bawaan: Globe)" defaultValue={service?.icon} />
      <TextField name="sort_order" label="Urutan tampil" type="number" defaultValue={service?.sort_order ?? 0} hint="Angka kecil tampil lebih dulu." />
      <Checkbox name="is_published" label="Tayangkan di situs" defaultChecked={service?.is_published} hint="Jika tidak dicentang, layanan disimpan sebagai draf." />
    </>
  );
}
