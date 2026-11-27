// Validasi formulir minta penawaran. Dipakai di klien (saat blur/submit)
// dan diulang di server (Server Action). Tidak boleh mengimpor modul server.

export const OTHER_SERVICE = "lainnya";

export type LeadInput = {
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  message: string;
  budget: string;
  timeline: string;
  consent: boolean;
};

export type LeadField = keyof LeadInput;
export type LeadErrors = Partial<Record<LeadField, string>>;

export const LIMITS = {
  name: 120,
  email: 200,
  phone: 40,
  company: 160,
  budget: 80,
  timeline: 120,
  message: 4000,
  messageMin: 20,
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** 08xx / +628xx / 628xx (spasi, titik, strip diabaikan) -> 628xx. Null jika tidak valid. */
export function normalizeWhatsapp(raw: string): string | null {
  let d = raw.replace(/[\s.\-()]/g, "");
  if (d.startsWith("+")) d = d.slice(1);
  if (!/^\d+$/.test(d)) return null;
  if (d.startsWith("0")) d = `62${d.slice(1)}`;
  else if (d.startsWith("8")) d = `62${d}`;
  return /^628\d{7,11}$/.test(d) ? d : null;
}

export function validateField(field: LeadField, v: LeadInput): string | undefined {
  switch (field) {
    case "name":
      if (!v.name.trim()) return "Mohon isi nama Anda.";
      if (v.name.trim().length > LIMITS.name) return `Nama maksimal ${LIMITS.name} karakter.`;
      return;
    case "email":
      if (!v.email.trim()) return "Mohon isi email.";
      if (v.email.trim().length > LIMITS.email || !EMAIL_RE.test(v.email.trim())) return "Format email belum benar.";
      return;
    case "phone":
      if (!v.phone.trim()) return "Mohon isi nomor WhatsApp.";
      if (!normalizeWhatsapp(v.phone)) return "Nomor belum valid, contoh: 081234567890.";
      return;
    case "company":
      if (v.company.trim().length > LIMITS.company) return `Maksimal ${LIMITS.company} karakter.`;
      return;
    case "service":
      if (!v.service) return "Mohon pilih layanan.";
      return;
    case "message": {
      const len = v.message.trim().length;
      if (len < LIMITS.messageMin) return "Mohon ceritakan kebutuhan Anda (minimal 20 karakter).";
      if (len > LIMITS.message) return `Maksimal ${LIMITS.message} karakter.`;
      return;
    }
    case "budget":
      if (v.budget.trim().length > LIMITS.budget) return `Maksimal ${LIMITS.budget} karakter.`;
      return;
    case "timeline":
      if (v.timeline.trim().length > LIMITS.timeline) return `Maksimal ${LIMITS.timeline} karakter.`;
      return;
    case "consent":
      if (!v.consent) return "Mohon centang persetujuan untuk melanjutkan.";
      return;
  }
}

export const LEAD_FIELDS: LeadField[] = [
  "name",
  "email",
  "phone",
  "company",
  "service",
  "message",
  "budget",
  "timeline",
  "consent",
];

export function validateLead(v: LeadInput): LeadErrors {
  const errors: LeadErrors = {};
  for (const f of LEAD_FIELDS) {
    const e = validateField(f, v);
    if (e) errors[f] = e;
  }
  return errors;
}
