import type { FormState, FormValues } from "./form-state";

// Validasi input form admin di server. Semua pesan error dalam Bahasa Indonesia.
// Pemakaian:
//   const f = new FormReader(formData);
//   const title = f.text("title", "Judul", { required: true, max: 160 });
//   if (f.hasErrors()) return f.fail();

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

/** 08xx / +628xx / 628xx (spasi, titik, strip diabaikan) menjadi 628xx. Null jika tidak valid. */
export function normalizeWhatsapp(raw: string): string | null {
  let d = raw.replace(/[\s.\-()]/g, "");
  if (d.startsWith("+")) d = d.slice(1);
  if (!/^\d+$/.test(d)) return null;
  if (d.startsWith("0")) d = `62${d.slice(1)}`;
  else if (d.startsWith("8")) d = `62${d}`;
  return /^628\d{7,11}$/.test(d) ? d : null;
}

function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

type TextOpts = { required?: boolean; max?: number; min?: number };

export class FormReader {
  readonly errors: Record<string, string> = {};
  readonly values: FormValues = {};

  constructor(private readonly fd: FormData) {
    for (const [key, value] of fd.entries()) {
      if (typeof value === "string" && !key.startsWith("$ACTION")) this.values[key] = value;
    }
  }

  private raw(name: string): string {
    const v = this.fd.get(name);
    return typeof v === "string" ? v.trim() : "";
  }

  private setError(name: string, message: string) {
    this.errors[name] ??= message;
  }

  /** Teks wajib/opsional. Mengembalikan string (bisa kosong). */
  text(name: string, label: string, opts: TextOpts = {}): string {
    const v = this.raw(name);
    if (opts.required && !v) this.setError(name, `${label} wajib diisi.`);
    else if (v && opts.min && v.length < opts.min)
      this.setError(name, `${label} minimal ${opts.min} karakter.`);
    else if (opts.max && v.length > opts.max)
      this.setError(name, `${label} maksimal ${opts.max} karakter.`);
    return v;
  }

  /** Teks opsional: string kosong menjadi null. */
  optionalText(name: string, label: string, max: number): string | null {
    return this.text(name, label, { max }) || null;
  }

  checkbox(name: string): boolean {
    const v = this.fd.get(name);
    return v === "on" || v === "true" || v === "1";
  }

  integer(name: string, label: string, fallback = 0): number {
    const v = this.raw(name);
    if (!v) return fallback;
    if (!/^-?\d+$/.test(v) || Math.abs(Number(v)) > 100000) {
      this.setError(name, `${label} harus berupa angka bulat.`);
      return fallback;
    }
    return Number(v);
  }

  slug(name: string, fromText: string): string {
    const v = this.raw(name).toLowerCase();
    const slug = v || slugify(fromText);
    if (!slug) this.setError(name, "Slug wajib diisi (huruf kecil, angka, dan tanda strip).");
    else if (slug.length > 80) this.setError(name, "Slug maksimal 80 karakter.");
    else if (!SLUG_RE.test(slug))
      this.setError(name, "Slug hanya boleh huruf kecil, angka, dan tanda strip, mis. toko-online-abc.");
    return slug;
  }

  url(name: string, label: string): string | null {
    const v = this.raw(name);
    if (!v) return null;
    if (v.length > 500 || !isHttpUrl(v))
      this.setError(name, `${label} harus berupa URL lengkap, mis. https://contoh.com.`);
    return v;
  }

  email(name: string, label: string): string | null {
    const v = this.raw(name);
    if (!v) return null;
    if (v.length > 200 || !EMAIL_RE.test(v)) this.setError(name, `Format ${label.toLowerCase()} belum benar.`);
    return v;
  }

  whatsapp(name: string, label: string): string | null {
    const v = this.raw(name);
    if (!v) return null;
    const n = normalizeWhatsapp(v);
    if (!n) this.setError(name, `${label} belum valid, contoh: 081234567890 atau 6281234567890.`);
    return n;
  }

  date(name: string, label: string): string | null {
    const v = this.raw(name);
    if (!v) return null;
    if (!DATE_RE.test(v) || Number.isNaN(Date.parse(v))) this.setError(name, `${label} tidak valid.`);
    return v;
  }

  uuid(name: string, label: string): string | null {
    const v = this.raw(name);
    if (!v) return null;
    if (!/^[0-9a-f-]{36}$/i.test(v)) this.setError(name, `${label} tidak valid.`);
    return v;
  }

  oneOf<T extends string>(name: string, label: string, allowed: readonly T[]): T {
    const v = this.raw(name) as T;
    if (!allowed.includes(v)) this.setError(name, `${label} tidak valid.`);
    return v;
  }

  /** Daftar dipisah koma atau baris baru, mis. tech stack. */
  list(name: string, label: string, maxItems = 20, maxLen = 40): string[] {
    const items = this.raw(name)
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (items.length > maxItems) this.setError(name, `${label} maksimal ${maxItems} item.`);
    if (items.some((s) => s.length > maxLen))
      this.setError(name, `Setiap item ${label.toLowerCase()} maksimal ${maxLen} karakter.`);
    return Array.from(new Set(items));
  }

  /** File gambar opsional. Validasi detail (format, ukuran) juga diulang di uploadImage(). */
  image(name: string): File | null {
    const v = this.fd.get(name);
    if (!(v instanceof File) || v.size === 0) return null;
    if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(v.type)) {
      this.setError(name, "Format gambar harus JPG, PNG, WEBP, atau AVIF.");
      return null;
    }
    if (v.size > 4 * 1024 * 1024) {
      this.setError(name, "Ukuran gambar maksimal 4 MB.");
      return null;
    }
    return v;
  }

  addError(name: string, message: string) {
    this.setError(name, message);
  }

  hasErrors(): boolean {
    return Object.keys(this.errors).length > 0;
  }

  fail(message = "Periksa kembali isian yang ditandai."): FormState {
    return { status: "error", message, errors: this.errors, values: this.values };
  }
}

export function failState(message: string, values?: FormValues): FormState {
  return { status: "error", message, values };
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Argumen id pada Server Action bisa dikirim sembarang oleh klien; selalu cek formatnya. */
export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}
