# Nattapedia: Rencana Teknis (MVP)

Pemilik dokumen: CTO, PT. FAI MAKMUR. Status: final untuk MVP, revisi 2 (27 Nov 2026): database pindah dari Supabase ke Neon atas keputusan Fai. Perubahan stack harus lewat CTO.

## 1. Stack final

| Lapisan | Pilihan | Alasan |
| --- | --- | --- |
| Framework | Next.js 16 (App Router, TypeScript, Cache Components aktif) | SEO-friendly (SSR/prerender), satu codebase untuk halaman publik dan admin |
| Styling | Tailwind CSS 4 | Cepat, konsisten, tanpa CSS mati |
| Database | Neon Postgres (paket Free) | Keputusan Fai. Postgres standar, tanpa kartu kredit, scale-to-zero |
| Driver / ORM | `@neondatabase/serverless` (HTTP) + Drizzle ORM | Ringan untuk serverless, query bertipe, skema sebagai kode |
| Migrasi skema | drizzle-kit, file SQL di `drizzle/` | Migrasi tercatat di repo dan bisa direview |
| Auth admin | Better Auth (open source, MIT), email + password, data sesi di Neon | Gratis tanpa batas pemakaian, data di DB sendiri, pendaftaran publik bisa ditutup |
| Storage gambar | Cloudflare R2 (tier gratis, API kompatibel S3) lewat `aws4fetch` | Gratis 10 GB, egress gratis, boleh komersial, mudah dipindah |
| Anti-spam formulir | Honeypot + validasi server + batas panjang input; Cloudflare Turnstile (gratis) opsional | Dasar aman tanpa biaya |
| Hosting | Vercel (preview). Untuk production lihat catatan risiko 6.1 | Integrasi Next.js terbaik, preview per branch |
| Lint / type | ESLint (eslint-config-next), `tsc --noEmit` | Standar perusahaan |

Library: `drizzle-orm`, `@neondatabase/serverless`, `better-auth`, `aws4fetch`, `server-only`. Dev: `drizzle-kit`, `tsx`. Supabase tidak dipakai lagi.

## 2. Arsitektur singkat

- Tidak ada Row Level Security. Neon hanya database, jadi **otorisasi sepenuhnya di kode server**. Dua aturan wajib:
  1. Setiap query halaman publik memfilter `is_published = true` (proyek, layanan, testimoni, gambar proyek yang induknya published).
  2. Setiap Server Action / Route Handler admin memanggil `requireAdmin()` (`src/lib/auth/session.ts`) di baris pertama, sebelum membaca input.
  Akses DB hanya dari server (`src/lib/db/index.ts` bertanda `server-only`). `DATABASE_URL` tidak pernah berawalan `NEXT_PUBLIC_`.
- Admin (`src/app/admin/`) dijaga tiga lapis:
  1. `src/proxy.ts`: mengalihkan ke `/admin/login` bila cookie sesi tidak ada (cek cepat, bukan otorisasi).
  2. `src/app/admin/(dashboard)/layout.tsx`: validasi sesi ke DB lewat `getAdminSession()`.
  3. `requireAdmin()` di setiap aksi tulis.
- Auth: Better Auth, endpoint di `/api/auth/*` (`src/app/api/auth/[...all]/route.ts`). Konfigurasi di `src/lib/auth/index.ts`: `disableSignUp: true`, password minimal 12 karakter, sesi 7 hari, rate limit login 5 kali per menit per IP (disimpan di DB). Semua user di tabel `user` adalah admin. User hanya bisa dibuat lewat `npm run admin:create`. Form login memakai `authClient.signIn.email()` dari `src/lib/auth/client.ts`, dan logout memakai `authClient.signOut()`.
- Formulir kontak: Server Action, lalu validasi + honeypot (+ Turnstile jika diaktifkan), lalu `db.insert(leads)`. Constraint DB tetap menjaga panjang input dan wajib email/telepon.
- Gambar: admin mengunggah lewat Server Action, yang memanggil `requireAdmin()` lalu `uploadImage(file)` (`src/lib/storage.ts`). Validasi: JPG/PNG/WEBP/AVIF, maksimal 4 MB, nama file acak. Hasilnya berupa key (mis. `portfolio/2026/<uuid>.webp`) yang disimpan di DB. Tampilkan dengan `storageUrl(key)` (`src/lib/storage-url.ts`) dan `next/image`. Host gambar otomatis didaftarkan di `images.remotePatterns` dari `NEXT_PUBLIC_STORAGE_PUBLIC_URL`. Saat gambar diganti atau dihapus, panggil `deleteImage(oldKey)`.
- Data publik dibaca di Server Component dalam scope `"use cache"` (Cache Components). Setelah admin mengubah konten, panggil `revalidateTag`/`updateTag` sesuai tag yang dipakai halaman publik.
- SEO: `metadata` per halaman, `src/app/sitemap.ts`, `src/app/robots.ts` (`/admin` di-disallow), Open Graph dari `site_settings`.

### Contoh pola kode

