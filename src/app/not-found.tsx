import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { btn, textLink } from "@/components/ui/styles";

export const metadata: Metadata = { title: "Halaman tidak ditemukan", robots: { index: false } };

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-5 py-20 text-center">
      <Link href="/">
        <Logo />
      </Link>
      <h1 className="mt-10 font-heading text-[30px] leading-tight font-extrabold text-ink-900 lg:text-[42px]">
        Halaman tidak ditemukan
      </h1>
      <p className="mt-4 max-w-md text-lg text-ink-600">
        Halaman yang Anda cari mungkin sudah dipindahkan atau alamatnya salah.
      </p>
      <Link href="/" className={`${btn.primary} mt-8`}>
        Kembali ke Beranda
      </Link>
      <div className="mt-6 flex gap-6">
        <Link href="/portofolio" className={textLink}>
          Lihat Portofolio
        </Link>
        <Link href="/kontak" className={textLink}>
          Hubungi Kami
        </Link>
      </div>
    </main>
  );
}
