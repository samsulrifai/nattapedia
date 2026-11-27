import "server-only";
import { AwsClient } from "aws4fetch";

// Penyimpanan gambar di Cloudflare R2 (API kompatibel S3, tier gratis).
// Hanya dipanggil dari Server Action admin SETELAH requireAdmin().
// Ganti penyedia cukup di file ini; sisa aplikasi hanya menyimpan "key".

export const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // batas body Vercel ~4,5 MB
export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

function config() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) return null;
  return {
    client: new AwsClient({ accessKeyId, secretAccessKey, service: "s3", region: "auto" }),
    endpoint: `https://${accountId}.r2.cloudflarestorage.com/${bucket}`,
  };
}

export const isStorageConfigured = () => config() !== null;

function objectUrl(endpoint: string, key: string) {
  return `${endpoint}/${key.split("/").map(encodeURIComponent).join("/")}`;
}

// Unggah gambar, kembalikan key untuk disimpan di DB.
export async function uploadImage(file: File, folder = "portfolio"): Promise<string> {
  const cfg = config();
  if (!cfg) throw new Error("Storage belum dikonfigurasi (variabel R2_*)");
  const ext = ALLOWED_IMAGE_TYPES[file.type];
  if (!ext) throw new Error("Format gambar harus JPG, PNG, WEBP, atau AVIF");
  if (file.size === 0 || file.size > MAX_IMAGE_BYTES) {
    throw new Error("Ukuran gambar maksimal 4 MB");
  }
  const safeFolder = folder.replace(/[^a-z0-9/_-]/gi, "").replace(/^\/+|\/+$/g, "") || "misc";
  const key = `${safeFolder}/${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;
  const res = await cfg.client.fetch(objectUrl(cfg.endpoint, key), {
    method: "PUT",
    body: await file.arrayBuffer(),
    headers: {
      "Content-Type": file.type,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
  if (!res.ok) throw new Error(`Upload gagal (HTTP ${res.status})`);
  return key;
}

// Hapus objek (dipanggil saat gambar diganti/dihapus di admin).
export async function deleteImage(key: string | null | undefined): Promise<void> {
  const cfg = config();
  if (!cfg || !key || /^https?:\/\//.test(key)) return;
  const res = await cfg.client.fetch(objectUrl(cfg.endpoint, key), { method: "DELETE" });
  if (!res.ok && res.status !== 404) throw new Error(`Hapus gambar gagal (HTTP ${res.status})`);
}