```ts
// Baca publik
import { and, asc, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
const db = getDb(); // null jika DATABASE_URL belum diisi -> tampilkan placeholder
const rows = db
  ? await db.select().from(schema.services)
      .where(eq(schema.services.is_published, true))
      .orderBy(asc(schema.services.sort_order))
  : [];

// Server Action admin
"use server";
import { requireAdmin } from "@/lib/auth/session";
export async function updateService(formData: FormData) {
  await requireAdmin();
  // validasi formData, lalu db.update(schema.services)...
}
```

## 3. Skema data

Sumber kebenaran: `src/lib/db/schema.ts`. Migrasi SQL hasil generate: `drizzle/`. Tipe TypeScript diturunkan otomatis di `src/types/database.ts` (`Service`, `PortfolioProject`, `Lead`, dst.).

Properti tabel konten memakai snake_case (sama dengan nama kolom), misalnya `project.cover_image`.

| Tabel | Isi | Akses publik (difilter di kode) | Akses admin |
| --- | --- | --- | --- |
| `services` | slug, title, summary, description, icon, sort_order, is_published | baca jika published | CRUD |
| `portfolio_projects` | slug, title, client_name (opsional), category, summary, problem, solution, tech_stack[], project_url, cover_image, is_featured, is_published, sort_order, completed_at | baca jika published | CRUD |
| `portfolio_images` | project_id, image_path, alt_text, sort_order | baca jika proyek published | CRUD |
| `testimonials` | author_name, author_role, company, quote, avatar_image, project_id, is_published | baca jika published | CRUD |
| `site_settings` | satu baris (id=1, dibuat migrasi): site_name, hero_title/subtitle, about_content, process_content, contact_email/phone, whatsapp_number, address, social_links (jsonb), seo_title, seo_description, og_image | baca | update |
| `leads` | name, email/phone (minimal salah satu), company, service_id, budget_range, message, source_page, status (`baru`/`dihubungi`/`negosiasi`/`deal`/`batal`), admin_notes | insert lewat Server Action formulir saja | baca, update, hapus |
| `user`, `account`, `session`, `verification`, `rate_limit` | tabel Better Auth (hash password di `account.password`) | tidak ada | dikelola Better Auth |

Aturan konten:
- Nilai default `site_settings` bertanda `[CONTOH]`. Isi asli diisi Fai lewat admin.
- Testimoni dan portofolio hanya tampil jika `is_published = true`. Tidak ada data seed klien atau testimoni karangan di repo.
- `updated_at` diperbarui otomatis oleh Drizzle (`$onUpdate`) saat update lewat aplikasi.

## 4. Migrasi skema

```bash
# setelah mengubah src/lib/db/schema.ts
npm run db:generate          # membuat file SQL baru di drizzle/ (commit file ini)
npm run db:migrate           # menjalankan migrasi ke DATABASE_URL_UNPOOLED (atau DATABASE_URL)
```

- Migrasi awal: `drizzle/0000_initial_schema.sql` (semua tabel konten + auth + baris `site_settings`). Sudah diuji di Postgres lokal (PGlite).
- Jangan mengedit file migrasi yang sudah dijalankan. Buat migrasi baru.
- Pakai branch Neon terpisah untuk preview/uji bila perlu. Branch `main` Neon untuk data asli.

## 5. Akun admin pertama

Dijalankan sekali oleh DevOps (atau Fai sendiri) dari komputer yang punya `.env.local` berisi `DATABASE_URL`:

```bash
npm run admin:create
```

Script menanyakan email, nama, dan password (minimal 12 karakter, tidak ditampilkan di layar). Password di-hash (scrypt, format Better Auth) sebelum disimpan. Menjalankan ulang dengan email yang sama berarti reset password. Password tidak pernah ditulis di repo, komentar tugas, atau dokumen. Serahkan ke Fai langsung, atau Fai yang mengetiknya sendiri saat script dijalankan.

Login di `/admin/login`. Tidak ada halaman daftar publik, dan endpoint sign-up menolak dengan `EMAIL_PASSWORD_SIGN_UP_DISABLED`.

## 6. Struktur folder

```
src/
  app/
    (public)/            Halaman publik + layout header/footer
      page.tsx           Beranda / landing
      layanan/
      portofolio/        Daftar + [slug] detail
      tentang/
      kontak/
    admin/
      login/             Login admin (di luar gerbang dashboard)
      (dashboard)/       Semua halaman admin, dijaga getAdminSession()
        leads/
    api/auth/[...all]/   Endpoint Better Auth
    layout.tsx           Root layout, metadata dasar, lang="id"
    sitemap.ts, robots.ts
  components/            Komponen UI bersama
  lib/
    env.ts               Pembacaan env + flag isDatabaseConfigured / isAuthConfigured
    db/schema.ts         Skema Drizzle (sumber kebenaran)
    db/index.ts          getDb() (server-only)
    auth/index.ts        Konfigurasi Better Auth (server-only)
    auth/session.ts      getAdminSession(), requireAdmin()
    auth/client.ts       authClient untuk komponen client
    storage.ts           uploadImage(), deleteImage() ke R2 (server-only)
    storage-url.ts       storageUrl(key) (server + client)
  types/database.ts      Tipe baris (diturunkan dari skema)
  proxy.ts               Cek cepat cookie sesi untuk /admin
drizzle/                 File migrasi SQL
drizzle.config.ts        Konfigurasi drizzle-kit
scripts/create-admin.ts  Membuat / reset akun admin
docs/                    Dokumen teknis
```

