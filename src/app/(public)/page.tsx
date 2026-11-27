import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FolderOpen, Layers } from "lucide-react";
import { CtaBand } from "@/components/CtaBand";
import { HeroIllustration } from "@/components/HeroIllustration";
import { ProcessSteps } from "@/components/ProcessSteps";
import { ProjectCard } from "@/components/ProjectCard";
import { ServiceCard } from "@/components/ServiceCard";
import { TestimonialCard } from "@/components/TestimonialCard";
import { WhatsAppIcon } from "@/components/icons";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { btn, container, sectionY, textLink } from "@/components/ui/styles";
import {
  getFeaturedProjects,
  getServices,
  getSiteSettings,
  getTestimonials,
} from "@/lib/content";
import { firstSentence, parseProcessSteps, whatsappLink } from "@/lib/text";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return {
    title: { absolute: s.seo_title || "Nattapedia: Jasa Pembuatan Website & Aplikasi" },
    description:
      s.seo_description ||
      "Nattapedia menyediakan jasa pembuatan website dan aplikasi sesuai kebutuhan bisnis Anda. Lihat portofolio dan minta penawaran.",
    alternates: { canonical: "/" },
  };
}

export default async function HomePage() {
  const [settings, services, projects, testimonials] = await Promise.all([
    getSiteSettings(),
    getServices(),
    getFeaturedProjects(3),
    getTestimonials(),
  ]);
  const wa = whatsappLink(settings.whatsapp_number);
  const { steps } = parseProcessSteps(settings.process_content);
  const shortSteps = steps.map((s) => ({ title: s.title, description: firstSentence(s.description) }));

  return (
    <>
      {/* S1 Hero */}
      <section className="overflow-hidden bg-white">
        <div className={`${container} grid items-center gap-10 py-12 lg:grid-cols-12 lg:py-20`}>
          <div className="lg:col-span-7">
            <p className="font-heading text-[13px] font-semibold uppercase tracking-[0.08em] text-brand-600">
              Jasa Pembuatan Website &amp; Aplikasi
            </p>
            <h1 className="mt-3 font-heading text-[34px] leading-[1.15] font-extrabold text-ink-900 lg:text-[52px] lg:leading-[1.1]">
              {settings.hero_title}
            </h1>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-ink-600 lg:text-[19px]">
              {settings.hero_subtitle}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/kontak" className={btn.primary}>
                Minta Penawaran
              </Link>
              <Link href="/portofolio" className={btn.secondary}>
                Lihat Portofolio
              </Link>
            </div>
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className={`${textLink} mt-5`}>
                <WhatsAppIcon aria-hidden="true" className="size-4" />
                Atau chat via WhatsApp
                <ArrowRight aria-hidden="true" className="size-4" />
              </a>
            )}
          </div>
          <div className="lg:col-span-5">
            <HeroIllustration />
          </div>
        </div>
      </section>

      {/* S2 Layanan */}
      <section className={`bg-ink-100 ${sectionY}`} aria-labelledby="beranda-layanan">
        <div className={container}>
          <SectionHeading
            id="beranda-layanan"
            eyebrow="Layanan"
            title="Apa yang bisa kami kerjakan"
            intro="Pilih layanan yang sesuai, atau ceritakan kebutuhan Anda dan kami bantu menentukannya."
            link={{ href: "/layanan", label: "Semua layanan" }}
          />
          <div className="mt-10">
            {services.length > 0 ? (
              <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {services.slice(0, 3).map((s) => (
                  <li key={s.id}>
                    <ServiceCard service={s} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={Layers}
                text="Daftar layanan sedang kami siapkan. Ceritakan kebutuhan Anda dan kami bantu menentukannya."
                action={{ href: "/kontak", label: "Minta Penawaran" }}
              />
            )}
          </div>
        </div>
      </section>

      {/* S3 Portofolio unggulan */}
      <section className={sectionY} aria-labelledby="beranda-portofolio">
        <div className={container}>
          <SectionHeading
            id="beranda-portofolio"
            eyebrow="Portofolio"
            title="Proyek yang pernah kami kerjakan"
            intro="Lihat contoh hasil kerja kami beserta tantangan dan solusinya."
            link={projects.length > 0 ? { href: "/portofolio", label: "Lihat semua proyek" } : undefined}
          />
          <div className="mt-10">
            {projects.length > 0 ? (
              <ul className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 lg:grid-cols-3">
                {projects.map((p) => (
                  <li key={p.id} className="w-[85%] shrink-0 snap-start sm:w-auto">
                    <ProjectCard project={p} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={FolderOpen}
                text="Portofolio sedang kami siapkan. Sementara itu, ceritakan kebutuhan Anda dan kami jelaskan bagaimana kami bisa membantu."
                action={{ href: "/kontak", label: "Minta Penawaran" }}
              />
            )}
          </div>
        </div>
      </section>

      {/* S4 Proses kerja singkat */}
      <section className={`bg-ink-100 ${sectionY}`} aria-labelledby="beranda-proses">
        <div className={container}>
          <SectionHeading
            id="beranda-proses"
            eyebrow="Proses Kerja"
            title="Bagaimana kita bekerja sama"
            link={{ href: "/tentang#proses-kerja", label: "Pelajari proses kerja" }}
          />
          <div className="mt-10">
            <ProcessSteps steps={shortSteps} compact />
          </div>
        </div>
      </section>

      {/* S5 Testimoni: hanya jika ada data tayang */}
      {testimonials.length > 0 && (
        <section className={sectionY} aria-labelledby="beranda-testimoni">
          <div className={container}>
            <SectionHeading id="beranda-testimoni" title="Kata mereka tentang kami" />
            <ul className="-mx-5 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:gap-6 md:px-0">
              {testimonials.map((t) => (
                <li key={t.id} className="w-[85%] shrink-0 snap-start md:w-[calc((100%-3rem)/3)]">
                  <TestimonialCard testimonial={t} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* S6 CTA band */}
      <CtaBand
        title="Siap memulai proyek Anda?"
        text="Ceritakan kebutuhan Anda, kami akan menghubungi Anda untuk membahasnya."
        whatsappHref={wa}
      />
    </>
  );
}
