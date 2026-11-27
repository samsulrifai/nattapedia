import Link from "next/link";
import { WhatsAppIcon } from "./icons";
import { btn, container } from "./ui/styles";

export function CtaBand({
  title,
  text,
  whatsappHref,
}: {
  title: string;
  text: string;
  whatsappHref: string | null;
}) {
  return (
    <section className="bg-brand-600" aria-labelledby="cta-band-title">
      <div className={`${container} flex flex-col gap-8 py-14 lg:flex-row lg:items-center lg:justify-between lg:py-16`}>
        <div className="max-w-2xl">
          <h2 id="cta-band-title" className="font-heading text-2xl leading-tight font-bold text-white lg:text-[32px]">
            {title}
          </h2>
          <p className="mt-3 text-lg text-brand-50">{text}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/kontak" className={btn.onDark}>
            Minta Penawaran
          </Link>
          {whatsappHref && (
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={btn.whatsapp}>
              <WhatsAppIcon aria-hidden="true" className="size-5" />
              Chat via WhatsApp
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
