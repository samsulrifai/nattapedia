import { Suspense } from "react";
import { PagePlaceholder } from "@/components/PagePlaceholder";

// Cache Components aktif: akses params dibungkus Suspense agar shell halaman
// tetap bisa di-prerender.
export default function PortfolioDetailPage({ params }: PageProps<"/portofolio/[slug]">) {
  return (
    <Suspense fallback={<PagePlaceholder title="Memuat..." note="" />}>
      <PortfolioDetail params={params} />
    </Suspense>
  );
}

async function PortfolioDetail({ params }: Pick<PageProps<"/portofolio/[slug]">, "params">) {
  const { slug } = await params;
  return (
    <PagePlaceholder
      title={`Proyek: ${slug}`}
      note="[PLACEHOLDER] Detail proyek: masalah klien, solusi, teknologi, tangkapan layar."
    />
  );
}
