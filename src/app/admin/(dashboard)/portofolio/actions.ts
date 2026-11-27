"use server";

import { and, eq, max } from "drizzle-orm";
import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { schema } from "@/lib/db";
import { TAGS } from "@/lib/cache-tags";
import type { FormState } from "@/lib/admin/form-state";
import { failState, FormReader, isUuid } from "@/lib/admin/validate";
import { getAdminDb, isUniqueViolation, logAdminError } from "@/lib/admin/server";
import { deleteImages, ImageUploadError, prepareImage, type ImageChange } from "@/lib/admin/images";

const { portfolio_projects: projects, portfolio_images: images } = schema;
const SAVED = "Perubahan disimpan dan sudah tampil di situs.";

function read(fd: FormData) {
  const f = new FormReader(fd);
  const title = f.text("title", "Judul proyek", { required: true, max: 160 });
  const data = {
    title,
    slug: f.slug("slug", title),
    client_name: f.optionalText("client_name", "Nama klien", 160),
    category: f.optionalText("category", "Kategori", 80),
    summary: f.text("summary", "Ringkasan", { max: 400 }),
    problem: f.text("problem", "Masalah", { max: 5000 }),
    solution: f.text("solution", "Solusi", { max: 5000 }),
    tech_stack: f.list("tech_stack", "Teknologi"),
    project_url: f.url("project_url", "URL proyek"),
    completed_at: f.date("completed_at", "Tanggal selesai"),
    sort_order: f.integer("sort_order", "Urutan"),
    is_featured: f.checkbox("is_featured"),
    is_published: f.checkbox("is_published"),
  };
  return { f, data, cover: f.image("cover"), removeCover: f.checkbox("remove_cover") };
}

async function save(id: string | null, fd: FormData): Promise<FormState & { id?: string }> {
  const { f, data, cover, removeCover } = read(fd);
  if (f.hasErrors()) return f.fail();
  const db = getAdminDb();

  let oldKey: string | null = null;
  if (id) {
    const [row] = await db
      .select({ cover_image: projects.cover_image })
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);
    if (!row) return failState("Proyek tidak ditemukan. Mungkin sudah dihapus.");
    oldKey = row.cover_image;
  }

  let image: ImageChange;
  try {
    image = await prepareImage({ file: cover, remove: removeCover, oldKey, folder: "portfolio" });
  } catch (error) {
    if (error instanceof ImageUploadError) {
      f.addError("cover", error.message);
      return f.fail(error.message);
    }
    throw error;
  }

  let savedId = id;
  try {
    const values = { ...data, cover_image: image.key };
    if (id) {
      await db.update(projects).set(values).where(eq(projects.id, id));
    } else {
      const [row] = await db.insert(projects).values(values).returning({ id: projects.id });
      savedId = row.id;
    }
  } catch (error) {
    await image.rollback();
    if (isUniqueViolation(error)) {
      f.addError("slug", "Slug sudah dipakai proyek lain.");
      return f.fail();
    }
    logAdminError("saveProject", error);
    return failState("Gagal menyimpan. Coba lagi beberapa saat.", f.values);
  }
  await image.commit();
  updateTag(TAGS.portfolio);
  updateTag(TAGS.testimonials); // testimoni bisa menampilkan judul proyek terkait
  refresh();
  return { status: "success", message: SAVED, id: savedId ?? undefined };
}

export async function createProject(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const result = await save(null, fd);
  if (result.status === "success" && result.id) redirect(`/admin/portofolio/${result.id}?dibuat=1`);
  return result;
}

export async function updateProject(id: string, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  if (!isUuid(id)) return failState("Data tidak ditemukan.");
  const { status, message, errors, values } = await save(id, fd);
  return { status, message, errors, values };
}

export async function deleteProject(id: string): Promise<void> {
  await requireAdmin();
  if (!isUuid(id)) redirect("/admin/portofolio");
  const db = getAdminDb();
  const gallery = await db.select({ key: images.image_path }).from(images).where(eq(images.project_id, id));
  // Baris galeri ikut terhapus (ON DELETE CASCADE); testimoni terkait menjadi tanpa proyek.
  const rows = await db.delete(projects).where(eq(projects.id, id)).returning({ cover: projects.cover_image });
  if (rows.length > 0) await deleteImages([rows[0].cover, ...gallery.map((g) => g.key)]);
  updateTag(TAGS.portfolio);
  updateTag(TAGS.testimonials);
  redirect("/admin/portofolio");
}

// ---------------------------------------------------------------------------
// Galeri gambar proyek
// ---------------------------------------------------------------------------

export async function addGalleryImage(projectId: string, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  if (!isUuid(projectId)) return failState("Data tidak ditemukan.");
  const f = new FormReader(fd);
  const file = f.image("image");
  const alt = f.text("alt_text", "Deskripsi gambar", { max: 200 });
  if (!file && !f.errors.image) f.addError("image", "Pilih file gambar terlebih dahulu.");
  if (f.hasErrors() || !file) return f.fail();

  const db = getAdminDb();
  const [project] = await db.select({ id: projects.id }).from(projects).where(eq(projects.id, projectId)).limit(1);
  if (!project) return failState("Proyek tidak ditemukan. Mungkin sudah dihapus.");

  let image: ImageChange;
  try {
    image = await prepareImage({ file, remove: false, oldKey: null, folder: "portfolio" });
  } catch (error) {
    if (error instanceof ImageUploadError) {
      f.addError("image", error.message);
      return f.fail(error.message);
    }
    throw error;
  }
  try {
    const [{ value: last }] = await db
      .select({ value: max(images.sort_order) })
      .from(images)
      .where(eq(images.project_id, projectId));
    await db.insert(images).values({
      project_id: projectId,
      image_path: image.key!,
      alt_text: alt,
      sort_order: (last ?? -1) + 1,
    });
  } catch (error) {
    await image.rollback();
    logAdminError("addGalleryImage", error);
    return failState("Gagal menyimpan gambar. Coba lagi beberapa saat.");
  }
  updateTag(TAGS.portfolio);
  refresh();
  return { status: "success", message: "Gambar ditambahkan ke galeri." };
}

export async function updateGalleryImage(
  projectId: string,
  imageId: string,
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  await requireAdmin();
  if (!isUuid(projectId) || !isUuid(imageId)) return failState("Data tidak ditemukan.");
  const f = new FormReader(fd);
  const alt_text = f.text("alt_text", "Deskripsi gambar", { max: 200 });
  const sort_order = f.integer("sort_order", "Urutan");
  if (f.hasErrors()) return f.fail();
  const rows = await getAdminDb()
    .update(images)
    .set({ alt_text, sort_order })
    .where(and(eq(images.id, imageId), eq(images.project_id, projectId)))
    .returning({ id: images.id });
  if (rows.length === 0) return failState("Gambar tidak ditemukan.");
  updateTag(TAGS.portfolio);
  refresh();
  return { status: "success", message: "Disimpan." };
}

export async function deleteGalleryImage(projectId: string, imageId: string): Promise<void> {
  await requireAdmin();
  if (!isUuid(projectId) || !isUuid(imageId)) redirect("/admin/portofolio");
  const rows = await getAdminDb()
    .delete(images)
    .where(and(eq(images.id, imageId), eq(images.project_id, projectId)))
    .returning({ key: images.image_path });
  await deleteImages(rows.map((r) => r.key));
  updateTag(TAGS.portfolio);
  redirect(`/admin/portofolio/${projectId}`);
}
