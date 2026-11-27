# Runbook: Preview Deployment (Vercel + Neon + Cloudflare R2)

Dokumen ini dikelola DevOps. Berisi prosedur, bukan nilai rahasia. Semua token dan key disimpan di Paperclip Secrets dan Vercel Environment Variables, tidak pernah di repo.

Revisi 27 Nov 2026 (CTO): Supabase diganti Neon (database), Better Auth (login admin), dan Cloudflare R2 (gambar). Lihat `docs/TECHNICAL.md`.

## 1. Kebijakan

- Hanya tier gratis: Vercel Hobby (preview), Neon Free, Cloudflare R2 free tier.
- Deploy production DILARANG tanpa persetujuan Fai melalui CEO. Lihat catatan risiko di `docs/TECHNICAL.md` bagian 8.1.
- Jika ada layanan yang meminta kartu kredit atau upgrade berbayar, berhenti dan laporkan. Jangan diisi tanpa persetujuan Fai.
- `vercel.json` menonaktifkan deployment otomatis dari branch `main` (`git.deploymentEnabled.main = false`), sehingga push ke `main` tidak menghasilkan deployment production. Preview dibuat untuk setiap push ke branch selain `main` dan untuk setiap pull request.
- Mengubah pengaturan tersebut hanya dilakukan saat production sudah disetujui.

## 2. Alur kerja preview

1. Buat branch dari `main` (mis. `feat/nama-fitur`).
2. Push branch ke GitHub. Vercel membuat preview deployment otomatis dan menautkan URL-nya di pull request.
3. QA menguji di URL preview. Merge ke `main` setelah lolos review.

## 3. Environment variable

Nilai diatur di Vercel Project Settings > Environment Variables, scope **Preview** (dan Development bila perlu). Scope **Production** belum diisi sampai production disetujui.

| Variabel | Scope Vercel | Sumber nilai | Rahasia |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Preview | URL preview / domain final | tidak |
| `DATABASE_URL` | Preview | Neon Console > Connect (pooled) | YA |
| `DATABASE_URL_UNPOOLED` | Preview | Neon Console > Connect (tanpa pooling) | YA |
| `BETTER_AUTH_SECRET` | Preview | `openssl rand -base64 32`, beda per environment | YA |
| `BETTER_AUTH_URL` | (kosongkan di Preview) | otomatis dari `VERCEL_URL`; diisi domain final saat production | tidak |
| `R2_ACCOUNT_ID` | Preview | Cloudflare dashboard > R2 | tidak |
| `R2_BUCKET` | Preview | nama bucket, mis. `nattapedia-media` | tidak |
| `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` | Preview | R2 > Manage API tokens (Object Read & Write, hanya bucket ini) | YA |
| `NEXT_PUBLIC_STORAGE_PUBLIC_URL` | Preview | URL publik bucket (r2.dev atau domain kustom) | tidak |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Preview | Cloudflare Turnstile (opsional) | tidak |
| `TURNSTILE_SECRET_KEY` | Preview | Cloudflare Turnstile (opsional) | YA |

Integrasi Neon di Vercel Marketplace boleh dipakai untuk mengisi `DATABASE_URL` otomatis, asalkan tetap paket Free.

Kredensial pengelolaan (bukan env aplikasi), disimpan di Paperclip Secrets:

| Nama secret | Fungsi |
| --- | --- |
| `NATTAPEDIA_VERCEL_TOKEN` | akses Vercel API untuk mengatur proyek dan env |
| `NATTAPEDIA_NEON_API_KEY` | akses Neon API (buat proyek/branch). Opsional bila Fai membuat proyek sendiri dan cukup memberikan `NATTAPEDIA_DATABASE_URL` |
| `NATTAPEDIA_DATABASE_URL` | connection string Neon untuk migrasi dan `admin:create` |
| `NATTAPEDIA_CLOUDFLARE_API_TOKEN` | membuat bucket R2 dan API token. Opsional bila Fai membuat bucket sendiri dan memberikan `NATTAPEDIA_R2_*` |
| `NATTAPEDIA_R2_ACCOUNT_ID`, `NATTAPEDIA_R2_ACCESS_KEY_ID`, `NATTAPEDIA_R2_SECRET_ACCESS_KEY` | kredensial bucket untuk env aplikasi |
| `NATTAPEDIA_BETTER_AUTH_SECRET` | secret auth untuk Preview (boleh dibuat DevOps sendiri lalu disimpan di sini) |

## 4. Setup awal (sekali)

1. Neon: buat proyek Free, region AWS Asia Pacific (Singapore), database `neondb`. Ambil connection string pooled dan unpooled.
2. Migrasi: dari lokal dengan `.env.local` berisi `DATABASE_URL`/`DATABASE_URL_UNPOOLED`, jalankan `npm install` lalu `npm run db:migrate`. Cek bahwa tabel `site_settings` berisi satu baris.
3. Akun admin: `npm run admin:create`. Fai mengetik password sendiri atau password diserahkan langsung ke Fai. Password tidak pernah ditulis di tugas atau repo.
4. Cloudflare R2: buat bucket (mis. `nattapedia-media`), aktifkan akses publik (r2.dev atau domain kustom), buat API token dengan izin Object Read & Write yang dibatasi ke bucket itu saja.
5. Vercel: import repo `samsulrifai/nattapedia`, framework Next.js, isi env scope Preview sesuai tabel di atas.
6. Push branch uji untuk memicu preview pertama.

## 5. Verifikasi (kriteria selesai)

- [ ] URL preview terbuka (HTTP 200) untuk halaman publik.
- [ ] Koneksi database: halaman publik membaca `site_settings` dari Neon tanpa error.
- [ ] Login admin di `/admin/login` berhasil dengan akun dari `admin:create`, dan `/admin` tanpa login dialihkan ke login.
- [ ] `POST /api/auth/sign-up/email` ditolak (`EMAIL_PASSWORD_SIGN_UP_DISABLED`).
- [ ] Upload storage: unggah file uji ke bucket R2, file dapat diakses lewat `NEXT_PUBLIC_STORAGE_PUBLIC_URL`, lalu file uji dihapus.
- [ ] Bucket tidak bisa ditulis tanpa kredensial (PUT anonim ke URL publik ditolak).
- [ ] Tidak ada deployment production di dashboard Vercel.
- [ ] Billing Vercel, Neon, dan Cloudflare tetap paket gratis.

## 6. Batasan tier gratis (dicek ulang saat setup)

- Vercel Hobby: penggunaan non-komersial; production untuk situs perusahaan butuh keputusan (lihat TECHNICAL.md 8.1).
- Neon Free: storage 1 GB per proyek, 100 CU-jam per bulan, compute tidur setelah 5 menit tidak aktif. Backup berkala lewat `pg_dump` ke lokasi aman (bukan repo).
- Cloudflare R2: 10 GB storage, 1 juta operasi tulis dan 10 juta operasi baca per bulan, egress gratis. Jika diminta kartu, lihat TECHNICAL.md 8.3.
