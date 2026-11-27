import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const metadata: Metadata = { title: "Tentang Kami" };

export default function TentangKamiPage() {
  return <PagePlaceholder title="Tentang Kami" note="[PLACEHOLDER] Isi dari site_settings.about_content dan process_content." />;
}
