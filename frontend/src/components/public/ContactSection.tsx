import { Globe, Mail, MessageCircle, Phone } from "lucide-react";
import type { PublicProfile } from "@/types";
import { websiteLink, whatsappLink } from "@/lib/utils";
import { cardClass, mutedClass, sectionTitleClass, type PublicTone } from "./tone";

export function ContactSection({ profile, tone }: { profile: PublicProfile; tone: PublicTone }) {
  const { contact } = profile;
  const wa = whatsappLink(contact.whatsapp || contact.phone);
  const site = websiteLink(contact.website);
  const rows = [
    contact.phone ? { href: `tel:${contact.phone}`, label: contact.phone, icon: Phone, caption: "Phone" } : null,
    wa ? { href: wa, label: contact.whatsapp || contact.phone, icon: MessageCircle, caption: "WhatsApp", external: true } : null,
    contact.email ? { href: `mailto:${contact.email}`, label: contact.email, icon: Mail, caption: "Email" } : null,
    site ? { href: site, label: contact.website, icon: Globe, caption: "Website", external: true } : null,
  ].filter(Boolean) as { href: string; label: string; icon: typeof Phone; caption: string; external?: boolean }[];

  if (!rows.length) return null;

  return (
    <section className={cardClass(tone)}>
      <h2 className={sectionTitleClass(tone)} style={tone === "luxury" || tone === "hotel" ? undefined : { color: "var(--p)" }}>
        Contact
      </h2>
      <div className="grid gap-3 @md:grid-cols-2">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <a
              key={row.caption}
              href={row.href}
              target={row.external ? "_blank" : undefined}
              rel={row.external ? "noreferrer" : undefined}
              className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-black/5"
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ background: "color-mix(in oklab, var(--p) 14%, transparent)", color: "var(--p)" }}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span>
                <span className={`block text-xs uppercase tracking-wide ${mutedClass(tone)}`}>{row.caption}</span>
                <span className="text-sm font-medium">{row.label}</span>
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
