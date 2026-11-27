"use server";

import { redirect } from "next/navigation";
import { getServices } from "@/lib/content";
import { getDb, schema } from "@/lib/db";
import {
  OTHER_SERVICE,
  normalizeWhatsapp,
  validateLead,
  type LeadErrors,
  type LeadInput,
} from "@/lib/lead-validation";

export type LeadFormState = {
  status: "idle" | "error";
  errors?: LeadErrors;
  message?: string;
};

const SERVER_ERROR =
  "Maaf, permintaan belum terkirim karena gangguan. Silakan coba lagi, atau hubungi kami lewat WhatsApp.";

function str(form: FormData, key: string) {
  const v = form.get(key);
  return typeof v === "string" ? v : "";
}

async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // Turnstile opsional; tidak aktif jika kunci belum diisi.
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret, response: token }),
      cache: "no-store",
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (error) {
    console.error("[kontak] verifikasi Turnstile gagal:", error);
    return false;
  }
}

export async function submitLead(_prev: LeadFormState, form: FormData): Promise<LeadFormState> {
  // Honeypot: bot yang mengisi field tersembunyi dianggap berhasil tanpa disimpan.
  if (str(form, "website").trim() !== "") redirect("/kontak/terima-kasih");

  const input: LeadInput = {
    name: str(form, "name"),
    email: str(form, "email"),
    phone: str(form, "phone"),
    company: str(form, "company"),
    service: str(form, "service"),
    message: str(form, "message"),
    budget: str(form, "budget"),
    timeline: str(form, "timeline"),
    consent: form.get("consent") === "on",
  };

  const errors = validateLead(input);
  const services = await getServices();
  let serviceId: string | null = null;
  if (input.service && input.service !== OTHER_SERVICE) {
    const match = services.find((s) => s.id === input.service);
    if (match) serviceId = match.id;
    else errors.service = "Mohon pilih layanan.";
  }
  if (Object.keys(errors).length > 0) {
    return { status: "error", errors, message: "Ada beberapa isian yang perlu diperbaiki." };
  }

  if (!(await verifyTurnstile(str(form, "cf-turnstile-response")))) {
    return { status: "error", message: "Verifikasi anti-spam gagal. Silakan coba lagi." };
  }

  const db = getDb();
  if (!db) {
    console.error("[kontak] DATABASE_URL belum dikonfigurasi; lead tidak tersimpan.");
    return { status: "error", message: SERVER_ERROR };
  }

  // Kolom yang belum ada di skema (target waktu, layanan "lainnya", persetujuan)
  // dicatat di bagian akhir pesan agar tetap terbaca di admin.
  const extras = [
    input.timeline.trim() && `Target waktu: ${input.timeline.trim()}`,
    input.service === OTHER_SERVICE && "Layanan: Lainnya / belum yakin",
    `Persetujuan data: disetujui melalui formulir (${new Date().toISOString()})`,
  ].filter(Boolean);
  const message = `${input.message.trim()}\n\n---\n${extras.join("\n")}`;

  const source = str(form, "source").slice(0, 200) || "/kontak";

  try {
    await db.insert(schema.leads).values({
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      phone: normalizeWhatsapp(input.phone),
      company: input.company.trim() || null,
      service_id: serviceId,
      budget_range: input.budget.trim() || null,
      message,
      source_page: source,
    });
  } catch (error) {
    console.error("[kontak] gagal menyimpan lead:", error instanceof Error ? error.message : error);
    return { status: "error", message: SERVER_ERROR };
  }

  redirect("/kontak/terima-kasih");
}
