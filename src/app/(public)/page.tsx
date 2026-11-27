import Link from "next/link";

// Beranda / landing page. Placeholder sampai desain dan data dari admin tersedia.
export default function HomePage() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20">
      <p className="text-sm uppercase tracking-wide text-neutral-500">[CONTOH]</p>
      <h1 className="mt-2 text-4xl font-bold sm:text-5xl">Judul utama beranda</h1>
      <p className="mt-4 max-w-2xl text-lg text-neutral-600">
        Subjudul beranda. Teks asli diisi Fai lewat halaman admin (pengaturan situs).
      </p>
      <Link
        href="/kontak"
        className="mt-8 inline-block rounded-md bg-neutral-900 px-5 py-3 text-white hover:bg-neutral-700"
      >
        Konsultasi / Minta Penawaran
      </Link>
    </section>
  );
}
