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

## Panduan pemakaian admin

Buka `/admin` lalu masuk dengan email dan password akun admin. Setelah salah memasukkan password 5 kali dalam 1 menit, login dikunci sementara selama 1 menit. Gunakan tombol **Keluar** di kanan atas setelah selesai.

| Menu | Fungsi |
| --- | --- |
| Dasbor | Ringkasan jumlah lead baru, proyek, layanan, testimoni, dan 5 lead terbaru |
| Leads | Daftar permintaan penawaran dari formulir Kontak. Klik nama untuk melihat detail, membuka WhatsApp, mengubah status (Baru, Dihubungi, Negosiasi, Deal, Batal), dan menulis catatan internal |
| Portofolio | Tambah, ubah, atau hapus proyek beserta gambar sampul. Galeri gambar ditambahkan di halaman ubah proyek setelah proyek disimpan (satu gambar per unggahan) |
| Layanan | Tambah, ubah, atau hapus layanan beserta ikonnya |
| Testimoni | Tambah, ubah, atau hapus testimoni. Isi hanya dengan testimoni asli yang sudah diizinkan klien |
| Teks Halaman | Judul dan subjudul Beranda, bagian Proses Kerja, dan isi Tentang Kami |
| Kontak | Nomor WhatsApp, email, telepon, alamat, dan tautan media sosial |
| SEO | Nama situs, judul dan deskripsi untuk Google, serta gambar saat tautan dibagikan |

Catatan:

- Konten baru baru tampil di situs jika kotak **Tayangkan di situs** dicentang. Tanpa centang, konten disimpan sebagai draf.
- Perubahan langsung tampil di situs setelah tombol Simpan ditekan.
- Gambar: JPG, PNG, WEBP, atau AVIF, maksimal 4 MB. Gambar lama otomatis dihapus dari penyimpanan saat diganti atau dihapus.
- Teks bertanda `[CONTOH]` adalah placeholder dan perlu diganti dengan isi asli.
- Nomor WhatsApp boleh ditulis `0812...`, `+62812...`, atau `62812...`; sistem menyimpannya sebagai `62812...`.

Untuk developer: setiap Server Action admin (`src/app/admin/**/actions.ts`, `settings-actions.ts`) wajib diawali `await requireAdmin();`, memvalidasi input di server (`src/lib/admin/validate.ts`), lalu memanggil `updateTag()` dengan tag dari `src/lib/cache-tags.ts`.

## Aturan repo (publik)

- Jangan commit `.env*` (kecuali `.env.example` tanpa nilai), token, password, atau data internal.
- Jangan menambahkan data klien, testimoni, atau angka karangan. Konten asli diisi lewat admin. Placeholder diberi tanda `[CONTOH]` / `[PLACEHOLDER]`.
- Deploy production hanya dengan persetujuan pemilik.
