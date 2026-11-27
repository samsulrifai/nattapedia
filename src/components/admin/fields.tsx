"use client";

import { useId } from "react";
import { useAdminFormState } from "./AdminForm";

const inputClass =
  "mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 aria-[invalid=true]:border-red-500";

function useField(name: string) {
  const state = useAdminFormState();
  return { error: state.errors?.[name], submitted: state.values?.[name], hasValues: Boolean(state.values) };
}

function Wrapper({
  id,
  label,
  hint,
  error,
  required,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-neutral-800">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-neutral-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

type BaseProps = {
  name: string;
  label: string;
  defaultValue?: string | number | null;
  hint?: string;
  required?: boolean;
  placeholder?: string;
};

export function TextField({
  type = "text",
  maxLength,
  ...p
}: BaseProps & { type?: "text" | "email" | "url" | "tel" | "number" | "date"; maxLength?: number }) {
  const id = useId();
  const { error, submitted } = useField(p.name);
  return (
    <Wrapper id={id} label={p.label} hint={p.hint} error={error} required={p.required}>
      <input
        id={id}
        name={p.name}
        type={type}
        defaultValue={submitted ?? p.defaultValue ?? ""}
        placeholder={p.placeholder}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : p.hint ? `${id}-hint` : undefined}
        className={inputClass}
      />
    </Wrapper>
  );
}

export function TextArea({ rows = 4, maxLength, ...p }: BaseProps & { rows?: number; maxLength?: number }) {
  const id = useId();
  const { error, submitted } = useField(p.name);
  return (
    <Wrapper id={id} label={p.label} hint={p.hint} error={error} required={p.required}>
      <textarea
        id={id}
        name={p.name}
        rows={rows}
        defaultValue={submitted ?? p.defaultValue ?? ""}
        placeholder={p.placeholder}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : p.hint ? `${id}-hint` : undefined}
        className={inputClass}
      />
    </Wrapper>
  );
}

export function SelectField({
  options,
  emptyLabel,
  ...p
}: BaseProps & { options: { value: string; label: string }[]; emptyLabel?: string }) {
  const id = useId();
  const { error, submitted } = useField(p.name);
  return (
    <Wrapper id={id} label={p.label} hint={p.hint} error={error} required={p.required}>
      <select
        id={id}
        name={p.name}
        defaultValue={submitted ?? String(p.defaultValue ?? "")}
        aria-invalid={error ? true : undefined}
        className={inputClass}
      >
        {emptyLabel !== undefined && <option value="">{emptyLabel}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Wrapper>
  );
}

export function Checkbox({
  name,
  label,
  defaultChecked,
  hint,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
  hint?: string;
}) {
  const id = useId();
  const { submitted, hasValues } = useField(name);
  const checked = hasValues ? submitted === "on" : Boolean(defaultChecked);
  return (
    <div className="flex items-start gap-2">
      <input
        id={id}
        name={name}
        type="checkbox"
        defaultChecked={checked}
        className="mt-0.5 size-4 rounded border-neutral-300"
      />
      <div>
        <label htmlFor={id} className="text-sm font-medium text-neutral-800">
          {label}
        </label>
        {hint && <p className="text-xs text-neutral-500">{hint}</p>}
      </div>
    </div>
  );
}

// Input gambar: menampilkan gambar saat ini (jika ada), input file baru,
// dan opsi hapus gambar. File tidak bisa dikembalikan setelah validasi gagal.
export function ImageField({
  name,
  label,
  currentUrl,
  removeName,
  hint = "JPG, PNG, WEBP, atau AVIF. Maksimal 4 MB.",
}: {
  name: string;
  label: string;
  currentUrl?: string | null;
  removeName?: string;
  hint?: string;
}) {
  const id = useId();
  const { error } = useField(name);
  return (
    <Wrapper id={id} label={label} hint={hint} error={error}>
      {currentUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={currentUrl} alt="" className="mt-2 h-32 w-auto rounded-md border border-neutral-200 object-cover" />
      )}
      <input
        id={id}
        name={name}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        aria-invalid={error ? true : undefined}
        className="mt-2 block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-neutral-100 file:px-3 file:py-2 file:text-sm"
        onChange={(e) => {
          const f = e.currentTarget.files?.[0];
          if (f && f.size > 4 * 1024 * 1024) {
            alert("Ukuran gambar maksimal 4 MB. Silakan pilih file lain.");
            e.currentTarget.value = "";
          }
        }}
      />
      {currentUrl && removeName && (
        <label className="mt-2 flex items-center gap-2 text-sm text-neutral-700">
          <input type="checkbox" name={removeName} className="size-4" /> Hapus gambar ini
        </label>
      )}
    </Wrapper>
  );
}
