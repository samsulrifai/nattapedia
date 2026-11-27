"use server";

import { eq } from "drizzle-orm";
import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { schema } from "@/lib/db";
import { TAGS } from "@/lib/cache-tags";
import type { FormState } from "@/lib/admin/form-state";
import { failState, FormReader, isUuid } from "@/lib/admin/validate";
import { getAdminDb, logAdminError } from "@/lib/admin/server";
import { deleteImages, ImageUploadError, prepareImage, type ImageChange } from "@/lib/admin/images";

const { testimonials } = schema;

function read(fd: FormData) {
  const f = new FormReader(fd);
  const data = {
    author_name: f.text("author_name", "Nama pemberi testimoni", { required: true, max: 120 }),
    author_role: f.optionalText("author_role", "Jabatan", 120),
    company: f.optionalText("company", "Perusahaan", 160),
    quote: f.text("quote", "Isi testimoni", { required: true, max: 1500 }),
    project_id: f.uuid("project_id", "Proyek terkait"),
    sort_order: f.integer("sort_order", "Urutan"),
    is_published: f.checkbox("is_published"),
  };
  return { f, data, avatar: f.image("avatar"), removeAvatar: f.checkbox("remove_avatar") };
}

async function save(id: string | null, fd: FormData): Promise<FormState> {
  const { f, data, avatar, removeAvatar } = read(fd);
  if (f.hasErrors()) return f.fail();
  const db = getAdminDb();

  let oldKey: string | null = null;
  if (id) {
    const [row] = await db
      .select({ avatar_image: testimonials.avatar_image })
      .from(testimonials)
      .where(eq(testimonials.id, id))
      .limit(1);
    if (!row) return failState("Testimoni tidak ditemukan. Mungkin sudah dihapus.");
    oldKey = row.avatar_image;
  }

  let image: ImageChange;
  try {
    image = await prepareImage({ file: avatar, remove: removeAvatar, oldKey, folder: "testimonials" });
  } catch (error) {
    if (error instanceof ImageUploadError) {
      f.addError("avatar", error.message);
      return f.fail(error.message);
    }
    throw error;
  }

  try {
    const values = { ...data, avatar_image: image.key };
    if (id) await db.update(testimonials).set(values).where(eq(testimonials.id, id));
    else await db.insert(testimonials).values(values);
  } catch (error) {
    await image.rollback();
    logAdminError("saveTestimonial", error);
    return failState("Gagal menyimpan. Coba lagi beberapa saat.", f.values);
  }
  await image.commit();
  updateTag(TAGS.testimonials);
  refresh();
  return { status: "success", message: "Perubahan disimpan dan sudah tampil di situs." };
}

export async function createTestimonial(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const result = await save(null, fd);
  if (result.status === "success") redirect("/admin/testimoni");
  return result;
}

export async function updateTestimonial(id: string, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  if (!isUuid(id)) return failState("Data tidak ditemukan.");
  return save(id, fd);
}

export async function deleteTestimonial(id: string): Promise<void> {
  await requireAdmin();
  if (!isUuid(id)) redirect("/admin/testimoni");
  const rows = await getAdminDb()
    .delete(testimonials)
    .where(eq(testimonials.id, id))
    .returning({ avatar_image: testimonials.avatar_image });
  await deleteImages(rows.map((r) => r.avatar_image));
  updateTag(TAGS.testimonials);
  redirect("/admin/testimoni");
}
