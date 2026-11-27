import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Layers } from "lucide-react";
import { CtaBand } from "@/components/CtaBand";
import { ServiceIcon } from "@/components/icons";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHero } from "@/components/ui/PageHero";
import { btn, container, sectionY, textLink } from "@/components/ui/styles";
import { getProjects, getServices, getSiteSettings } from "@/lib/content";
import { slugify, splitServiceDescription, whatsappLink } from "@/lib/text";

export const metadata: Metadata = {
  title: "Layanan",
  description:
    "Layanan pembuatan website dan aplikasi dari Nattapedia. Pilih layanan yang sesuai atau konsultasikan kebutuhan Anda.",
  alternates: { canonical: "/layanan" },
};

export default async function LayananPage() {
  const [services, projects, settings] = await Promise.all([getServices(), getProjects(), getSiteSettings()]);
  const wa = whatsappLink(settings.whatsapp_number);
  // Proyek terkait: kategori proyek sama dengan nama/slug layanan.
  const categorySlugs = new Set(projects.map((p) => (p.category ? slugify(p.category) : "")).filter(Boolean));

  return (
    <>
      <PageHero
        title="Layanan Kami"
        lead="Kami membantu membangun website dan aplikasi sesuai kebutuhan Anda. Berikut layanan yang kami sediakan. [CONTOH]"
      />

      <section className={sectionY}>
        <div className={container}>
          {services.length > 3 && (
            <nav aria-label="Lompat ke layanan" className="-mx-5 mb-10 overflow-x-auto px-5 lg:hidden">
              <ul className="flex gap-2">
                {services.map((s) => (
                  <li key={s.id} className="shrink-0">
                    <a href={`#${s.slug}`} className="inline-flex min-h-11 items-center rounded-full border border-ink-300 px-4 text-sm font-medium text-ink-900 hover:bg-ink-100">
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {services.length === 0 ? (
            <EmptyState
              icon={Layers}
              text="Daftar layanan sedang kami siapkan. Ceritakan kebutuhan Anda dan kami bantu menentukannya."
              action={{ href: "/kontak", label: "Minta Penawaran" }}
            />
          ) : (
            <div className="divide-y divide-ink-300">
              {services.map((service, i) => {
                const { paragraphs, points } = splitServiceDescription(service.description || service.summary);
                const hasRelated = categorySlugs.has(service.slug) || categorySlugs.has(slugify(service.title));
                const relatedSlug = categorySlugs.has(service.slug) ? service.slug : slugify(service.title);
                return (
                  <article
                    key={service.id}
                    id={service.slug}
                    className="grid scroll-mt-24 gap-8 py-12 first:pt-0 last:pb-0 lg:grid-cols-2 lg:gap-16"
                  >
                    <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                      <span className="inline-flex size-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                        <ServiceIcon name={service.icon} className="size-6" />
                      </span>
                      <h2 className="mt-5 font-heading text-2xl leading-tight font-bold text-ink-900 lg:text-[32px]">
                        {service.title}
                      </h2>
                      <div className="mt-4 max-w-prose space-y-4 leading-relaxed text-ink-600">
                        {paragraphs.map((p, j) => (
                          <p key={j} className="whitespace-pre-line">
                            {p}
                          </p>
                        ))}
                      </div>
                      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                        <Link href={`/kontak?layanan=${encodeURIComponent(service.slug)}`} className={btn.primary}>
                          Diskusikan layanan ini
                        </Link>
                        {hasRelated && (
                          <Link href={`/portofolio?kategori=${relatedSlug}`} className={textLink}>
                            Lihat contoh proyek
                            <ArrowRight aria-hidden="true" className="size-4" />
                          </Link>
                        )}
                      </div>
                    </div>
                    {points.length > 0 && (
                      <div className={`self-start rounded-[var(--radius-card)] bg-ink-100 p-6 lg:p-8 ${i % 2 === 1 ? "lg:order-1" : ""}`}>
                        <h3 className="font-heading text-lg font-bold text-ink-900">Cakupan</h3>
                        <ul className="mt-4 space-y-3">
                          {points.map((pt) => (
                            <li key={pt} className="flex gap-3 text-ink-900">
                              <Check aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-success-700" />
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <CtaBand
        title="Belum yakin layanan mana yang cocok?"
        text="Ceritakan tujuan Anda. Kami bantu memilih solusi yang sesuai."
        whatsappHref={wa}
      />
    </>
  );
}
