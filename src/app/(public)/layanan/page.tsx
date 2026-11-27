import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const metadata: Metadata = { title: "Layanan" };

export default function LayananPage() {
  return <PagePlaceholder title="Layanan" note="[PLACEHOLDER] Daftar layanan dimuat dari tabel services (is_published)." />;
}
