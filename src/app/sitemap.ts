import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { getProjects } from "@/lib/content";

// Halaman publik + detail portofolio yang tayang. Admin, terima kasih, dan
// kebijakan privasi (masih placeholder) tidak dimasukkan.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects();
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${env.siteUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${env.siteUrl}/layanan`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${env.siteUrl}/portofolio`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${env.siteUrl}/tentang`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${env.siteUrl}/kontak`, changeFrequency: "monthly", priority: 0.7 },
  ];
  const projectPages: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${env.siteUrl}/portofolio/${p.slug}`,
    lastModified: p.updated_at,
    changeFrequency: "monthly",
    priority: 0.6,
  }));
  return [...staticPages, ...projectPages];
}
