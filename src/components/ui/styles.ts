// Kelas Tailwind bersama untuk tombol dan kontainer (dokumen desain bagian 3.1).
const buttonBase =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-control)] px-5 py-3 font-heading text-base font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60";

export const btn = {
  primary: `${buttonBase} bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-700`,
  secondary: `${buttonBase} border border-ink-300 bg-white text-ink-900 hover:bg-ink-100`,
  whatsapp: `${buttonBase} bg-whatsapp text-ink-900 hover:brightness-95`,
  onDark: `${buttonBase} bg-white text-brand-700 hover:bg-brand-50`,
};

export const textLink =
  "inline-flex items-center gap-1.5 font-heading font-semibold text-brand-600 hover:text-brand-700 hover:underline underline-offset-4";

export const container = "mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-10";

export const sectionY = "py-16 lg:py-24";
