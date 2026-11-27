import type { Metadata } from "next";
import { getSettingsRow } from "@/lib/admin/server";
import { SOCIAL_FIELDS } from "@/lib/admin/social";
import { AdminForm } from "@/components/admin/AdminForm";
import { TextArea, TextField } from "@/components/admin/fields";
import { PageHeader, Section } from "@/components/admin/ui";
import { updateContact } from "../settings-actions";

export const metadata: Metadata = { title: "Kontak" };

export default async function ContactSettingsPage() {
  const s = await getSettingsRow();
  const social = s?.social_links ?? {};
  return (
    <div>
      <PageHeader title="Kontak dan WhatsApp" description="Tampil di halaman Kontak, footer, dan tombol WhatsApp. Kosongkan kolom yang tidak dipakai." />
      <AdminForm action={updateContact}>
        <Section title="Kontak">
          <TextField
            name="whatsapp_number"
            label="Nomor WhatsApp"
            type="tel"
            maxLength={20}
            defaultValue={s?.whatsapp_number}
            hint="Boleh ditulis 0812..., +62812..., atau 62812.... Disimpan dalam format 62812...."
          />
          <TextField name="contact_email" label="Email" type="email" maxLength={200} defaultValue={s?.contact_email} />
          <TextField name="contact_phone" label="Telepon kantor" type="tel" maxLength={40} defaultValue={s?.contact_phone} />
          <TextArea name="address" label="Alamat" rows={3} maxLength={500} defaultValue={s?.address} />
        </Section>
        <Section title="Media sosial">
          {SOCIAL_FIELDS.map((f) => (
            <TextField key={f.key} name={`social_${f.key}`} label={f.label} type="url" defaultValue={social[f.key]} placeholder="https://" />
          ))}
        </Section>
      </AdminForm>
    </div>
  );
}
