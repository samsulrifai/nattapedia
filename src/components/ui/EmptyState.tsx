import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { btn } from "./styles";

export function EmptyState({
  icon: Icon,
  text,
  action,
}: {
  icon: LucideIcon;
  text: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col items-center rounded-[var(--radius-card)] border border-dashed border-ink-300 bg-white px-6 py-12 text-center">
      <Icon aria-hidden="true" strokeWidth={1.75} className="size-10 text-ink-500" />
      <p className="mt-4 max-w-md text-ink-600">{text}</p>
      {action && (
        <Link href={action.href} className={`${btn.primary} mt-6`}>
          {action.label}
        </Link>
      )}
    </div>
  );
}
