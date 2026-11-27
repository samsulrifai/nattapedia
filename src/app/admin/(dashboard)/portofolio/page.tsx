import type { Metadata } from "next";
import Link from "next/link";
import { asc, desc } from "drizzle-orm";
import { schema } from "@/lib/db";
import { adminPageDb } from "@/lib/admin/server";
import { storageUrl } from "@/lib/storage-url";
import { Badge, EmptyState, PageHeader, PublishedBadge } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Portofolio" };

export default async function AdminPortfolioPage() {
  const p = schema.portfolio_projects;
  const rows = await (await adminPageDb()).select().from(p).orderBy(asc(p.sort_order), desc(p.created_at));

  return (
    <div>
      <PageHeader title="Portofolio" description="Proyek yang tampil di halaman Portofolio." action={{ href: "/admin/portofolio/baru", label: "Tambah proyek" }} />
      {rows.length === 0 ? (
        <EmptyState>Belum ada proyek portofolio.</EmptyState>
      ) : (
        <ul className="divide-y divide-neutral-100 border-y border-neutral-200">
          {rows.map((r) => {
            const cover = storageUrl(r.cover_image);
            return (
              <li key={r.id} className="flex items-center gap-4 py-3">
                <div className="h-14 w-20 shrink-0 overflow-hidden rounded bg-neutral-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {cover && <img src={cover} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/portofolio/${r.id}`} className="font-medium hover:underline">
                    {r.title}
                  </Link>
                  <div className="text-xs text-neutral-500">
                    /portofolio/{r.slug} {r.category && <>&middot; {r.category}</>}
                  </div>
                </div>
                <div className="flex gap-2">
                  {r.is_featured && <Badge tone="blue">Unggulan</Badge>}
                  <PublishedBadge published={r.is_published} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
