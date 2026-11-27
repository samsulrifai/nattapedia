// Utilitas teks konten dari admin (teks polos, bukan HTML).

export const WHATSAPP_DEFAULT_MESSAGE =
  "Halo Nattapedia, saya ingin konsultasi tentang pembuatan website/aplikasi.";

/** Nomor WA tersimpan (format 62xxxx) menjadi tautan wa.me. Null jika kosong/tidak valid. */
export function whatsappLink(number: string | null | undefined, message = WHATSAPP_DEFAULT_MESSAGE) {
  const digits = (number ?? "").replace(/\D/g, "");
  if (digits.length < 8) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/** 6281234567890 -> +62 812-3456-7890 (hanya untuk tampilan). */
export function formatPhoneDisplay(number: string) {
  const d = number.replace(/\D/g, "");
  if (!d.startsWith("62") || d.length < 10) return `+${d}`;
  const rest = d.slice(2);
  return `+62 ${rest.slice(0, 3)}-${rest.slice(3, 7)}-${rest.slice(7)}`;
}

/** Pisah teks menjadi paragraf berdasarkan baris kosong. */
export function paragraphs(text: string | null | undefined): string[] {
  return (text ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/**
 * Deskripsi layanan: baris yang diawali "- " atau "* " menjadi poin cakupan,
 * sisanya paragraf deskripsi.
 */
export function splitServiceDescription(text: string) {
  const lines = text.split("\n");
  const points: string[] = [];
  const body: string[] = [];
  for (const line of lines) {
    const m = line.match(/^\s*[-*•]\s+(.*)$/);
    if (m) points.push(m[1].trim());
    else body.push(line);
  }
  return { paragraphs: paragraphs(body.join("\n")), points: points.filter(Boolean) };
}

export type ProcessStep = { title: string; description: string };

// Contoh langkah dari dokumen copy PTF-23. Tampil hanya selama
// site_settings.process_content belum diisi Fai.
const EXAMPLE_STEPS: ProcessStep[] = [
  { title: "Konsultasi", description: "Anda menceritakan kebutuhan, tujuan, dan gambaran fitur yang diinginkan." },
  { title: "Analisis & Penawaran", description: "Kami menyusun ruang lingkup pekerjaan, estimasi waktu, dan penawaran biaya." },
  { title: "Desain", description: "Kami membuat rancangan tampilan untuk Anda tinjau sebelum pengembangan." },
  { title: "Pengembangan", description: "Website atau aplikasi dibangun sesuai rancangan yang disepakati." },
  { title: "Pengujian & Revisi", description: "Hasil diuji bersama dan diperbaiki sesuai masukan yang disepakati." },
  { title: "Peluncuran & Dukungan", description: "Website atau aplikasi dirilis, lalu kami membantu pada tahap awal penggunaan." },
];

/**
 * Format process_content: satu langkah per baris, "Judul: deskripsi".
 * Nomor di depan ("1. ") diabaikan. Jika belum diisi (masih teks default
 * bertanda [CONTOH]), dipakai langkah contoh dengan penanda isExample.
 */
export function parseProcessSteps(text: string | null | undefined): { steps: ProcessStep[]; isExample: boolean } {
  const lines = (text ?? "")
    .split("\n")
    .map((l) => l.trim().replace(/^\d+[.)]\s*/, ""))
    .filter(Boolean);
  const steps = lines
    .filter((l) => !/^\[CONTOH\]/i.test(l) || l.includes(":"))
    .map((l) => {
      const i = l.indexOf(":");
      return i > 0
        ? { title: l.slice(0, i).trim(), description: l.slice(i + 1).trim() }
        : { title: l, description: "" };
    });
  if (steps.length === 0) return { steps: EXAMPLE_STEPS, isExample: true };
  return { steps, isExample: false };
}

/** Kalimat pertama, untuk ringkasan langkah di Beranda. */
export function firstSentence(text: string) {
  const m = text.match(/^.*?[.!?](\s|$)/);
  return (m ? m[0] : text).trim();
}

export function isPlaceholder(text: string | null | undefined) {
  return !text || /\[(CONTOH|DIISI FAI|PLACEHOLDER)/i.test(text);
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
