import type { LeadStatus } from "@/types/database";

export const LEAD_STATUSES: { value: LeadStatus; label: string; tone: "blue" | "amber" | "gray" | "green" | "red" }[] = [
  { value: "baru", label: "Baru", tone: "blue" },
  { value: "dihubungi", label: "Dihubungi", tone: "amber" },
  { value: "negosiasi", label: "Negosiasi", tone: "amber" },
  { value: "deal", label: "Deal", tone: "green" },
  { value: "batal", label: "Batal", tone: "gray" },
];

export function leadStatusMeta(status: string) {
  return LEAD_STATUSES.find((s) => s.value === status) ?? LEAD_STATUSES[0];
}
