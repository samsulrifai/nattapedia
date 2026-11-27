# Nattapedia

Website company profile Nattapedia: landing page, layanan, portofolio, kontak (formulir minta penawaran), dan halaman admin untuk mengelola konten.

Stack: Next.js 16 (App Router, TypeScript) + Tailwind CSS 4, Supabase (Postgres, Storage, Auth), dideploy ke Vercel. Detail lengkap ada di [docs/TECHNICAL.md](docs/TECHNICAL.md).

## Menjalankan lokal

Prasyarat: Node.js 20.9 atau lebih baru (disarankan 22, lihat `.nvmrc`).

```bash
npm install
cp .env.example .env.local   # opsional untuk tampilan publik; wajib untuk admin dan formulir
npm run dev                  # http://localhost:3000
```

Tanpa `.env.local`, halaman publik tetap jalan dengan placeholder, dan area `/admin` terkunci.

## Skrip

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | server pengembangan |
| `npm run build` | build production |
| `npm run start` | menjalankan hasil build |
| `npm run lint` | ESLint |
| `npm run typecheck` | generate tipe route + pemeriksaan TypeScript |

## Database

Skema dan kebijakan RLS ada di `supabase/migrations/`. Jalankan lewat Supabase SQL Editor atau `supabase db push`. Akun admin dibuat manual di Supabase Dashboard, lalu `user_id`-nya dimasukkan ke tabel `admin_users`.

## Aturan repo (publik)

- Jangan commit `.env*` (kecuali `.env.example` tanpa nilai), token, password, atau data internal.
- Jangan menambahkan data klien, testimoni, atau angka karangan. Konten asli diisi lewat admin. Placeholder diberi tanda `[CONTOH]` / `[PLACEHOLDER]`.
- Deploy production hanya dengan persetujuan pemilik.
