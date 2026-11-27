# Nattapedia: Rencana Teknis (MVP)

Pemilik dokumen: CTO, PT. FAI MAKMUR. Status: final untuk MVP. Perubahan stack harus lewat CTO.

## 1. Stack final

| Lapisan | Pilihan | Alasan |
| --- | --- | --- |
| Framework | Next.js 16 (App Router, TypeScript, Cache Components aktif) | SEO-friendly (SSR/prerender), satu codebase untuk halaman publik dan admin |
| Styling | Tailwind CSS 4 | Cepat, konsisten, tanpa CSS mati |
| Database | Supabase Postgres (tier Free) | Postgres standar, Row Level Security, bisa pindah tanpa vendor lock-in |
| Storage gambar | Supabase Storage, bucket publik `portfolio` (tier Free) | Satu layanan dengan DB dan auth, kebijakan akses lewat RLS |
| Auth admin | Supabase Auth (email + password), pendaftaran publik dimatikan, peran admin lewat tabel `admin_users` | Tanpa password default di repo, akun dibuat manual oleh Fai |
| Anti-spam formulir | Honeypot + validasi server + batas panjang input; Cloudflare Turnstile (gratis) opsional | Dasar aman tanpa biaya |
| Hosting | Vercel (preview). Untuk production lihat catatan risiko 6.1 | Integrasi Next.js terbaik, preview per branch |
| Lint / type | ESLint (eslint-config-next), `tsc --noEmit` | Standar perusahaan |

Library: `@supabase/supabase-js`, `@supabase/ssr`, `server-only`. Tidak ada ORM. Query lewat supabase-js, dan skema dikelola lewat file SQL di `supabase/migrations/`.

## 2. Arsitektur singkat

- Halaman publik (`src/app/(public)/`) membaca data yang `is_published = true` memakai kunci anon. RLS menolak data draft.
- Admin (`src/app/admin/`) dijaga dua lapis:
  1. `src/proxy.ts`: mengalihkan ke `/admin/login` bila belum login (dan mengunci total jika Supabase belum dikonfigurasi).
  2. `src/app/admin/(dashboard)/layout.tsx`: memeriksa `is_admin()` (user harus ada di `admin_users`).
  Penulisan data dari admin memakai sesi user dan tetap divalidasi RLS (`is_admin()`).
- Formulir kontak: Server Action, lalu validasi + honeypot (+ Turnstile jika diaktifkan), lalu insert ke `leads` memakai service role (server saja). Publik tidak punya izin insert langsung ke tabel.
- Gambar: upload dari admin ke bucket `portfolio`. Yang disimpan di DB hanya path-nya. Ditampilkan dengan `next/image` (domain Supabase didaftarkan di `images.remotePatterns` oleh Web Developer saat URL proyek diketahui).
- SEO: `metadata` per halaman, `src/app/sitemap.ts`, `src/app/robots.ts` (`/admin` di-disallow), Open Graph dari `site_settings`.

## 3. Skema data

Sumber kebenaran: `supabase/migrations/0001_initial_schema.sql`. Tipe TypeScript: `src/types/database.ts`.

| Tabel | Isi | Akses publik | Akses admin |
| --- | --- | --- | --- |
| `services` | slug, title, summary, description, icon, sort_order, is_published | baca jika published | CRUD |
| `portfolio_projects` | slug, title, client_name (opsional), category, summary, problem, solution, tech_stack[], project_url, cover_image, is_featured, is_published, sort_order, completed_at | baca jika published | CRUD |
| `portfolio_images` | project_id, image_path, alt_text, sort_order | baca jika proyek published | CRUD |
| `testimonials` | author_name, author_role, company, quote, avatar_image, project_id, is_published | baca jika published | CRUD |
| `site_settings` | satu baris (id=1): site_name, hero_title/subtitle, about_content, process_content, contact_email/phone, whatsapp_number, address, social_links (jsonb), seo_title, seo_description, og_image | baca | update |
| `leads` | name, email/phone (minimal salah satu), company, service_id, budget_range, message, source_page, status (`baru`/`dihubungi`/`negosiasi`/`deal`/`batal`), admin_notes | tidak ada | baca, update, hapus |
| `admin_users` | user_id (ref auth.users) | tidak ada | baca |

Aturan konten:
- Nilai default `site_settings` bertanda `[CONTOH]`. Isi asli diisi Fai lewat admin.
- Testimoni dan portofolio hanya tampil jika `is_published = true`. Tidak ada data seed klien atau testimoni karangan di repo.
- Semua tabel konten punya `created_at`/`updated_at` (trigger otomatis).

## 4. Struktur folder

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
      (dashboard)/       Semua halaman admin, dijaga is_admin()
        leads/
    layout.tsx           Root layout, metadata dasar, lang="id"
    sitemap.ts, robots.ts
  components/            Komponen UI bersama
  lib/
    env.ts               Pembacaan env + flag isSupabaseConfigured
    supabase/            client.ts (browser), server.ts (RSC/action), admin.ts (service role, server-only)
  types/database.ts      Tipe skema
  proxy.ts               Proteksi /admin (pengganti middleware di Next 16)
supabase/migrations/     Skema SQL + RLS + bucket storage
docs/                    Dokumen teknis
```

Konvensi: route berbahasa Indonesia, kode dan nama tabel berbahasa Inggris. Komponen PascalCase. Server Actions diletakkan di `actions.ts` di dalam folder route terkait.

## 5. Variabel lingkungan

Lihat `.env.example` (tanpa nilai). Nilai asli disimpan di Vercel Environment Variables dan Paperclip Secrets, tidak pernah di repo.

| Variabel | Sisi | Keterangan |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | publik | URL kanonik situs |
| `NEXT_PUBLIC_SUPABASE_URL` | publik | URL proyek Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | publik | aman dipublikasikan, dibatasi RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | server | RAHASIA, hanya insert leads |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | publik / server | opsional, anti-spam |

## 6. Risiko dan keputusan yang perlu persetujuan

### 6.1 Ketentuan Vercel Hobby (perlu keputusan Fai sebelum production)
Paket gratis Vercel (Hobby) dibatasi untuk penggunaan pribadi non-komersial. Website perusahaan Nattapedia bersifat komersial, sehingga production di Vercel secara resmi butuh paket Pro (berbayar per anggota per bulan, harga terkini dicek DevOps). Opsi:
- A. Vercel Pro (berbayar, perlu persetujuan Fai).
- B. Hosting gratis yang mengizinkan penggunaan komersial (mis. Netlify Free atau Cloudflare Workers via OpenNext), dengan sedikit konfigurasi tambahan.
Preview selama pengembangan tetap di Vercel. Keputusan dibutuhkan sebelum deploy production (5 Des).

### 6.2 Batasan Supabase Free
Proyek Free bisa dijeda otomatis jika tidak aktif dalam periode tertentu, dan ada batas kapasitas DB/storage. Untuk company profile dengan trafik rutin, ini cukup. DevOps memverifikasi batas terkini dan menyiapkan backup (export SQL berkala).

## 7. Pembagian kerja berikutnya

- DevOps: buat proyek Supabase (Free), jalankan migrasi, matikan sign-up publik, buat akun admin Fai + baris `admin_users`, set env di Vercel preview, verifikasi batas tier gratis.
- UI/UX Designer: sitemap/wireframe mengikuti route di bagian 4, copy bertanda `[CONTOH]`.
- Web Developer: ganti `PagePlaceholder` dengan data Supabase, form login, CRUD admin, Server Action leads + anti-spam.
- QA: checklist responsif, SEO, aksesibilitas dasar, keamanan admin (akses tanpa login, user non-admin), formulir.
