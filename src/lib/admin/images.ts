import "server-only";
import { deleteImage, isStorageConfigured, uploadImage } from "@/lib/storage";
import { logAdminError } from "./server";

// Alur ganti gambar yang aman:
// 1. prepareImage(): unggah file baru (jika ada) SEBELUM menyimpan ke DB.
// 2. Simpan ke DB dengan `key` hasil langkah 1.
// 3. Jika DB gagal: rollback() menghapus file yang baru diunggah.
//    Jika DB berhasil: commit() menghapus gambar lama yang diganti/dihapus.

export type ImageChange = {
  key: string | null; // nilai kolom gambar yang baru
  rollback: () => Promise<void>;
  commit: () => Promise<void>;
};

async function safeDelete(key: string | null | undefined) {
  try {
    await deleteImage(key);
  } catch (error) {
    logAdminError("deleteImage", error);
  }
}

export class ImageUploadError extends Error {}

export async function prepareImage(opts: {
  file: File | null;
  remove: boolean;
  oldKey: string | null;
  folder: string;
}): Promise<ImageChange> {
  const { file, remove, oldKey, folder } = opts;
  if (!file) {
    const key = remove ? null : oldKey;
    return {
      key,
      rollback: async () => {},
      commit: async () => {
        if (remove && oldKey) await safeDelete(oldKey);
      },
    };
  }
  if (!isStorageConfigured()) {
    throw new ImageUploadError("Penyimpanan gambar belum dikonfigurasi. Hubungi pengelola server.");
  }
  let newKey: string;
  try {
    newKey = await uploadImage(file, folder);
  } catch (error) {
    logAdminError("uploadImage", error);
    throw new ImageUploadError("Upload gambar gagal. Pastikan format JPG/PNG/WEBP/AVIF dan ukuran maksimal 4 MB.");
  }
  return {
    key: newKey,
    rollback: () => safeDelete(newKey),
    commit: async () => {
      if (oldKey && oldKey !== newKey) await safeDelete(oldKey);
    },
  };
}

export async function deleteImages(keys: (string | null | undefined)[]) {
  await Promise.all(keys.filter(Boolean).map((k) => safeDelete(k)));
}
