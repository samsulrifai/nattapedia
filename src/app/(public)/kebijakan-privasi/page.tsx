import type { Metadata } from "next";
import { container } from "@/components/ui/styles";

// Teks kebijakan privasi belum tersedia (wajib dari Fai). Halaman tidak diindeks
// sampai isi asli dimasukkan dan ditinjau.
export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description: "Cara Nattapedia mengelola data pribadi yang Anda kirimkan.",
  robots: { index: false, follow: true },
};

const SECTIONS = [
  "Data yang kami kumpulkan",
  "Tujuan penggunaan data",
  "Penyimpanan dan keamanan data",
  "Pembagian data kepada pihak lain",
  "Hak Anda atas data pribadi",
  "Cara menghubungi kami",
];

export default function KebijakanPrivasiPage() {
  return (
    <article className={`${container} py-12 lg:py-16`}>
      <div className="max-w-prose">
        <h1 className="font-heading text-[30px] leading-tight font-extrabold text-ink-900 lg:text-[42px]">
          Kebijakan Privasi
        </h1>
        <p className="mt-3 text-sm text-ink-500">Terakhir diperbarui: [DIISI FAI: tanggal]</p>
        <p className="mt-6 rounded-[var(--radius-control)] border border-warning-700 bg-white p-4 text-warning-700">
          [PLACEHOLDER] Teks kebijakan privasi belum tersedia. Isi wajib dari Fai dan sebaiknya ditinjau pihak yang
          memahami UU Pelindungan Data Pribadi sebelum website dipublikasikan.
        </p>
        <div className="mt-8 space-y-8">
          {SECTIONS.map((s) => (
            <section key={s}>
              <h2 className="font-heading text-xl font-bold text-ink-900">{s}</h2>
              <p className="mt-2 text-ink-600">[DIISI FAI]</p>
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}
