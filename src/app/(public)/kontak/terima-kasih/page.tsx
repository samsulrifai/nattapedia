import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons";
import { btn, container, textLink } from "@/components/ui/styles";
import { getSiteSettings } from "@/lib/content";
import { whatsappLink } from "@/lib/text";

export const metadata: Metadata = {
  title: "Terima kasih",
  robots: { index: false, follow: false },
};

export default async function TerimaKasihPage() {
  const settings = await getSiteSettings();
  const wa = whatsappLink(settings.whatsapp_number);
  return (
    <section className={`${container} flex flex-col items-center py-20 text-center lg:py-28`}>
      <span className="inline-flex size-16 items-center justify-center rounded-full bg-success-700 text-white">
        <Check aria-hidden="true" className="size-8" strokeWidth={2.5} />
      </span>
      <h1 className="mt-6 max-w-2xl font-heading text-[30px] leading-tight font-extrabold text-ink-900 lg:text-[42px]">
        Terima kasih, permintaan Anda sudah kami terima
      </h1>
      <p className="mt-4 max-w-xl text-lg text-ink-600">
        Kami akan menghubungi Anda melalui WhatsApp atau email yang Anda cantumkan.
      </p>
      <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Link href="/" className={btn.primary}>
          Kembali ke Beranda
        </Link>
        <Link href="/portofolio" className={btn.secondary}>
          Lihat Portofolio
        </Link>
      </div>
      {wa && (
        <a href={wa} target="_blank" rel="noopener noreferrer" className={`${textLink} mt-6`}>
          <WhatsAppIcon aria-hidden="true" className="size-4" />
          Butuh cepat? Chat via WhatsApp
          <ArrowRight aria-hidden="true" className="size-4" />
        </a>
      )}
    </section>
  );
}
