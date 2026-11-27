import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";

// Sesi admin saat ini, atau null. Pendaftaran publik ditutup, jadi setiap user
// yang berhasil login adalah admin.
export async function getAdminSession() {
  const auth = getAuth();
  if (!auth) return null;
  return auth.api.getSession({ headers: await headers() });
}

// WAJIB dipanggil di awal setiap Server Action / Route Handler admin
// (create/update/delete konten, upload gambar, ubah status leads).
// Proxy hanya pemeriksaan cepat berbasis cookie, bukan otorisasi.
export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}
