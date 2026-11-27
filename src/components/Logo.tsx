// Logo sementara (wordmark). Ganti isi komponen ini saat logo asli tersedia.
export function Logo({ onDark = false, name = "Nattapedia" }: { onDark?: boolean; name?: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        className="inline-flex size-6 items-center justify-center rounded-md bg-brand-600 font-heading text-sm font-extrabold text-white"
      >
        N
      </span>
      <span
        className={`font-heading text-lg font-extrabold tracking-tight ${onDark ? "text-white" : "text-ink-900"}`}
      >
        {name}
      </span>
    </span>
  );
}
