"use server";

import { eq } from "drizzle-orm";
import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { schema } from "@/lib/db";
import { TAGS } from "@/lib/cache-tags";
import type { FormState } from "@/lib/admin/form-state";
import { failState, FormReader, isUuid } from "@/lib/admin/validate";
import { getAdminDb, isUniqueViolation, logAdminError } from "@/lib/admin/server";
import { SERVICE_ICON_OPTIONS } from "@/lib/admin/service-icons";

const { services } = schema;
const ICONS = SERVICE_ICON_OPTIONS.map((o) => o.value);

function read(fd: FormData) {
  const f = new FormReader(fd);
  const title = f.text("title", "Nama layanan", { required: true, max: 120 });
  const data = {
    title,
    slug: f.slug("slug", title),
    summary: f.text("summary", "Ringkasan", { max: 300 }),
    description: f.text("description", "Deskripsi", { max: 5000 }),
    icon: f.text("icon", "Ikon") || null,
    sort_order: f.integer("sort_order", "Urutan"),
    is_published: f.checkbox("is_published"),
  };
  if (data.icon && !ICONS.includes(data.icon)) f.addError("icon", "Ikon tidak dikenal.");
  return { f, data };
}

function dbError(scope: string, error: unknown, f: FormReader): FormState {
  if (isUniqueViolation(error)) {
    f.addError("slug", "Slug sudah dipakai layanan lain.");
    return f.fail();
  }
  logAdminError(scope, error);
  return failState("Gagal menyimpan. Coba lagi beberapa saat.", f.values);
}

export async function createService(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const { f, data } = read(fd);
  if (f.hasErrors()) return f.fail();
  try {
    await getAdminDb().insert(services).values(data);
  } catch (error) {
    return dbError("createService", error, f);
  }
  updateTag(TAGS.services);
  redirect("/admin/layanan");
}

export async function updateService(id: string, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  if (!isUuid(id)) return failState("Data tidak ditemukan.");
  const { f, data } = read(fd);
  if (f.hasErrors()) return f.fail();
  try {
    const rows = await getAdminDb()
      .update(services)
      .set(data)
      .where(eq(services.id, id))
      .returning({ id: services.id });
    if (rows.length === 0) return failState("Layanan tidak ditemukan. Mungkin sudah dihapus.");
  } catch (error) {
    return dbError("updateService", error, f);
  }
  updateTag(TAGS.services);
  refresh();
  return { status: "success", message: "Perubahan disimpan dan sudah tampil di situs." };
}

export async function deleteService(id: string): Promise<void> {
  await requireAdmin();
  if (!isUuid(id)) redirect("/admin/layanan");
  // Leads yang memilih layanan ini tetap tersimpan (service_id menjadi kosong).
  await getAdminDb().delete(services).where(eq(services.id, id));
  updateTag(TAGS.services);
  redirect("/admin/layanan");
}
