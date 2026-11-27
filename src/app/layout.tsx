import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { env } from "@/lib/env";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: "Nattapedia",
    template: "%s | Nattapedia",
  },
  description: "[CONTOH] Deskripsi singkat Nattapedia. Diisi lewat pengaturan SEO di admin.",
  openGraph: { type: "website", siteName: "Nattapedia", locale: "id_ID" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
