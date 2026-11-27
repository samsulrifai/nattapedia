import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const metadata: Metadata = { title: "Portofolio" };

export default function PortofolioPage() {
  return <PagePlaceholder title="Portofolio" note="[PLACEHOLDER] Daftar proyek dimuat dari tabel portfolio_projects (is_published)." />;
}
