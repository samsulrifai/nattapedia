import Image from "next/image";
import Link from "next/link";
import type { PortfolioProject } from "@/types/database";
import { storageUrl } from "@/lib/storage-url";
import { Chip } from "./ui/Chip";
import { ImagePlaceholder } from "./ui/ImagePlaceholder";

export function ProjectCard({
  project,
  maxChips = 3,
  priority = false,
}: {
  project: PortfolioProject;
  maxChips?: number;
  priority?: boolean;
}) {
  const cover = storageUrl(project.cover_image);
  const chips = project.tech_stack.slice(0, maxChips);
  const extra = project.tech_stack.length - chips.length;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-white shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] motion-reduce:hover:translate-y-0">
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        {cover ? (
          <Image
            src={cover}
            alt=""
            fill
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 90vw"
            className="object-cover"
            priority={priority}
          />
        ) : (
          <ImagePlaceholder className="h-full w-full" />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        {project.category && (
          <div>
            <Chip variant="category">{project.category}</Chip>
          </div>
        )}
        <h3 className="mt-3 font-heading text-lg leading-snug font-bold text-ink-900 lg:text-xl">
          <Link href={`/portofolio/${project.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none group-has-[:focus-visible]:underline">
            {project.title}
          </Link>
        </h3>
        {project.summary && <p className="mt-2 line-clamp-2 text-ink-600">{project.summary}</p>}
        {chips.length > 0 && (
          <ul className="mt-auto flex flex-wrap gap-2 pt-4" aria-label="Teknologi">
            {chips.map((t) => (
              <li key={t}>
                <Chip>{t}</Chip>
              </li>
            ))}
            {extra > 0 && (
              <li>
                <Chip>+{extra}</Chip>
              </li>
            )}
          </ul>
        )}
      </div>
    </article>
  );
}
