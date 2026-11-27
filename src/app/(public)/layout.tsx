import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { getServices, getSiteSettings } from "@/lib/content";
import { whatsappLink } from "@/lib/text";
import { storageUrl } from "@/lib/storage-url";
import type { Metadata } from "next";
import { cacheLife } from "next/cache";

// Deskripsi default dan gambar OG dari pengaturan SEO (admin).
export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  const og = storageUrl(s.og_image);
  return {
    description:
      s.seo_description ||
      "Nattapedia menyediakan jasa pembuatan website dan aplikasi sesuai kebutuhan bisnis Anda. Lihat portofolio dan minta penawaran.",
    ...(og ? { openGraph: { images: [{ url: og, width: 1200, height: 630 }] } } : {}),
  };
}

async function getYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export default async function PublicLayout({ children }: LayoutProps<"/">) {
  const [settings, services, year] = await Promise.all([getSiteSettings(), getServices(), getYear()]);
  const wa = whatsappLink(settings.whatsapp_number);

  return (
    <>
      <SiteHeader siteName={settings.site_name} whatsappHref={wa} />
      <main id="konten" className="flex-1">
        {children}
      </main>
      <SiteFooter settings={settings} services={services} year={year} />
      <WhatsAppFloat href={wa} />
    </>
  );
}
