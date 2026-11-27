import "server-only";
import { and, asc, desc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { getDb, schema } from "@/lib/db";
import { TAGS } from "@/lib/cache-tags";
import type {
  PortfolioImage,
  PortfolioProject,
  Service,
  SiteSettings,
  Testimonial,
} from "@/types/database";

// Lapisan baca konten publik. Tidak ada RLS: setiap query di sini WAJIB
// memfilter is_published = true. Semua fungsi di-cache (`use cache`) supaya
// halaman bisa di-prerender, dan diberi tag agar bisa di-invalidasi dari admin.
// Jika DATABASE_URL belum diisi atau query gagal, fungsi mengembalikan nilai
// kosong/default sehingga halaman tetap tampil (dengan placeholder).

const { services, portfolio_projects, portfolio_images, testimonials, site_settings } = schema;

export const DEFAULT_SETTINGS: SiteSettings = {
  id: 1,
  site_name: "Nattapedia",
  hero_title: "[CONTOH] Website dan aplikasi yang dibuat sesuai kebutuhan bisnis Anda",
  hero_subtitle:
    "[CONTOH] Ceritakan ide atau masalah yang ingin Anda selesaikan. Kami bantu merancang dan membangun solusinya, dari website company profile hingga aplikasi.",
  about_content: "[CONTOH] Isi halaman Tentang Kami",
  process_content: "[CONTOH] Isi bagian Proses Kerja",
  contact_email: null,
  contact_phone: null,
  whatsapp_number: null,
  address: null,
  social_links: {},
  seo_title: null,
  seo_description: null,
  og_image: null,
  updated_at: new Date(0),
};

async function safe<T>(scope: string, fallback: T, run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    console.error(`[content] ${scope}:`, error);
    return fallback;
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.settings);

  const db = getDb();
  if (!db) return DEFAULT_SETTINGS;
  return safe("site_settings", DEFAULT_SETTINGS, async () => {
    const [row] = await db.select().from(site_settings).where(eq(site_settings.id, 1)).limit(1);
    return row ? { ...row, social_links: row.social_links ?? {} } : DEFAULT_SETTINGS;
  });
}

export async function getServices(): Promise<Service[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.services);

  const db = getDb();
  if (!db) return [];
  return safe("services", [], () =>
    db
      .select()
      .from(services)
      .where(eq(services.is_published, true))
      .orderBy(asc(services.sort_order), asc(services.created_at)),
  );
}

export async function getProjects(): Promise<PortfolioProject[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.portfolio);

  const db = getDb();
  if (!db) return [];
  return safe("portfolio_projects", [], () =>
    db
      .select()
      .from(portfolio_projects)
      .where(eq(portfolio_projects.is_published, true))
      .orderBy(asc(portfolio_projects.sort_order), desc(portfolio_projects.created_at)),
  );
}

export async function getFeaturedProjects(limit = 3): Promise<PortfolioProject[]> {
  const projects = await getProjects();
  const featured = projects.filter((p) => p.is_featured);
  return (featured.length > 0 ? featured : projects).slice(0, limit);
}

export type ProjectDetail = {
  project: PortfolioProject;
  images: PortfolioImage[];
  prev: Pick<PortfolioProject, "slug" | "title"> | null;
  next: Pick<PortfolioProject, "slug" | "title"> | null;
};

export async function getProjectBySlug(slug: string): Promise<ProjectDetail | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.portfolio);

  const projects = await getProjects();
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) return null;
  const project = projects[index];

  const db = getDb();
  const images = db
    ? await safe("portfolio_images", [] as PortfolioImage[], () =>
        db
          .select({ img: portfolio_images })
          .from(portfolio_images)
          .innerJoin(portfolio_projects, eq(portfolio_images.project_id, portfolio_projects.id))
          .where(and(eq(portfolio_images.project_id, project.id), eq(portfolio_projects.is_published, true)))
          .orderBy(asc(portfolio_images.sort_order))
          .then((rows) => rows.map((r) => r.img)),
      )
    : [];

  const pick = (p?: PortfolioProject) => (p ? { slug: p.slug, title: p.title } : null);
  return { project, images, prev: pick(projects[index - 1]), next: pick(projects[index + 1]) };
}

export async function getTestimonials(): Promise<Testimonial[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.testimonials);

  const db = getDb();
  if (!db) return [];
  return safe("testimonials", [], () =>
    db
      .select()
      .from(testimonials)
      .where(eq(testimonials.is_published, true))
      .orderBy(asc(testimonials.sort_order)),
  );
}
