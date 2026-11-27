import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FolderOpen, SearchX } from "lucide-react";
import { CtaBand } from "@/components/CtaBand";
import { LoadMore } from "@/components/LoadMore";
import { ProjectCard } from "@/components/ProjectCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHero } from "@/components/ui/PageHero";
import { btn, container, sectionY } from "@/components/ui/styles";
import { getProjects, getSiteSettings } from "@/lib/content";
import { slugify, whatsappLink } from "@/lib/text";
import type { PortfolioProject } from "@/types/database";

export const metadata: Metadata = {
  title: "Portofolio",
  description:
    "Contoh proyek website dan aplikasi yang dikerjakan Nattapedia, lengkap dengan tantangan dan solusinya.",
  alternates: { canonical: "/portofolio" },
};

function categoriesOf(projects: PortfolioProject[]) {
  const map = new Map<string, string>();
  for (const p of projects) if (p.category) map.set(slugify(p.category), p.category);
  return [...map.entries()].map(([slug, label]) => ({ slug, label }));
}

function FilterChips({ categories, active }: { categories: { slug: string; label: string }[]; active: string | null }) {
  const chip = (isActive: boolean) =>
    `inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium transition-colors ${
      isActive ? "border-brand-600 bg-brand-600 text-white" : "border-ink-300 bg-white text-ink-900 hover:bg-ink-100"
    }`;
  return (
    <nav aria-label="Filter kategori" className="-mx-5 mb-10 overflow-x-auto px-5 sm:mx-0 sm:px-0">
      <ul className="flex gap-2 sm:flex-wrap">
        <li className="shrink-0">
          <Link href="/portofolio" scroll={false} className={chip(!active)} aria-current={!active ? "true" : undefined}>
            Semua
          </Link>
        </li>
        {categories.map((c) => (
          <li key={c.slug} className="shrink-0">
            <Link
              href={`/portofolio?kategori=${c.slug}`}
              scroll={false}
              className={chip(active === c.slug)}
              aria-current={active === c.slug ? "true" : undefined}
            >
              {c.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function ProjectGrid({ projects }: { projects: PortfolioProject[] }) {
  return (
    <LoadMore>
      {projects.map((p, i) => (
        <li key={p.id}>
          <ProjectCard project={p} priority={i < 3} />
        </li>
      ))}
    </LoadMore>
  );
}

// Bagian yang bergantung pada ?kategori= (dirender saat request).
async function FilteredProjects({
  projects,
  searchParams,
}: {
  projects: PortfolioProject[];
  searchParams: PageProps<"/portofolio">["searchParams"];
}) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.kategori) ? sp.kategori[0] : sp.kategori;
  const categories = categoriesOf(projects);
  const active = raw || null;
  const filtered = active ? projects.filter((p) => p.category && slugify(p.category) === active) : projects;

  return (
    <>
      {categories.length > 1 && <FilterChips categories={categories} active={active} />}
      {filtered.length > 0 ? (
        <ProjectGrid projects={filtered} />
      ) : (
        <div className="flex flex-col items-center rounded-[var(--radius-card)] border border-dashed border-ink-300 px-6 py-12 text-center">
          <SearchX aria-hidden="true" strokeWidth={1.75} className="size-10 text-ink-500" />
          <p className="mt-4 text-ink-600">Belum ada proyek di kategori ini.</p>
          <Link href="/portofolio" className={`${btn.secondary} mt-6`}>
            Tampilkan semua
          </Link>
        </div>
      )}
    </>
  );
}

export default async function PortofolioPage({ searchParams }: PageProps<"/portofolio">) {
  const [projects, settings] = await Promise.all([getProjects(), getSiteSettings()]);
  const wa = whatsappLink(settings.whatsapp_number);
  const categories = categoriesOf(projects);

  return (
    <>
      <PageHero
        title="Portofolio"
        lead="Kumpulan proyek yang pernah kami kerjakan, lengkap dengan tantangan dan solusinya."
      />
      <section className={sectionY}>
        <div className={container}>
          {projects.length === 0 ? (
            <EmptyState
              icon={FolderOpen}
              text="Portofolio sedang kami siapkan. Ingin tahu bagaimana kami bisa membantu proyek Anda?"
              action={{ href: "/kontak", label: "Minta Penawaran" }}
            />
          ) : (
            <Suspense
              fallback={
                <>
                  {categories.length > 1 && <FilterChips categories={categories} active={null} />}
                  <ProjectGrid projects={projects} />
                </>
              }
            >
              <FilteredProjects projects={projects} searchParams={searchParams} />
            </Suspense>
          )}
        </div>
      </section>
      <CtaBand
        title="Ingin proyek Anda ada di sini?"
        text="Ceritakan kebutuhan Anda dan kita mulai dari sana."
        whatsappHref={wa}
      />
    </>
  );
}
