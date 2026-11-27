import type { Metadata } from "next";
import { Check } from "lucide-react";
import { CtaBand } from "@/components/CtaBand";
import { ProcessSteps } from "@/components/ProcessSteps";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { container, sectionY } from "@/components/ui/styles";
import { getServices, getSiteSettings } from "@/lib/content";
import { paragraphs, parseProcessSteps, whatsappLink } from "@/lib/text";

export const metadata: Metadata = {
  title: "Tentang Kami & Proses Kerja",
  description: "Kenali Nattapedia dan langkah kerja kami dari konsultasi sampai peluncuran.",
  alternates: { canonical: "/tentang" },
};

export default async function TentangPage() {
  const [settings, services] = await Promise.all([getSiteSettings(), getServices()]);
  const wa = whatsappLink(settings.whatsapp_number);
  const about = paragraphs(settings.about_content);
  const { steps, isExample } = parseProcessSteps(settings.process_content);
  // Paragraf pertama Tentang Kami dipakai sebagai lead halaman.
  const [lead, ...story] = about;
  const focus = services.length > 0 ? services.map((s) => s.title) : ["Website company profile", "Aplikasi web", "Aplikasi mobile"];

  return (
    <>
      <PageHero title="Tentang Kami" lead={lead} />

      {/* S2 Tentang kami */}
      <section className={sectionY} aria-labelledby="tentang-cerita">
        <div className={`${container} grid gap-10 lg:grid-cols-12 lg:gap-16`}>
          <div className="lg:col-span-7">
            <h2 id="tentang-cerita" className="font-heading text-2xl leading-tight font-bold text-ink-900 lg:text-[32px]">
              Cerita Kami
            </h2>
            <div className="mt-5 max-w-prose space-y-4 leading-relaxed text-ink-600">
              {story.length > 0 ? (
                story.map((p, i) => (
                  <p key={i} className="whitespace-pre-line">
                    {p}
                  </p>
                ))
              ) : (
                <p>[DIISI FAI: latar belakang, sejak kapan, siapa di balik Nattapedia, visi/misi bila ada]</p>
              )}
            </div>
          </div>
          <aside className="self-start rounded-[var(--radius-card)] bg-brand-50 p-6 lg:col-span-5 lg:p-8">
            <h3 className="font-heading text-lg font-bold text-ink-900">Fokus kami</h3>
            <ul className="mt-4 space-y-3">
              {focus.map((f) => (
                <li key={f} className="flex gap-3 text-ink-900">
                  <Check aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand-600" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            {services.length === 0 && <p className="mt-4 text-sm text-ink-600">[CONTOH] Mengikuti daftar layanan.</p>}
          </aside>
        </div>
      </section>

      {/* S4 Proses kerja */}
      <section id="proses-kerja" className={`scroll-mt-20 bg-ink-100 ${sectionY}`} aria-labelledby="tentang-proses">
        <div className={container}>
          <SectionHeading
            id="tentang-proses"
            eyebrow="Proses Kerja"
            title="Langkah kerja kami"
            intro={`Gambaran alur kerja dari konsultasi awal sampai website atau aplikasi Anda siap digunakan.${isExample ? " [CONTOH]" : ""}`}
          />
          <div className="mt-10">
            <ProcessSteps steps={steps} />
          </div>
        </div>
      </section>

      <CtaBand
        title="Siap memulai proyek Anda?"
        text="Ceritakan kebutuhan Anda, kami akan menghubungi Anda untuk membahasnya."
        whatsappHref={wa}
      />
    </>
  );
}
