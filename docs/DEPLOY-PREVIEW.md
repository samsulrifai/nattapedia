# Runbook: Preview Deployment (Vercel + Supabase)

Dokumen ini dikelola DevOps. Berisi prosedur, bukan nilai rahasia. Semua token dan key disimpan di Paperclip Secrets dan Vercel Environment Variables, tidak pernah di repo.

## 1. Kebijakan

- Hanya tier gratis: Vercel Hobby (preview) dan Supabase Free.
- Deploy production DILARANG tanpa persetujuan Fai melalui CEO. Lihat catatan risiko di `docs/TECHNICAL.md` bagian 6.1.
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
| `NEXT_PUBLIC_SUPABASE_URL` | Preview | Supabase > Project Settings > API | tidak |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Preview | Supabase > Project Settings > API | tidak (dibatasi RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Preview | Supabase > Project Settings > API | YA, server saja |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Preview | Cloudflare Turnstile (opsional) | tidak |
| `TURNSTILE_SECRET_KEY` | Preview | Cloudflare Turnstile (opsional) | YA, server saja |

Kredensial pengelolaan (bukan env aplikasi), disimpan di Paperclip Secrets:

| Nama secret | Fungsi |
| --- | --- |
| `NATTAPEDIA_VERCEL_TOKEN` | akses Vercel API untuk mengatur proyek dan env |
| `[NAMA SECRET SUPABASE]` | akses Supabase Management API / password database (belum dibuat) |

## 4. Setup awal (sekali)

1. Supabase: buat proyek Free, region terdekat (Singapore).
2. Jalankan `supabase/migrations/0001_initial_schema.sql` (SQL Editor atau `supabase db push`). Migrasi ini juga membuat bucket publik `portfolio` beserta kebijakan RLS-nya.
3. Auth: matikan sign-up publik (Authentication > Sign In / Providers > Allow new users to sign up = off).
4. Buat akun admin Fai secara manual, lalu masukkan `user_id`-nya ke tabel `admin_users`. Password tidak pernah ditulis di tugas atau repo.
5. Vercel: import repo `samsulrifai/nattapedia`, framework Next.js, isi env scope Preview sesuai tabel di atas.
6. Push branch uji untuk memicu preview pertama.

## 5. Verifikasi (kriteria selesai)

- [ ] URL preview terbuka (HTTP 200) untuk halaman publik.
- [ ] Koneksi database: halaman publik membaca data dari Supabase tanpa error; uji query dengan anon key.
- [ ] Upload storage: unggah file uji ke bucket `portfolio` sebagai admin, file dapat diakses lewat URL publik, lalu file uji dihapus.
- [ ] Anon tidak bisa menulis ke bucket `portfolio` (ditolak RLS).
- [ ] Tidak ada deployment production di dashboard Vercel.
- [ ] Billing Vercel dan Supabase tetap paket gratis.

## 6. Batasan tier gratis (dicek ulang saat setup)

- Vercel Hobby: penggunaan non-komersial; production untuk situs perusahaan butuh keputusan (lihat TECHNICAL.md 6.1).
- Supabase Free: proyek dapat dijeda bila tidak aktif; ada batas kapasitas DB dan storage. Backup berkala lewat export SQL.
