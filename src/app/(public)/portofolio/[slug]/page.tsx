import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { CtaBand } from "@/components/CtaBand";
import { Gallery } from "@/components/Gallery";
import { WhatsAppIcon } from "@/components/icons";
import { Chip } from "@/components/ui/Chip";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { btn, container, sectionY, textLink } from "@/components/ui/styles";
import { getProjectBySlug, getProjects, getServices, getSiteSettings } from "@/lib/content";
import { storageUrl } from "@/lib/storage-url";
import { paragraphs, slugify, whatsappLink } from "@/lib/text";

// Cache Components mewajibkan minimal satu param. Jika belum ada proyek,
// dipakai slug penanda yang selalu berujung 404.
const PLACEHOLDER_SLUG = "__belum-ada-proyek__";

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.length > 0 ? projects.map((p) => ({ slug: p.slug })) : [{ slug: PLACEHOLDER_SLUG }];
}

export async function generateMetadata({ params }: PageProps<"/portofolio/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getProjectBySlug(slug);
  if (!detail) return { title: "Proyek tidak ditemukan", robots: { index: false } };
  const { project } = detail;
  const cover = storageUrl(project.cover_image);
  return {
    title: project.title,
    description: project.summary || undefined,
    alternates: { canonical: `/portofolio/${project.slug}` },
    openGraph: {
      type: "article",
      title: project.title,
      description: project.summary || undefined,
      ...(cover ? { images: [{ url: cover }] } : {}),
    },
  };
}

// params di-await di luar Suspense agar slug yang tidak ada menghasilkan
// status 404 asli (bukan soft 404) dan halaman proyek yang sudah dikenal
// dikirim utuh tanpa skeleton (mencegah layout shift).
export default async function PortfolioDetailPage({ params }: PageProps<"/portofolio/[slug]">) {
  const { slug } = await params;
  return <PortfolioDetail slug={slug} />;
}

function RichText({ text }: { text: string }) {
  return (
    <div className="max-w-prose space-y-4 leading-relaxed text-ink-600">
      {paragraphs(text).map((p, i) => (
        <p key={i} className="whitespace-pre-line">
          {p}
        </p>
      ))}
    </div>
  );
}

