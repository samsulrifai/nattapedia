import Link from "next/link";
import { Mail, MapPin } from "lucide-react";
import type { Service, SiteSettings } from "@/types/database";
import { NAV_ITEMS } from "@/lib/nav";
import { formatPhoneDisplay, whatsappLink } from "@/lib/text";
import { Logo } from "./Logo";
import { WhatsAppIcon } from "./icons";
import { container } from "./ui/styles";

export function SiteFooter({
  settings,
  services,
  year,
}: {
  settings: SiteSettings;
  services: Service[];
  year: number;
}) {
  const wa = whatsappLink(settings.whatsapp_number);
  const socials = Object.entries(settings.social_links ?? {}).filter(
    ([, url]) => typeof url === "string" && /^https?:\/\//.test(url),
  );

  return (
    <footer className="mt-auto bg-ink-900 text-ink-300">
      <div className={`${container} grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4`}>
        <div>
          <Logo onDark name={settings.site_name} />
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            Jasa pembuatan website dan aplikasi. Ceritakan kebutuhan Anda, kami bantu wujudkan. [CONTOH]
          </p>
        </div>

        <div>
          <h2 className="font-heading text-base font-semibold text-white">Navigasi</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-white hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {services.length > 0 && (
          <div>
            <h2 className="font-heading text-base font-semibold text-white">Layanan</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {services.slice(0, 6).map((s) => (
                <li key={s.id}>
                  <Link href={`/layanan#${s.slug}`} className="hover:text-white hover:underline">
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h2 className="font-heading text-base font-semibold text-white">Kontak</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <Mail aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              {settings.contact_email ? (
                <a href={`mailto:${settings.contact_email}`} className="break-all hover:text-white hover:underline">
                  {settings.contact_email}
                </a>
              ) : (
                <span>[DIISI FAI: email bisnis]</span>
              )}
            </li>
            {wa && settings.whatsapp_number && (
              <li className="flex items-start gap-2">
                <WhatsAppIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                <a href={wa} target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline">
                  {formatPhoneDisplay(settings.whatsapp_number)}
                </a>
              </li>
            )}
            {settings.address && (
              <li className="flex items-start gap-2">
                <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                <span className="whitespace-pre-line">{settings.address}</span>
              </li>
            )}
          </ul>
          {socials.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {socials.map(([name, url]) => (
                <li key={name}>
                  <a href={url} target="_blank" rel="noopener noreferrer" className="capitalize hover:text-white hover:underline">
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className={`${container} flex flex-col gap-2 py-6 text-sm sm:flex-row sm:items-center sm:justify-between`}>
          <p>
            &copy; {year} [DIISI FAI: nama usaha/badan hukum]. Hak cipta dilindungi.
          </p>
          <Link href="/kebijakan-privasi" className="hover:text-white hover:underline">
            Kebijakan Privasi
          </Link>
        </div>
      </div>
    </footer>
  );
}
