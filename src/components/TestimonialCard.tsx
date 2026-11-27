import Image from "next/image";
import type { Testimonial } from "@/types/database";
import { storageUrl } from "@/lib/storage-url";

export function TestimonialCard({ testimonial: t }: { testimonial: Testimonial }) {
  const avatar = storageUrl(t.avatar_image);
  const initials = t.author_name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  const role = [t.author_role, t.company].filter(Boolean).join(", ");

  return (
    <figure className="flex h-full flex-col rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-card)]">
      <blockquote className="line-clamp-5 text-ink-900">&ldquo;{t.quote}&rdquo;</blockquote>
      <figcaption className="mt-auto flex items-center gap-3 pt-6">
        {avatar ? (
          <Image src={avatar} alt="" width={40} height={40} className="size-10 rounded-full object-cover" />
        ) : (
          <span aria-hidden="true" className="inline-flex size-10 items-center justify-center rounded-full bg-brand-50 font-heading text-sm font-bold text-brand-600">
            {initials}
          </span>
        )}
        <span>
          <span className="block font-semibold text-ink-900">{t.author_name}</span>
          {role && <span className="block text-sm text-ink-500">{role}</span>}
        </span>
      </figcaption>
    </figure>
  );
}
