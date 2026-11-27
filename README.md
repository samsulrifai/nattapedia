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

## Halaman publik

| Route | Isi | Sumber data |
| --- | --- | --- |
| `/` | Hero, layanan (maks 3), portofolio unggulan (maks 3), proses kerja, testimoni (hanya jika ada yang tayang), CTA | `site_settings`, `services`, `portfolio_projects`, `testimonials` |
| `/layanan` | Daftar layanan + cakupan, anchor `#slug` | `services` |
| `/portofolio` | Grid proyek, filter `?kategori=` (jika > 1 kategori), muat lebih banyak (> 12) | `portfolio_projects` |
| `/portofolio/[slug]` | Detail proyek, galeri + lightbox, navigasi proyek | `portfolio_projects`, `portfolio_images` |
| `/tentang` | Tentang Kami + Proses Kerja (`#proses-kerja`) | `site_settings` |
| `/kontak` | Formulir minta penawaran (Server Action, insert ke tabel `leads`) + WhatsApp. `?layanan=slug` memilih layanan otomatis | `services`, `site_settings` |
| `/kontak/terima-kasih`, `/kebijakan-privasi` | Halaman statis, `noindex` | - |

Semua query publik ada di `src/lib/content.ts` dan selalu memfilter `is_published = true`. SEO: metadata per halaman, `sitemap.xml` (termasuk detail portofolio), `robots.txt`, gambar Open Graph default (`src/app/opengraph-image.tsx`, diganti `site_settings.og_image` jika diisi).

### Format isi teks dari admin

- `site_settings.about_content`: paragraf dipisah baris kosong. Paragraf pertama menjadi lead halaman Tentang.
- `site_settings.process_content`: satu langkah per baris, format `Judul: deskripsi`. Selama masih teks default `[CONTOH]`, halaman menampilkan langkah contoh bertanda `[CONTOH]`.
- `services.description`: paragraf biasa; baris yang diawali `- ` menjadi poin "Cakupan".
- `services.icon`: salah satu nama ikon di `src/components/icons.tsx` (`Globe`, `LayoutDashboard`, `Smartphone`, ...).
- Proyek dikaitkan ke layanan bila `portfolio_projects.category` sama dengan judul/slug layanan.

### Cache konten

Data publik dibaca dalam scope `use cache` (profil `hours`) dengan tag di `src/lib/cache-tags.ts`. Setelah admin menyimpan perubahan, panggil `updateTag()` / `revalidateTag()` dengan tag terkait agar halaman langsung diperbarui.

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
