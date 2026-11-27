import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Service } from "@/types/database";
import { ServiceIcon } from "./icons";
import { textLink } from "./ui/styles";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="flex h-full flex-col rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-card)]">
      <span className="inline-flex size-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <ServiceIcon name={service.icon} className="size-6" />
      </span>
      <h3 className="mt-5 font-heading text-lg leading-snug font-bold text-ink-900 lg:text-xl">{service.title}</h3>
      {service.summary && <p className="mt-2 line-clamp-3 text-ink-600">{service.summary}</p>}
      <Link href={`/kontak?layanan=${encodeURIComponent(service.slug)}`} className={`${textLink} mt-auto pt-5`}>
        Diskusikan kebutuhan
        <ArrowRight aria-hidden="true" className="size-4" />
        <span className="sr-only">: {service.title}</span>
      </Link>
    </article>
  );
}
