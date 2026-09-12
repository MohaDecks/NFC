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
  const cover = profile.media.coverUrl;
  const socials = collectSocials(profile);
  const phone = profile.contact.phone;
  const wa = whatsappLink(profile.contact.whatsapp || profile.contact.phone);
  const email = profile.contact.email;
  const site = websiteLink(profile.contact.website);
  const accent = profile.design.primaryColor || "#6D28D9";

  const contacts = [
    email ? { href: `mailto:${email}`, label: email, caption: "Email", icon: Mail } : null,
    phone ? { href: `tel:${phone}`, label: phone, caption: "Phone", icon: Phone } : null,
    wa ? { href: wa, label: profile.contact.whatsapp || phone, caption: "WhatsApp", icon: Phone, external: true } : null,
    site ? { href: site, label: profile.contact.website, caption: "Website", icon: Globe, external: true } : null,
  ].filter(Boolean) as { href: string; label: string; caption: string; icon: typeof Phone; external?: boolean }[];

  return (
    <div className="min-h-[100svh] overflow-x-hidden bg-[#F6F7FB] text-[#111827]">
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[430px] items-center justify-between gap-3 px-4">
          <a href="#top" className="flex min-w-0 items-center gap-2">
            {mark ? (
              <img src={mediaSrc(mark, 80)} alt="" className="h-8 w-8 rounded-lg object-contain" />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold text-white" style={{ background: accent }}>
                {name[0]}
              </span>
            )}
            <span className="truncate text-sm font-semibold">{name}</span>
          </a>
          {phone ? (
            <a href={`tel:${phone}`} className="shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold text-white" style={{ background: accent }}>
              Call
            </a>
          ) : wa ? (
            <a href={wa} className="shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold text-white" style={{ background: accent }}>
              WhatsApp
            </a>
          ) : null}
        </div>
      </header>

      <div id="top" className="relative overflow-hidden" style={{ background: accent }}>
        {cover && <img src={mediaSrc(cover, 1600, "fill")} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />}
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${accent} 0%, color-mix(in oklab, ${accent} 70%, #111827) 100%)` }} />
        <div className="absolute inset-x-0 bottom-[-1px] h-[72px] bg-[#F6F7FB] [clip-path:ellipse(92%_100%_at_50%_100%)]" />
        <div className="relative flex justify-center px-6 pb-16 pt-12">
          {mark ? (
            <img
              src={mediaSrc(mark, 720)}
              alt=""
              className="max-h-40 w-auto max-w-[220px] rounded-[28px] bg-white object-contain p-2 shadow-[0_16px_40px_rgba(0,0,0,0.18)] ring-4 ring-white"
            />
          ) : (
            <div
              className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-white text-2xl font-semibold shadow-[0_16px_40px_rgba(0,0,0,0.18)] ring-4 ring-white"
              style={{ color: accent }}
            >
              {name[0]}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto w-full max-w-[430px] px-5 pb-10">
        <div className="text-center">
          <h1 className="text-[30px] font-semibold leading-tight tracking-tight">{name}</h1>
          {title && <p className="mt-1 text-[15px] text-[#6B7280]">{title}</p>}
          {company && (
            <p className="mt-1 text-[15px] font-semibold" style={{ color: accent }}>
              {company}
            </p>
          )}
        </div>

        {about && (
          <p className="mx-auto mt-6 max-w-[36ch] text-center text-[15px] leading-7 text-[#4B5563] whitespace-pre-line">
            {about}
          </p>
        )}

        {cta && (
          <a
            href={cta.href}
            target={cta.href.startsWith("http") ? "_blank" : undefined}
            rel={cta.href.startsWith("http") ? "noreferrer" : undefined}
            className="mt-7 flex h-12 w-full items-center justify-center rounded-full text-[13px] font-semibold uppercase tracking-[0.16em] text-white shadow-sm"
            style={{ background: accent }}
          >
            {cta.label}
          </a>
        )}

        <button
          type="button"
          onClick={() => downloadTextFile(`${name}.vcf`, buildVCard(profile), "text/vcard")}
          className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#111827] text-[13px] font-semibold uppercase tracking-[0.16em] text-white"
        >
          <Download className="h-4 w-4" />
          Save contact
        </button>

        {contacts.length > 0 && (
          <section className="mt-8 overflow-hidden rounded-[24px] bg-white shadow-[0_10px_30px_rgba(17,24,39,0.05)]">
            {contacts.map((row, index) => {
              const Icon = row.icon;
              return (
                <a
                  key={`${row.caption}-${row.label}`}
                  href={row.href}
                  target={row.external ? "_blank" : undefined}
                  rel={row.external ? "noreferrer" : undefined}
                  className={`flex items-center gap-3 px-4 py-3.5 ${index > 0 ? "border-t border-[#F3F4F6]" : ""}`}
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: `${accent}14`, color: accent }}>
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
          <section className="mt-6 flex flex-wrap justify-center gap-3">
            {socials.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                aria-label={link.label}
                className="flex h-[52px] w-[52px] items-center justify-center rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5"
                style={{
                  background: SOCIAL_COLORS[link.kind],
                  color: link.kind === "snapchat" ? "#111827" : "#fff",
                }}
              >
                <SocialBrandIcon kind={link.kind} className="h-6 w-6" />
              </a>
            ))}
          </section>
        )}

        <div className="overflow-hidden">{children}</div>
      </div>

      <footer className="mt-4 border-t border-black/5 bg-white">
        <div className="mx-auto flex max-w-[430px] flex-col items-center gap-4 px-5 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <p className="text-center text-sm font-semibold">{name}</p>
          {title && <p className="-mt-2 text-center text-[12px] text-[#6B7280]">{title}</p>}
          <div className="flex flex-wrap justify-center gap-2">
            {phone && (
              <a href={`tel:${phone}`} className="rounded-full bg-[#F3F4F6] px-3 py-1.5 text-[12px] font-medium">
                Call
              </a>
            )}
            {wa && (
              <a href={wa} target="_blank" rel="noreferrer" className="rounded-full bg-[#F3F4F6] px-3 py-1.5 text-[12px] font-medium">
                WhatsApp
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`} className="rounded-full bg-[#F3F4F6] px-3 py-1.5 text-[12px] font-medium">
                Email
              </a>
            )}
          </div>
          <p className="text-[11px] text-[#9CA3AF]">{brandName}</p>
        </div>
      </footer>
    </div>
  );
}
