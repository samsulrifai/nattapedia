// Komponen sementara untuk halaman yang belum dikerjakan.
export function PagePlaceholder({ title, note }: { title: string; note: string }) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mt-4 text-neutral-600">{note}</p>
    </section>
  );
}
