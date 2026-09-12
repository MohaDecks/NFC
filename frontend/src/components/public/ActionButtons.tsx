import { Globe, Mail, MapPin, MessageCircle, Phone, UserPlus } from "lucide-react";
import type { PublicProfile } from "@/types";
import { buildVCard, downloadTextFile, mapsLink, websiteLink, whatsappLink } from "@/lib/utils";
import { fullAddress } from "@/lib/media";
import { cn } from "@/lib/utils";

export function ActionButtons({ profile }: { profile: PublicProfile }) {
  const { contact, location } = profile;
  const wa = whatsappLink(contact.whatsapp || contact.phone);
  const maps = mapsLink(fullAddress(location), location.mapsUrl, location.latitude, location.longitude);
  const site = websiteLink(contact.website);
  const filled = { background: "var(--p)", color: "#fff", borderRadius: "var(--btn-radius)" };
  const outline = {
    background: "color-mix(in oklab, var(--p) 10%, transparent)",
    color: "var(--p)",
    borderRadius: "var(--btn-radius)",
  };

  const actions = [
    contact.phone ? { href: `tel:${contact.phone}`, label: "Call", icon: Phone, primary: true } : null,
    wa ? { href: wa, label: "WhatsApp", icon: MessageCircle, primary: true, external: true } : null,
    contact.email ? { href: `mailto:${contact.email}`, label: "Email", icon: Mail } : null,
    maps ? { href: maps, label: "Location", icon: MapPin, external: true } : null,
    site ? { href: site, label: "Website", icon: Globe, external: true } : null,
  ].filter(Boolean) as {
    href: string;
    label: string;
    icon: typeof Phone;
    primary?: boolean;
    external?: boolean;
  }[];

  if (!actions.length && !profile.name) return null;

  return (
    <div className="public-in">
      <div className="flex flex-wrap justify-center gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <a
              key={action.label}
              href={action.href}
              target={action.external ? "_blank" : undefined}
              rel={action.external ? "noreferrer" : undefined}
              className={cn(
                "inline-flex h-11 items-center justify-center gap-1.5 px-4 text-[13px] font-semibold transition hover:-translate-y-0.5",
              )}
              style={action.primary ? filled : outline}
            >
              <Icon className="h-4 w-4" />
              {action.label}
            </a>
          );
        })}
        <button
          type="button"
          className="inline-flex h-11 items-center justify-center gap-1.5 px-4 text-[13px] font-semibold transition hover:-translate-y-0.5"
          style={outline}
          onClick={() => downloadTextFile(`${profile.name || "contact"}.vcf`, buildVCard(profile), "text/vcard")}
        >
          <UserPlus className="h-4 w-4" />
          Save
        </button>
      </div>
    </div>
  );
}
