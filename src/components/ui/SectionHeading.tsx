import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { textLink } from "./styles";

export function SectionHeading({
  eyebrow,
  title,
  intro,
  link,
  id,
  onDark = false,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  link?: { href: string; label: string };
  id?: string;
  onDark?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="font-heading text-[13px] font-semibold uppercase tracking-[0.08em] text-brand-600">
            {eyebrow}
          </p>
        )}
        <h2
          id={id}
          className={`mt-2 font-heading text-2xl leading-tight font-bold lg:text-[32px] ${onDark ? "text-white" : "text-ink-900"}`}
        >
          {title}
        </h2>
        {intro && <p className="mt-3 text-base leading-relaxed text-ink-600 lg:text-lg">{intro}</p>}
      </div>
      {link && (
        <Link href={link.href} className={`${textLink} shrink-0`}>
          {link.label}
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      )}
    </div>
  );
}
