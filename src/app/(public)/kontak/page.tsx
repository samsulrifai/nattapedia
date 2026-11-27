import type { Metadata } from "next";
import { Suspense } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons";
import { PageHero } from "@/components/ui/PageHero";
import { btn, container, sectionY } from "@/components/ui/styles";
import { getServices, getSiteSettings } from "@/lib/content";
import { formatPhoneDisplay, whatsappLink } from "@/lib/text";
import type { SiteSettings } from "@/types/database";
import { QuoteForm } from "./QuoteForm";

export const metadata: Metadata = {
  title: "Minta Penawaran",
  description:
    "Ceritakan kebutuhan website atau aplikasi Anda. Kirim formulir atau hubungi Nattapedia lewat WhatsApp.",
  alternates: { canonical: "/kontak" },
};

type ServiceOption = { id: string; slug: string; title: string };

function WhatsAppCard({ href }: { href: string | null }) {
  return (
    <div className="rounded-[var(--radius-card)] bg-brand-50 p-6">
      <h2 className="font-heading text-lg font-bold text-ink-900">Lebih suka chat langsung?</h2>
      <p className="mt-2 text-ink-600">Hubungi kami lewat WhatsApp untuk diskusi cepat.</p>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className={`${btn.whatsapp} mt-4 w-full`}>
          <WhatsAppIcon aria-hidden="true" className="size-5" />
          Chat via WhatsApp
        </a>
      ) : (
        <p className="mt-4 text-sm text-ink-500">[DIISI FAI: nomor WhatsApp] Tombol WhatsApp tampil setelah nomor diisi di admin.</p>
      )}
    </div>
  );
}

function ContactInfo({ settings, waHref }: { settings: SiteSettings; waHref: string | null }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-ink-300 p-6">
      <ul className="space-y-4">
        <li className="flex gap-3">
          <Mail aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand-600" />
          <div>
            <p className="text-sm text-ink-500">Email</p>
            {settings.contact_email ? (
              <a href={`mailto:${settings.contact_email}`} className="font-medium break-all text-ink-900 hover:text-brand-600">
                {settings.contact_email}
              </a>
            ) : (
              <p className="font-medium text-ink-900">[DIISI FAI: email bisnis]</p>
            )}
          </div>
        </li>
        {waHref && settings.whatsapp_number && (
          <li className="flex gap-3">
            <WhatsAppIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand-600" />
            <div>
              <p className="text-sm text-ink-500">WhatsApp</p>
              <a href={waHref} target="_blank" rel="noopener noreferrer" className="font-medium text-ink-900 hover:text-brand-600">
                {formatPhoneDisplay(settings.whatsapp_number)}
              </a>
            </div>
          </li>
        )}
        {settings.address && (
          <li className="flex gap-3">
            <MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand-600" />
            <div>
              <p className="text-sm text-ink-500">Alamat</p>
              <p className="font-medium whitespace-pre-line text-ink-900">{settings.address}</p>
            </div>
          </li>
        )}
        {settings.contact_phone && (
          <li className="flex gap-3">
            <Phone aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand-600" />
            <div>
              <p className="text-sm text-ink-500">Telepon</p>
              <a href={`tel:${settings.contact_phone.replace(/[^\d+]/g, "")}`} className="font-medium text-ink-900 hover:text-brand-600">
                {settings.contact_phone}
              </a>
            </div>
          </li>
        )}
      </ul>

      <hr className="my-6 border-ink-300" />

      <h2 className="font-heading text-lg font-bold text-ink-900">Apa yang terjadi setelah Anda mengirim formulir?</h2>
      <ol className="mt-4 space-y-3">
        {[
          "Kami menerima dan membaca kebutuhan Anda.",
          "Kami menghubungi Anda lewat WhatsApp atau email untuk berdiskusi lebih lanjut.",
          "Kami menyusun penawaran sesuai kebutuhan yang disepakati. [CONTOH]",
        ].map((t, i) => (
          <li key={i} className="flex gap-3 text-ink-600">
            <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-brand-600 font-heading text-sm font-bold text-brand-600">
              {i + 1}
            </span>
            <span className="pt-0.5">{t}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

async function FormWithQuery({
  services,
  searchParams,
}: {
  services: ServiceOption[];
  searchParams: PageProps<"/kontak">["searchParams"];
}) {
  const sp = await searchParams;
  const layanan = Array.isArray(sp.layanan) ? sp.layanan[0] : sp.layanan;
  return (
    <QuoteForm
      services={services}
      defaultServiceSlug={layanan}
      turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || undefined}
    />
  );
}

export default async function KontakPage({ searchParams }: PageProps<"/kontak">) {
  const [settings, services] = await Promise.all([getSiteSettings(), getServices()]);
  const wa = whatsappLink(settings.whatsapp_number);
  const options = services.map((s) => ({ id: s.id, slug: s.slug, title: s.title }));
  const turnstile = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || undefined;

  return (
    <>
      <PageHero
        title="Minta Penawaran"
        lead="Ceritakan kebutuhan Anda melalui formulir di bawah, atau hubungi kami lewat WhatsApp."
      />
      <section className={sectionY}>
        <div className={`${container} grid gap-8 lg:grid-cols-12 lg:gap-12`}>
          {/* Mobile: kartu WhatsApp di atas formulir. */}
          <div className="lg:hidden">
            <WhatsAppCard href={wa} />
          </div>
          <div className="lg:col-span-7">
            <div className="rounded-[var(--radius-card)] bg-white sm:p-8 sm:shadow-[var(--shadow-card)]">
              <h2 className="mb-6 font-heading text-2xl font-bold text-ink-900">Formulir Minta Penawaran</h2>
              <Suspense fallback={<QuoteForm services={options} turnstileSiteKey={turnstile} />}>
                <FormWithQuery services={options} searchParams={searchParams} />
              </Suspense>
            </div>
          </div>
          <div className="space-y-6 lg:col-span-5">
            <div className="hidden lg:block">
              <WhatsAppCard href={wa} />
            </div>
            <ContactInfo settings={settings} waHref={wa} />
          </div>
        </div>
      </section>
    </>
  );
}
