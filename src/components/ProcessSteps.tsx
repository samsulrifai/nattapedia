import type { ProcessStep } from "@/lib/text";

// Desktop: grid; mobile: timeline vertikal dengan garis penghubung.
export function ProcessSteps({ steps, compact = false }: { steps: ProcessStep[]; compact?: boolean }) {
  const cols = compact ? "lg:grid-cols-4" : "md:grid-cols-2 lg:grid-cols-3";
  return (
    <ol className={`grid gap-0 md:gap-6 ${cols}`}>
      {steps.map((step, i) => (
        <li
          key={`${i}-${step.title}`}
          className="relative flex gap-4 pb-8 last:pb-0 md:flex-col md:rounded-[var(--radius-card)] md:bg-white md:p-6 md:pb-6 md:shadow-[var(--shadow-card)]"
        >
          {i < steps.length - 1 && (
            <span aria-hidden="true" className="absolute top-11 bottom-0 left-[19px] w-0.5 bg-brand-100 md:hidden" />
          )}
          <span className="relative z-10 inline-flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-brand-600 bg-white font-heading font-bold text-brand-600">
            {i + 1}
          </span>
          <div className="pt-1.5 md:pt-0">
            <h3 className="font-heading text-lg font-bold text-ink-900">{step.title}</h3>
            {step.description && <p className="mt-1 text-ink-600">{step.description}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
