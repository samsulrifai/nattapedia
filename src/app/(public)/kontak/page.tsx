import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const metadata: Metadata = { title: "Kontak" };

export default function KontakPage() {
  return <PagePlaceholder title="Kontak" note="[PLACEHOLDER] Formulir minta penawaran (disimpan ke tabel leads) dan tombol WhatsApp." />;
}
