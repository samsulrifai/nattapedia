"use client";

import Link from "next/link";
import Script from "next/script";
import { useActionState, useRef, useState } from "react";
import { CircleAlert } from "lucide-react";
import { btn } from "@/components/ui/styles";
import {
  LEAD_FIELDS,
  LIMITS,
  OTHER_SERVICE,
  validateField,
  validateLead,
  type LeadErrors,
  type LeadField,
  type LeadInput,
} from "@/lib/lead-validation";
import { submitLead, type LeadFormState } from "./actions";

type ServiceOption = { id: string; slug: string; title: string };

const inputBase =
  "block w-full rounded-[var(--radius-control)] border bg-white px-4 text-base text-ink-900 placeholder:text-ink-500 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/30 focus:outline-none";

function fieldClass(error?: string) {
  return `${inputBase} ${error ? "border-danger-700" : "border-ink-300"}`;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-2 flex items-start gap-1.5 text-sm text-danger-700">
      <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      {message}
    </p>
  );
}

export function QuoteForm({
  services,
  defaultServiceSlug,
  turnstileSiteKey,
}: {
  services: ServiceOption[];
  defaultServiceSlug?: string;
  turnstileSiteKey?: string;
}) {
  const initialService = services.find((s) => s.slug === defaultServiceSlug)?.id ?? "";
  const [values, setValues] = useState<LeadInput>({
    name: "",
    email: "",
    phone: "",
    company: "",
    service: initialService,
    message: "",
    budget: "",
    timeline: "",
    consent: false,
  });
  const [errors, setErrors] = useState<LeadErrors>({});
  const [touched, setTouched] = useState<Partial<Record<LeadField, boolean>>>({});
  const [state, formAction, pending] = useActionState<LeadFormState, FormData>(submitLead, { status: "idle" });
  const summaryRef = useRef<HTMLDivElement>(null);
  const [clientSummary, setClientSummary] = useState(false);
  const [lastState, setLastState] = useState(state);

  // Gabungkan error dari server ke state error lokal.
  if (state !== lastState) {
    setLastState(state);
    if (state.errors) setErrors(state.errors);
  }

  const update = <K extends LeadField>(field: K, value: LeadInput[K]) => {
    const next = { ...values, [field]: value };
    setValues(next);
    if (touched[field] || errors[field]) setErrors((e) => ({ ...e, [field]: validateField(field, next) }));
  };

  const blur = (field: LeadField) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors((e) => ({ ...e, [field]: validateField(field, values) }));
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const all = validateLead(values);
    if (Object.keys(all).length > 0) {
      e.preventDefault();
      setErrors(all);
      setTouched(Object.fromEntries(LEAD_FIELDS.map((f) => [f, true])));
      setClientSummary(true);
      requestAnimationFrame(() => {
        summaryRef.current?.focus();
      });
      return;
    }
    setClientSummary(false);
  };

  const hasErrors = Object.values(errors).some(Boolean);
  const summary = clientSummary && hasErrors ? "Ada beberapa isian yang perlu diperbaiki." : state.status === "error" ? state.message : undefined;

  const describe = (field: LeadField, helperId?: string) =>
    [errors[field] ? `${field}-error` : null, helperId].filter(Boolean).join(" ") || undefined;

  return (
    <form action={formAction} onSubmit={onSubmit} noValidate className="space-y-6">
      {summary && (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="flex gap-2 rounded-[var(--radius-control)] border border-danger-700 bg-white p-4 text-danger-700"
        >
          <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          <p>{summary}</p>
        </div>
      )}

      <div>
        <label htmlFor="name" className="block font-medium text-ink-900">
          Nama lengkap (wajib)
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          maxLength={LIMITS.name}
          placeholder="Nama Anda"
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          onBlur={() => blur("name")}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={describe("name")}
          className={`mt-2 h-12 ${fieldClass(errors.name)}`}
        />
        <FieldError id="name-error" message={errors.name} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="block font-medium text-ink-900">
            Email (wajib)
          </label>
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            maxLength={LIMITS.email}
            placeholder="nama@perusahaan.com"
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            onBlur={() => blur("email")}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describe("email")}
            className={`mt-2 h-12 ${fieldClass(errors.email)}`}
          />
          <FieldError id="email-error" message={errors.email} />
        </div>
        <div>
          <label htmlFor="phone" className="block font-medium text-ink-900">
            No. WhatsApp (wajib)
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={LIMITS.phone}
            placeholder="0812xxxxxxxx"
            value={values.phone}
            onChange={(e) => update("phone", e.target.value)}
            onBlur={() => blur("phone")}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={describe("phone", "phone-help")}
            className={`mt-2 h-12 ${fieldClass(errors.phone)}`}
          />
          <p id="phone-help" className="mt-2 text-sm text-ink-500">
            Kami akan menghubungi Anda lewat nomor ini.
          </p>
          <FieldError id="phone-error" message={errors.phone} />
        </div>
      </div>

      <div>
        <label htmlFor="company" className="block font-medium text-ink-900">
          Nama perusahaan/instansi (opsional)
        </label>
        <input
          id="company"
          name="company"
          type="text"
          autoComplete="organization"
          maxLength={LIMITS.company}
          placeholder="Nama perusahaan"
          value={values.company}
          onChange={(e) => update("company", e.target.value)}
          onBlur={() => blur("company")}
          aria-invalid={Boolean(errors.company)}
          aria-describedby={describe("company")}
          className={`mt-2 h-12 ${fieldClass(errors.company)}`}
        />
        <FieldError id="company-error" message={errors.company} />
      </div>

      <div>
        <label htmlFor="service" className="block font-medium text-ink-900">
          Layanan yang dibutuhkan (wajib)
        </label>
        <select
          id="service"
          name="service"
          value={values.service}
          onChange={(e) => update("service", e.target.value)}
          onBlur={() => blur("service")}
          aria-invalid={Boolean(errors.service)}
          aria-describedby={describe("service")}
          className={`mt-2 h-12 ${fieldClass(errors.service)}`}
        >
          <option value="">Pilih layanan</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
          <option value={OTHER_SERVICE}>Lainnya / belum yakin</option>
        </select>
        <FieldError id="service-error" message={errors.service} />
      </div>

      <div>
        <label htmlFor="message" className="block font-medium text-ink-900">
          Ceritakan kebutuhan Anda (wajib)
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          maxLength={LIMITS.message}
          placeholder="Contoh: Saya butuh website untuk memperkenalkan usaha saya, dengan halaman layanan dan formulir kontak."
          value={values.message}
          onChange={(e) => update("message", e.target.value)}
          onBlur={() => blur("message")}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={describe("message", "message-help")}
          className={`mt-2 py-3 ${fieldClass(errors.message)}`}
        />
        <p id="message-help" className="mt-2 text-sm text-ink-500">
          Semakin jelas, semakin mudah kami menyusun penawaran.
        </p>
        <FieldError id="message-error" message={errors.message} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="budget" className="block font-medium text-ink-900">
            Perkiraan anggaran (opsional)
          </label>
          <input
            id="budget"
            name="budget"
            type="text"
            maxLength={LIMITS.budget}
            placeholder="Contoh: sekitar Rp..."
            value={values.budget}
            onChange={(e) => update("budget", e.target.value)}
            onBlur={() => blur("budget")}
            aria-invalid={Boolean(errors.budget)}
            aria-describedby={describe("budget", "budget-help")}
            className={`mt-2 h-12 ${fieldClass(errors.budget)}`}
          />
          <p id="budget-help" className="mt-2 text-sm text-ink-500">
            Boleh dikosongkan jika belum ada gambaran.
          </p>
          <FieldError id="budget-error" message={errors.budget} />
        </div>
        <div>
          <label htmlFor="timeline" className="block font-medium text-ink-900">
            Target waktu selesai (opsional)
          </label>
          <input
            id="timeline"
            name="timeline"
            type="text"
            maxLength={LIMITS.timeline}
            placeholder="Contoh: akhir bulan depan"
            value={values.timeline}
            onChange={(e) => update("timeline", e.target.value)}
            onBlur={() => blur("timeline")}
            aria-invalid={Boolean(errors.timeline)}
            aria-describedby={describe("timeline")}
            className={`mt-2 h-12 ${fieldClass(errors.timeline)}`}
          />
          <FieldError id="timeline-error" message={errors.timeline} />
        </div>
      </div>

      {/* Honeypot: disembunyikan dari pengguna dan pembaca layar. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <input type="hidden" name="source" value="/kontak" />

      <div>
        <div className="flex items-start gap-3">
          <input
            id="consent"
            name="consent"
            type="checkbox"
            checked={values.consent}
            onChange={(e) => update("consent", e.target.checked)}
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={describe("consent")}
            className="mt-1 size-5 shrink-0 accent-brand-600"
          />
          <label htmlFor="consent" className="text-ink-900">
            Saya setuju data ini digunakan untuk menghubungi saya terkait permintaan ini. Baca{" "}
            <Link href="/kebijakan-privasi" className="font-medium text-brand-600 underline underline-offset-2">
              Kebijakan Privasi
            </Link>
            . (wajib)
          </label>
        </div>
        <FieldError id="consent-error" message={errors.consent} />
      </div>

      {turnstileSiteKey && (
        <>
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" async defer />
          <div className="cf-turnstile" data-sitekey={turnstileSiteKey} data-language="id" />
        </>
      )}

      <button type="submit" disabled={pending} className={`${btn.primary} w-full sm:w-auto`}>
        {pending ? "Mengirim..." : "Kirim Permintaan"}
      </button>
    </form>
  );
}
