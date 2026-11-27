import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { env } from "@/lib/env";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

// Metadata dasar. Judul/deskripsi per halaman dan nilai dari pengaturan SEO
// (site_settings) diatur di layout/halaman publik.
export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: "Nattapedia: Jasa Pembuatan Website & Aplikasi",
    template: "%s | Nattapedia",
  },
  applicationName: "Nattapedia",
  openGraph: { type: "website", siteName: "Nattapedia", locale: "id_ID" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#2453e0",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${inter.variable} ${jakarta.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
