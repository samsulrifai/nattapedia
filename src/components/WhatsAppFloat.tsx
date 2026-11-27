import { WhatsAppIcon } from "./icons";

// Tombol WhatsApp melayang. Hanya dirender jika nomor WA sudah diisi di admin.
export function WhatsAppFloat({ href }: { href: string | null }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat via WhatsApp"
      className="fixed right-4 bottom-4 z-30 inline-flex size-14 items-center justify-center rounded-full bg-whatsapp text-ink-900 shadow-[var(--shadow-card-hover)] transition hover:brightness-95"
    >
      <WhatsAppIcon aria-hidden="true" className="size-7" />
    </a>
  );
}
