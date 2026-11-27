import { Image as ImageIcon } from "lucide-react";

// Pengganti gambar saat belum diunggah. Bukan foto stok.
export function ImagePlaceholder({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 bg-ink-100 text-ink-600 ${className}`}>
      <ImageIcon aria-hidden="true" strokeWidth={1.75} className="size-8" />
      <span className="text-sm">Gambar contoh</span>
    </div>
  );
}
