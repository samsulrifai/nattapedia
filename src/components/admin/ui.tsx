import Link from "next/link";

// Komponen tampilan sederhana untuk halaman admin (server component).

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && <p className="mt-1 text-sm text-neutral-600">{description}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="mb-4 inline-block text-sm text-neutral-600 hover:text-neutral-900">
      &larr; {label}
    </Link>
  );
}

export function Badge({ tone, children }: { tone: "green" | "gray" | "blue" | "amber" | "red"; children: React.ReactNode }) {
  const tones = {
    green: "bg-green-100 text-green-800",
    gray: "bg-neutral-100 text-neutral-700",
    blue: "bg-blue-100 text-blue-800",
    amber: "bg-amber-100 text-amber-900",
    red: "bg-red-100 text-red-800",
  };
  return <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

export function PublishedBadge({ published }: { published: boolean }) {
  return <Badge tone={published ? "green" : "gray"}>{published ? "Tayang" : "Draf"}</Badge>;
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="rounded-md border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-600">{children}</p>;
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4 rounded-md border border-neutral-200 p-4">
      <legend className="px-1 text-sm font-semibold text-neutral-800">{title}</legend>
      {children}
    </fieldset>
  );
}

const dateFmt = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

export function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return "-";
  return dateFmt.format(new Date(value));
}