async function PortfolioDetail({ slug }: { slug: string }) {
  const [detail, services, settings] = await Promise.all([getProjectBySlug(slug), getServices(), getSiteSettings()]);
  if (!detail) notFound();

  const { project, images, prev, next } = detail;
  const wa = whatsappLink(settings.whatsapp_number);
  const cover = storageUrl(project.cover_image);
  const year = project.completed_at ? new Date(project.completed_at).getFullYear() : null;
  const relatedService = project.category
    ? services.find((s) => s.slug === slugify(project.category!) || slugify(s.title) === slugify(project.category!))
    : undefined;
  const gallery = images
    .map((img) => ({ src: storageUrl(img.image_path), alt: img.alt_text }))
    .filter((img): img is { src: string; alt: string } => Boolean(img.src));

  const meta = [
    { label: "Klien", value: project.client_name || "Dirahasiakan" },
    { label: "Layanan", value: relatedService?.title ?? project.category },
    { label: "Tahun", value: year ? String(year) : null },
  ].filter((m): m is { label: string; value: string } => Boolean(m.value));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.summary || undefined,
    ...(cover ? { image: cover } : {}),
    ...(project.project_url ? { url: project.project_url } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <section className="bg-white">
        <div className={`${container} pt-8 pb-10 lg:pt-10`}>
          <nav aria-label="Breadcrumb" className="text-sm text-ink-500">
            <Link href="/portofolio" className="inline-flex items-center gap-1 hover:text-brand-600 sm:hidden">
              <ArrowLeft aria-hidden="true" className="size-4" /> Portofolio
            </Link>
            <ol className="hidden items-center gap-2 sm:flex">
              <li>
                <Link href="/" className="hover:text-brand-600 hover:underline">Beranda</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/portofolio" className="hover:text-brand-600 hover:underline">Portofolio</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-ink-900">{project.title}</li>
            </ol>
          </nav>

          {project.category && (
            <div className="mt-6">
              <Chip variant="category">{project.category}</Chip>
            </div>
          )}
          <h1 className="mt-3 font-heading text-[30px] leading-tight font-extrabold text-ink-900 lg:text-[42px]">
            {project.title}
          </h1>
          {project.summary && (
            <p className="mt-4 max-w-3xl text-[17px] leading-relaxed text-ink-600 lg:text-[19px]">{project.summary}</p>
          )}

          <div className="mt-8 flex flex-col gap-4 rounded-[var(--radius-card)] border border-ink-300 p-5 sm:flex-row sm:items-center sm:justify-between">
            <dl className="grid gap-3 sm:flex sm:gap-10">
              {meta.map((m) => (
                <div key={m.label} className="flex gap-2 sm:block">
                  <dt className="text-sm text-ink-500">{m.label}</dt>
                  <dd className="font-semibold text-ink-900">{m.value}</dd>
                </div>
              ))}
            </dl>
            {project.project_url && /^https?:\/\//.test(project.project_url) && (
              <a href={project.project_url} target="_blank" rel="noopener noreferrer" className={textLink}>
                Kunjungi situs
                <ExternalLink aria-hidden="true" className="size-4" />
              </a>
            )}
          </div>

          <div className="relative mt-10 aspect-[16/9] w-full overflow-hidden rounded-[var(--radius-card)]">
            {cover ? (
              <Image src={cover} alt={`Tampilan proyek ${project.title}`} fill priority sizes="(min-width: 1200px) 1120px, 100vw" className="object-cover" />
            ) : (
              <ImagePlaceholder className="h-full w-full" />
            )}
          </div>
        </div>
      </section>

      <section className="pb-16 lg:pb-24">
        <div className={`${container} grid gap-10 lg:grid-cols-12 lg:gap-16`}>
          <div className="space-y-10 lg:col-span-8">
            {project.problem && (
              <div>
                <h2 className="font-heading text-2xl font-bold text-ink-900 lg:text-[32px]">Tantangan Klien</h2>
                <div className="mt-4"><RichText text={project.problem} /></div>
              </div>
            )}
            {project.solution && (
              <div>
                <h2 className="font-heading text-2xl font-bold text-ink-900 lg:text-[32px]">Solusi</h2>
                <div className="mt-4"><RichText text={project.solution} /></div>
              </div>
            )}
          </div>
          <aside className="lg:col-span-4">
            <div className="space-y-8 rounded-[var(--radius-card)] bg-ink-100 p-6 lg:sticky lg:top-24">
              {project.tech_stack.length > 0 && (
                <div>
                  <h2 className="font-heading text-lg font-bold text-ink-900">Teknologi</h2>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {project.tech_stack.map((t) => (
                      <li key={t}><Chip variant="onGray">{t}</Chip></li>
                    ))}
                  </ul>
                </div>
              )}
              {relatedService && (
                <div>
                  <h2 className="font-heading text-lg font-bold text-ink-900">Layanan terkait</h2>
                  <Link href={`/layanan#${relatedService.slug}`} className={`${textLink} mt-3`}>
                    {relatedService.title}
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </div>
              )}
              <div className="flex flex-col gap-3">
                <Link
                  href={relatedService ? `/kontak?layanan=${encodeURIComponent(relatedService.slug)}` : "/kontak"}
                  className={`${btn.primary} w-full`}
                >
                  Minta Penawaran
                </Link>
                {wa && (
                  <a href={wa} target="_blank" rel="noopener noreferrer" className={`${btn.whatsapp} w-full`}>
                    <WhatsAppIcon aria-hidden="true" className="size-5" />
                    Chat via WhatsApp
                  </a>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>

      {gallery.length > 0 && (
        <section className={`bg-ink-100 ${sectionY}`} aria-labelledby="galeri-proyek">
          <div className={container}>
            <h2 id="galeri-proyek" className="font-heading text-2xl font-bold text-ink-900 lg:text-[32px]">
              Tangkapan Layar
            </h2>
            <div className="mt-8">
              <Gallery images={gallery} />
            </div>
          </div>
        </section>
      )}

      {(prev || next) && (
        <nav aria-label="Navigasi proyek" className="border-t border-ink-300">
          <div className={`${container} flex flex-col gap-4 py-8 sm:flex-row sm:justify-between`}>
            {prev ? (
              <Link href={`/portofolio/${prev.slug}`} className="group flex flex-col">
                <span className="inline-flex items-center gap-1 text-sm text-ink-500">
                  <ArrowLeft aria-hidden="true" className="size-4" /> Proyek sebelumnya
                </span>
                <span className="font-heading font-semibold text-ink-900 group-hover:text-brand-600">{prev.title}</span>
              </Link>
            ) : <span />}
            {next && (
              <Link href={`/portofolio/${next.slug}`} className="group flex flex-col sm:items-end sm:text-right">
                <span className="inline-flex items-center gap-1 text-sm text-ink-500">
                  Proyek berikutnya <ArrowRight aria-hidden="true" className="size-4" />
                </span>
                <span className="font-heading font-semibold text-ink-900 group-hover:text-brand-600">{next.title}</span>
              </Link>
            )}
          </div>
        </nav>
      )}

      <CtaBand title="Punya kebutuhan serupa?" text="Diskusikan proyek Anda dengan kami." whatsappHref={wa} />
    </>
  );
}
