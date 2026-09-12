import type { ReactNode } from "react";
import { Download, Globe, Mail, Phone } from "lucide-react";
import { useBranding } from "@/hooks/useBranding";
import type { PublicProfile } from "@/types";
import { collectSocials } from "@/lib/collectSocials";
import { mediaSrc } from "@/lib/media";
import { buildVCard, downloadTextFile, websiteLink, whatsappLink } from "@/lib/utils";
import { SOCIAL_COLORS, SocialBrandIcon } from "./SocialBrandIcon";

export function HiHelloShell({
  profile,
  kindLabel,
  cta,
  children,
}: {
  profile: PublicProfile;
  kindLabel?: string;
  cta?: { href: string; label: string };
  children?: ReactNode;
}) {
  const { brandName } = useBranding();
  const name = profile.name?.trim() || "Digital card";
  const title = profile.tagline?.trim() || "";
  const company =
    kindLabel ||
    (brandName && brandName.toLowerCase() !== name.toLowerCase() ? brandName : "");
  const about = profile.description?.trim() || "";
  const mark = profile.media.logoUrl || profile.media.avatarUrl;
  const socials = collectSocials(profile);
  const phone = profile.contact.phone;
  const wa = whatsappLink(profile.contact.whatsapp || profile.contact.phone);
  const email = profile.contact.email;
  const site = websiteLink(profile.contact.website);
  const accent = profile.design.primaryColor || "#7C3AED";

  const contacts = [
    email ? { href: `mailto:${email}`, label: email, caption: "personal", icon: Mail } : null,
    phone ? { href: `tel:${phone}`, label: phone, caption: "office", icon: Phone } : null,
    profile.contact.whatsapp && wa
      ? { href: wa, label: profile.contact.whatsapp, caption: "whatsapp", icon: Phone, external: true }
      : null,
    site ? { href: site, label: profile.contact.website, caption: "website", icon: Globe, external: true } : null,
  ].filter(Boolean) as { href: string; label: string; caption: string; icon: typeof Phone; external?: boolean }[];

  return (
    <div className="min-h-[100svh] bg-[#F4F5F8] text-[#111827]">
      <div className="relative overflow-hidden" style={{ background: accent }}>
        <div className="absolute inset-x-0 bottom-[-1px] h-16 bg-[#F4F5F8] [clip-path:ellipse(80%_100%_at_50%_100%)]" />
        <div className="flex justify-center px-6 pb-14 pt-10">
          {mark ? (
            <img src={mediaSrc(mark, 220)} alt="" className="h-16 w-16 rounded-full bg-white object-contain p-1 shadow-sm" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-lg font-semibold" style={{ color: accent }}>
              {name[0]}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto w-full max-w-[430px] px-6 pb-16">
        <div className="border-l-[3px] pl-4" style={{ borderColor: accent }}>
          <h1 className="text-[28px] font-semibold leading-tight tracking-tight">{name}</h1>
          {title && <p className="mt-1 text-[15px] text-[#6B7280]">{title}</p>}
          {company && (
            <p className="mt-1 text-[15px] font-medium" style={{ color: accent }}>
              {company}
            </p>
          )}
        </div>

        {about && <p className="mt-6 whitespace-pre-line text-[15px] leading-7 text-[#374151]">{about}</p>}

        {cta && (
          <a
            href={cta.href}
            target={cta.href.startsWith("http") ? "_blank" : undefined}
            rel={cta.href.startsWith("http") ? "noreferrer" : undefined}
            className="mt-7 flex h-12 w-full items-center justify-center rounded-full text-[13px] font-semibold uppercase tracking-[0.14em] text-white"
            style={{ background: accent }}
          >
            {cta.label}
          </a>
        )}

        <button
          type="button"
          onClick={() => downloadTextFile(`${name}.vcf`, buildVCard(profile), "text/vcard")}
          className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#111827] text-[13px] font-semibold uppercase tracking-[0.14em] text-white"
        >
          <Download className="h-4 w-4" />
          Save contact
        </button>

        {contacts.length > 0 && (
          <section className="mt-8 space-y-1">
            {contacts.map((row) => {
              const Icon = row.icon;
              return (
                <a
                  key={`${row.caption}-${row.label}`}
                  href={row.href}
                  target={row.external ? "_blank" : undefined}
                  rel={row.external ? "noreferrer" : undefined}
                  className="flex items-center gap-3 rounded-2xl px-2 py-3 hover:bg-white"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm" style={{ color: accent }}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[15px] font-medium">{row.label}</span>
                    <span className="text-[12px] text-[#9CA3AF]">{row.caption}</span>
                  </span>
                </a>
              );
            })}
          </section>
        )}

        {socials.length > 0 && (
          <section className="mt-6">
            <div className="flex flex-wrap justify-center gap-3">
              {socials.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={link.label}
                  className="flex h-12 w-12 items-center justify-center rounded-full shadow-sm transition hover:-translate-y-0.5"
                  style={{
                    background: SOCIAL_COLORS[link.kind],
                    color: link.kind === "snapchat" ? "#111827" : "#fff",
                  }}
                >
                  <SocialBrandIcon kind={link.kind} className="h-6 w-6" />
                </a>
              ))}
            </div>
            <div className="mt-3 space-y-1">
              {socials.map((link) => (
                <a
                  key={`row-${link.href}`}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-2xl px-2 py-3 hover:bg-white"
                >
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{
                      background: SOCIAL_COLORS[link.kind],
                      color: link.kind === "snapchat" ? "#111827" : "#fff",
                    }}
                  >
                    <SocialBrandIcon kind={link.kind} className="h-5 w-5" />
                  </span>
                  <span className="text-[15px] font-medium">{link.label}</span>
                </a>
              ))}
            </div>
          </section>
        )}

        {children}
      </div>
    </div>
  );
}
