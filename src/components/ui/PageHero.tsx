import { container } from "./styles";

export function PageHero({ title, lead, children }: { title: string; lead?: string; children?: React.ReactNode }) {
  return (
    <section className="bg-brand-50">
      <div className={`${container} py-12 lg:py-16`}>
        {children}
        <h1 className="font-heading text-[30px] leading-tight font-extrabold text-ink-900 lg:text-[42px]">{title}</h1>
        {lead && <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-ink-600 lg:text-[19px]">{lead}</p>}
      </div>
    </section>
  );
}
