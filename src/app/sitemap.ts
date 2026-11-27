import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

// Halaman statis. Detail portofolio ditambahkan dari database oleh Web Developer.
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/layanan", "/portofolio", "/tentang", "/kontak"];
  return paths.map((path) => ({ url: `${env.siteUrl}${path}`, lastModified: new Date() }));
}
