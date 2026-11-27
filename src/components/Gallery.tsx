"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export type GalleryImage = { src: string; alt: string };

// Galeri tangkapan layar + lightbox (Esc, panah keyboard, swipe, kunci scroll).
export function Gallery({ images }: { images: GalleryImage[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);

  const close = useCallback(() => setIndex(null), []);
  const step = useCallback(
    (d: number) => setIndex((i) => (i === null ? i : (i + d + images.length) % images.length)),
    [images.length],
  );

  const isOpen = index !== null;

  useEffect(() => {
    if (!isOpen) return;
    const trigger = triggerRef.current;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [isOpen, close, step]);

  if (images.length === 0) return null;
  const current = index !== null ? images[index] : null;

  return (
    <>
      <ul className="grid gap-6 md:grid-cols-2">
        {images.map((img, i) => (
          <li key={img.src}>
            <figure>
              <button
                type="button"
                className="relative block aspect-[16/10] w-full overflow-hidden rounded-[var(--radius-card)] bg-ink-100 shadow-[var(--shadow-card)]"
                onClick={(e) => {
                  triggerRef.current = e.currentTarget;
                  setIndex(i);
                }}
                aria-label={`Perbesar gambar: ${img.alt || `gambar ${i + 1}`}`}
              >
                <Image src={img.src} alt={img.alt} fill sizes="(min-width: 768px) 580px, 90vw" className="object-cover" />
              </button>
              {img.alt && <figcaption className="mt-2 text-sm text-ink-500">{img.alt}</figcaption>}
            </figure>
          </li>
        ))}
      </ul>

      {current && index !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={current.alt || "Tangkapan layar"}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/95 p-4"
          onClick={(e) => e.target === e.currentTarget && close()}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
            touchX.current = null;
          }}
        >
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label="Tutup"
            className="absolute top-4 right-4 inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X aria-hidden="true" className="size-6" />
          </button>
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Gambar sebelumnya"
                className="absolute left-4 inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <ChevronLeft aria-hidden="true" className="size-6" />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Gambar berikutnya"
                className="absolute right-4 inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <ChevronRight aria-hidden="true" className="size-6" />
              </button>
            </>
          )}
          <div className="relative h-[80vh] w-full max-w-5xl">
            <Image src={current.src} alt={current.alt} fill sizes="100vw" className="object-contain" />
          </div>
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-ink-300">
            {index + 1} / {images.length}
          </p>
        </div>
      )}
    </>
  );
}
