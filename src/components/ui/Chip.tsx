export function Chip({ children, variant = "tech" }: { children: React.ReactNode; variant?: "tech" | "category" | "onGray" }) {
  const color =
    variant === "category" ? "bg-brand-50 text-brand-600" : variant === "onGray" ? "bg-white text-ink-600" : "bg-ink-100 text-ink-600";
  return (
    <span className={`inline-flex h-[26px] items-center rounded-full px-3 text-[13px] font-medium ${color}`}>
      {children}
    </span>
  );
}
