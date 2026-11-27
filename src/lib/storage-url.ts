import { env } from "@/lib/env";

// URL publik sebuah objek gambar di storage (Cloudflare R2, bucket publik).
// Aman dipakai di server maupun client. Yang disimpan di DB hanya key-nya,
// mis. "portfolio/2026/abc.webp". URL lengkap (http/https) dikembalikan apa adanya.
export function storageUrl(key: string | null | undefined): string | null {
  if (!key) return null;
  if (/^https?:\/\//.test(key)) return key;
  if (!env.storagePublicUrl) return null;
  return `${env.storagePublicUrl}/${key.replace(/^\/+/, "")}`;
}
