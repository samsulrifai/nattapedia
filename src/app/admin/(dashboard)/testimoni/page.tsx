import type { Metadata } from "next";
import Link from "next/link";
import { asc } from "drizzle-orm";
import { schema } from "@/lib/db";
import { adminPageDb } from "@/lib/admin/server";
import { EmptyState, PageHeader, PublishedBadge } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Testimoni" };

export default async function AdminTestimonialsPage() {
  const rows = await (await adminPageDb())
    .select()
    .from(schema.testimonials)
    .orderBy(asc(schema.testimonials.sort_order), asc(schema.testimonials.created_at));

  return (
    <div>
      <PageHeader
        title="Testimoni"
        description="Bagian testimoni di situs hanya muncul jika ada testimoni yang ditayangkan."
        action={{ href: "/admin/testimoni/baru", label: "Tambah testimoni" }}
      />
      {rows.length === 0 ? (
        <EmptyState>Belum ada testimoni.</EmptyState>
      ) : (
        <ul className="divide-y divide-neutral-100 border-y border-neutral-200">
          {rows.map((t) => (
            <li key={t.id} className="flex items-start justify-between gap-4 py-3">
              <div>
                <Link href={`/admin/testimoni/${t.id}`} className="font-medium hover:underline">
                  {t.author_name}
                </Link>
                {(t.author_role || t.company) && (
                  <span className="text-sm text-neutral-500"> &middot; {[t.author_role, t.company].filter(Boolean).join(", ")}</span>
                )}
                <p className="mt-1 line-clamp-2 text-sm text-neutral-600">{t.quote}</p>
              </div>
              <PublishedBadge published={t.is_published} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
