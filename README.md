# Nattapedia

Website company profile Nattapedia: landing page, layanan, portofolio, kontak (formulir minta penawaran), dan halaman admin untuk mengelola konten.

Stack: Next.js 16 (App Router, TypeScript) + Tailwind CSS 4, Neon Postgres + Drizzle ORM, Better Auth (login admin), Cloudflare R2 (gambar), dideploy ke Vercel. Detail lengkap ada di [docs/TECHNICAL.md](docs/TECHNICAL.md).

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

## Database dan admin

Skema ada di `src/lib/db/schema.ts`, migrasi SQL di `drizzle/`.

| Perintah | Fungsi |
| --- | --- |
| `npm run db:generate` | membuat file migrasi baru setelah skema diubah |
| `npm run db:migrate` | menjalankan migrasi ke database (`.env.local`) |
| `npm run db:studio` | melihat isi database (Drizzle Studio) |
| `npm run admin:create` | membuat akun admin atau reset password (interaktif) |

Pendaftaran publik ditutup. Akun admin hanya dibuat lewat `npm run admin:create`. Detail ada di [docs/TECHNICAL.md](docs/TECHNICAL.md).

## Aturan repo (publik)

- Jangan commit `.env*` (kecuali `.env.example` tanpa nilai), token, password, atau data internal.
- Jangan menambahkan data klien, testimoni, atau angka karangan. Konten asli diisi lewat admin. Placeholder diberi tanda `[CONTOH]` / `[PLACEHOLDER]`.
- Deploy production hanya dengan persetujuan pemilik.
