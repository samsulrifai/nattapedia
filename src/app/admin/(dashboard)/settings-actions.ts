"use server";

import { eq } from "drizzle-orm";
import { refresh, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { schema } from "@/lib/db";
import { TAGS } from "@/lib/cache-tags";
import type { FormState } from "@/lib/admin/form-state";
import { failState, FormReader } from "@/lib/admin/validate";
import { getAdminDb, logAdminError } from "@/lib/admin/server";
import { ImageUploadError, prepareImage, type ImageChange } from "@/lib/admin/images";
import { SOCIAL_FIELDS } from "@/lib/admin/social";

// Pengaturan situs disimpan di satu baris site_settings (id = 1).
const { site_settings } = schema;
type SettingsPatch = Partial<Omit<typeof site_settings.$inferInsert, "id" | "updated_at">>;
const SAVED: FormState = { status: "success", message: "Perubahan disimpan dan sudah tampil di situs." };

async function saveSettings(patch: SettingsPatch) {
  await getAdminDb()
    .insert(site_settings)
    .values({ id: 1, ...patch })
    .onConflictDoUpdate({ target: site_settings.id, set: patch });
}

export async function updatePageTexts(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const f = new FormReader(fd);
  const patch: SettingsPatch = {
    hero_title: f.text("hero_title", "Judul utama beranda", { required: true, max: 160 }),
    hero_subtitle: f.text("hero_subtitle", "Subjudul beranda", { max: 400 }),
    about_content: f.text("about_content", "Isi Tentang Kami", { max: 10000 }),
    process_content: f.text("process_content", "Isi Proses Kerja", { max: 5000 }),
  };
  if (f.hasErrors()) return f.fail();
  try {
    await saveSettings(patch);
  } catch (error) {
    logAdminError("updatePageTexts", error);
    return failState("Gagal menyimpan. Coba lagi beberapa saat.", f.values);
  }
  updateTag(TAGS.settings);
  refresh();
  return SAVED;
}

export async function updateContact(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const f = new FormReader(fd);
  const social_links: Record<string, string> = {};
  for (const s of SOCIAL_FIELDS) {
    const url = f.url(`social_${s.key}`, s.label);
    if (url) social_links[s.key] = url;
  }
  const patch: SettingsPatch = {
    contact_email: f.email("contact_email", "Email"),
    contact_phone: f.optionalText("contact_phone", "Nomor telepon", 40),
    whatsapp_number: f.whatsapp("whatsapp_number", "Nomor WhatsApp"),
    address: f.optionalText("address", "Alamat", 500),
    social_links,
  };
  if (f.hasErrors()) return f.fail();
  try {
    await saveSettings(patch);
  } catch (error) {
    logAdminError("updateContact", error);
    return failState("Gagal menyimpan. Coba lagi beberapa saat.", f.values);
  }
  updateTag(TAGS.settings);
  refresh();
  return SAVED;
}

export async function updateSeo(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const f = new FormReader(fd);
  const patch: SettingsPatch = {
    site_name: f.text("site_name", "Nama situs", { required: true, max: 80 }),
    seo_title: f.optionalText("seo_title", "Judul SEO", 70),
    seo_description: f.optionalText("seo_description", "Deskripsi SEO", 160),
  };
  const file = f.image("og_image");
  const remove = f.checkbox("remove_og_image");
  if (f.hasErrors()) return f.fail();

  const db = getAdminDb();
  const [row] = await db
    .select({ og_image: site_settings.og_image })
    .from(site_settings)
    .where(eq(site_settings.id, 1))
    .limit(1);

  let image: ImageChange;
  try {
    image = await prepareImage({ file, remove, oldKey: row?.og_image ?? null, folder: "seo" });
  } catch (error) {
    if (error instanceof ImageUploadError) {
      f.addError("og_image", error.message);
      return f.fail(error.message);
    }
    throw error;
  }
  try {
    await saveSettings({ ...patch, og_image: image.key });
  } catch (error) {
    await image.rollback();
    logAdminError("updateSeo", error);
    return failState("Gagal menyimpan. Coba lagi beberapa saat.", f.values);
  }
  await image.commit();
  updateTag(TAGS.settings);
  refresh();
  return SAVED;
}