Konvensi: route berbahasa Indonesia, kode dan nama tabel berbahasa Inggris. Komponen PascalCase. Server Actions diletakkan di `actions.ts` di dalam folder route terkait.

## 7. Variabel lingkungan

Lihat `.env.example` (tanpa nilai). Nilai asli disimpan di Vercel Environment Variables dan Paperclip Secrets, tidak pernah di repo.

| Variabel | Sisi | Keterangan |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | publik | URL kanonik situs |
| `DATABASE_URL` | server, RAHASIA | Neon, connection string pooled |
| `DATABASE_URL_UNPOOLED` | server, RAHASIA | Neon, koneksi langsung (migrasi, script admin) |
| `BETTER_AUTH_SECRET` | server, RAHASIA | acak minimal 32 karakter (`openssl rand -base64 32`), beda per environment |
| `BETTER_AUTH_URL` | server | URL dasar auth. Kosongkan di preview (otomatis dari `VERCEL_URL`), isi domain final di production |
| `R2_ACCOUNT_ID`, `R2_BUCKET` | server | identitas akun dan bucket R2 |
| `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` | server, RAHASIA | API token R2 dengan izin Object Read & Write, terbatas pada bucket ini |
| `NEXT_PUBLIC_STORAGE_PUBLIC_URL` | publik | URL publik bucket (r2.dev atau domain kustom) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | publik / server | opsional, anti-spam |

Tanpa `DATABASE_URL`, `npm run dev` dan `npm run build` tetap jalan: halaman publik menampilkan placeholder dan admin terkunci.

## 8. Risiko dan keputusan yang perlu persetujuan

### 8.1 Ketentuan Vercel Hobby (perlu keputusan Fai sebelum production)
Paket gratis Vercel (Hobby) dibatasi untuk penggunaan pribadi non-komersial. Website perusahaan Nattapedia bersifat komersial, sehingga production di Vercel secara resmi butuh paket Pro (berbayar per anggota per bulan, harga terkini dicek DevOps). Opsi:
- A. Vercel Pro (berbayar, perlu persetujuan Fai).
- B. Hosting gratis yang mengizinkan penggunaan komersial (mis. Netlify Free atau Cloudflare Workers via OpenNext), dengan sedikit konfigurasi tambahan.
Preview selama pengembangan tetap di Vercel. Keputusan dibutuhkan sebelum deploy production. Neon dan R2 bisa dipakai dari hosting mana pun, jadi pilihan ini tidak mengubah lapisan data.

### 8.2 Batasan Neon Free
Per FAQ Neon (dicek 27 Nov 2026): storage 1 GB per proyek, 100 CU-jam compute per proyek per bulan, transfer publik 5 GB per bulan, compute tidur setelah 5 menit tidak aktif (request pertama setelah tidur sedikit lebih lambat). Jika storage penuh, penulisan gagal, dan tidak ada tagihan otomatis. Untuk company profile, kapasitas ini cukup karena gambar tidak disimpan di DB. DevOps memverifikasi ulang batas ini dan ketentuan penggunaan komersial di halaman Neon saat setup, lalu menyiapkan backup berkala (`pg_dump`).

### 8.3 Cloudflare R2
Tier gratis: 10 GB storage per bulan, 1 juta operasi tulis dan 10 juta operasi baca per bulan, egress gratis. Halaman produk Cloudflare menyebut tidak perlu kartu kredit, tetapi ada laporan bahwa Cloudflare bisa meminta metode pembayaran saat mengaktifkan R2. **Jika Cloudflare meminta kartu, berhenti dan minta persetujuan Fai lewat CEO sebelum mengisinya.** Alternatif tanpa kartu bila tidak disetujui: Vercel Blob (ikut ketentuan Vercel Hobby, lihat 8.1). Mengganti penyedia cukup di `src/lib/storage.ts`.

## 9. Pembagian kerja berikutnya

- DevOps (PTF-24): buat proyek Neon (Free, region Singapore), jalankan `npm run db:migrate`, buat bucket R2 publik + API token terbatas, buat akun admin Fai lewat `npm run admin:create`, isi env scope Preview di Vercel, verifikasi batas tier gratis.
- UI/UX Designer: sitemap/wireframe mengikuti route di bagian 6, copy bertanda `[CONTOH]`.
- Web Developer (PTF-25): halaman publik membaca data lewat `getDb()` + filter `is_published`, gambar lewat `storageUrl()`.
- Web Developer (PTF-26): form login (`authClient`), CRUD admin dengan `requireAdmin()` + `uploadImage()`, Server Action leads + anti-spam, daftar leads.
- QA: checklist responsif, SEO, aksesibilitas dasar, keamanan admin (akses tanpa login, panggilan Server Action tanpa sesi, sign-up publik ditolak, brute force login ditolak), formulir.
