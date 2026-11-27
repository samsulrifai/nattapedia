import {
  Code,
  Globe,
  LayoutDashboard,
  MessageCircle,
  Palette,
  Search,
  Server,
  ShoppingCart,
  Smartphone,
  Wrench,
  type LucideIcon,
} from "lucide-react";

// Ikon layanan yang bisa dipilih di admin (kolom services.icon berisi nama ikon).
export const SERVICE_ICONS: Record<string, LucideIcon> = {
  Globe,
  LayoutDashboard,
  Smartphone,
  ShoppingCart,
  Server,
  Palette,
  Search,
  Code,
  Wrench,
};

export function ServiceIcon({ name, className }: { name: string | null; className?: string }) {
  const Icon = (name && SERVICE_ICONS[name]) || Globe;
  return <Icon aria-hidden="true" strokeWidth={1.75} className={className} />;
}

// Ikon WhatsApp: memakai ikon chat generik (Lucide) agar tidak memakai aset brand pihak ketiga.
export const WhatsAppIcon = MessageCircle;
