// Ilustrasi hero abstrak (jendela browser + layar ponsel), dibuat dengan CSS.
// Dekoratif saja; tidak memakai aset pihak ketiga.
export function HeroIllustration() {
  return (
    <div aria-hidden="true" className="relative mx-auto h-[220px] w-full max-w-[460px] sm:h-[300px] lg:h-[380px]">
      <div className="absolute -top-4 -right-4 size-40 rounded-full bg-brand-50 lg:size-64" />
      <div className="absolute bottom-0 left-0 size-24 rounded-3xl bg-brand-50 lg:size-32" />
      {/* Jendela browser */}
      <div className="absolute top-4 left-2 w-[82%] overflow-hidden rounded-2xl border border-ink-300 bg-white shadow-[var(--shadow-card-hover)] lg:top-8">
        <div className="flex items-center gap-1.5 border-b border-ink-300 bg-ink-100 px-3 py-2">
          <span className="size-2.5 rounded-full bg-ink-300" />
          <span className="size-2.5 rounded-full bg-ink-300" />
          <span className="size-2.5 rounded-full bg-ink-300" />
          <span className="ml-3 h-3 flex-1 rounded-full bg-white" />
        </div>
        <div className="space-y-3 p-4 lg:p-6">
          <div className="h-3 w-1/3 rounded-full bg-brand-600" />
          <div className="h-4 w-3/4 rounded-full bg-ink-900/80" />
          <div className="h-3 w-2/3 rounded-full bg-ink-300" />
          <div className="mt-4 grid grid-cols-3 gap-2 lg:gap-3">
            <div className="h-12 rounded-lg bg-brand-50 lg:h-20" />
            <div className="h-12 rounded-lg bg-ink-100 lg:h-20" />
            <div className="h-12 rounded-lg bg-brand-50 lg:h-20" />
          </div>
          <div className="h-1 w-12 rounded-full bg-accent-500" />
        </div>
      </div>
      {/* Layar ponsel */}
      <div className="absolute right-2 bottom-0 w-[30%] overflow-hidden rounded-[22px] border-4 border-ink-900 bg-white shadow-[var(--shadow-card-hover)]">
        <div className="mx-auto mt-1.5 h-1.5 w-8 rounded-full bg-ink-900" />
        <div className="space-y-2 p-2.5 lg:p-3">
          <div className="h-10 rounded-md bg-brand-600 lg:h-16" />
          <div className="h-2 w-3/4 rounded-full bg-ink-900/70" />
          <div className="h-2 w-1/2 rounded-full bg-ink-300" />
          <div className="h-6 rounded-md bg-ink-100 lg:h-10" />
          <div className="h-6 rounded-md bg-brand-50 lg:h-10" />
        </div>
      </div>
    </div>
  );
}
