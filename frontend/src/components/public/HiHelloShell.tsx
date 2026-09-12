import type { ReactNode } from "react";
import { Download, Globe, Mail, Phone } from "lucide-react";
import { useBranding } from "@/hooks/useBranding";
import type { PublicProfile } from "@/types";
import { collectSocials } from "@/lib/collectSocials";
import { mediaSrc } from "@/lib/media";
import { buildVCard, downloadTextFile, websiteLink, whatsappLink } from "@/lib/utils";
import { SocialBrandIcon } from "./SocialBrandIcon";

type Row = {
  href: string;
  label: string;
  caption: string;
  icon?: typeof Phone;
  social?: ReturnType<typeof collectSocials>[number]["kind"];
  external?: boolean;
};

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
  const photo = profile.media.avatarUrl || profile.media.coverUrl;
  const logo = profile.media.logoUrl && profile.media.logoUrl !== photo ? profile.media.logoUrl : null;
  const socials = collectSocials(profile);
  const phone = profile.contact.phone;
  const wa = whatsappLink(profile.contact.whatsapp || profile.contact.phone);
  const email = profile.contact.email;
  const site = websiteLink(profile.contact.website);
  const accent = profile.design.primaryColor || "#6D28D9";

  const rows: Row[] = [
    email ? { href: `mailto:${email}`, label: email, caption: "Personal", icon: Mail } : null,
    phone ? { href: `tel:${phone}`, label: phone, caption: "Office", icon: Phone } : null,
    profile.contact.whatsapp && profile.contact.whatsapp !== phone
      ? { href: `tel:${profile.contact.whatsapp}`, label: profile.contact.whatsapp, caption: "Main", icon: Phone }
      : null,
    wa ? { href: wa, label: "WhatsApp", caption: "Message", social: "whatsapp" as const, external: true } : null,
    site ? { href: site, label: profile.contact.website || "Website", caption: "Website", icon: Globe, external: true } : null,
    ...socials
      .filter((link) => link.kind !== "whatsapp")
      .map((link) => ({
        href: link.href,
        label: link.label,
        caption: link.label,
        social: link.kind,
        external: true,
      })),
  ].filter(Boolean) as Row[];

  function saveContact() {
    downloadTextFile(`${name}.vcf`, buildVCard(profile), "text/vcard");
  }

  return (
    <div className="min-h-[100svh] w-full overflow-x-hidden bg-white text-[#111827]">
      <div id="top" className="relative w-full">
        <div className="h-[min(78vw,440px)] w-full overflow-hidden bg-[#1F2937]">
          {photo ? (
            <img src={mediaSrc(photo, 1600, "fill")} alt="" className="h-full w-full object-cover object-[center_20%]" />
          ) : (
            <div className="flex h-full w-full items-end justify-center pb-16" style={{ background: `linear-gradient(180deg, ${accent} 0%, #111827 100%)` }}>
              <span className="text-6xl font-semibold text-white/90">{name[0]}</span>
            </div>
          )}
        </div>
        <svg className="absolute inset-x-0 -bottom-px h-16 w-full" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden>
          <path d="M0 64C180 20 420 8 720 40C1020 72 1260 72 1440 28V80H0Z" fill="white" />
        </svg>
        <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-end px-6">
          {logo ? (
            <img src={mediaSrc(logo, 200)} alt="" className="h-11 w-11 rounded-full bg-white object-contain p-1 shadow-sm ring-2 ring-white" />
          ) : (
            <span className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold text-white shadow-sm ring-2 ring-white" style={{ background: accent }}>
              {name[0]}
            </span>
          )}
        </div>
      </div>

      <div className="mx-auto w-full max-w-[430px] px-6 pb-8">
        <div className="pt-6 text-center">
          <h1 className="text-[28px] font-semibold leading-tight tracking-tight">{name}</h1>
          {title && <p className="mt-2 text-[16px] leading-6 text-[#6B7280]">{title}</p>}
          {company && (
            <p className="mt-1 text-[16px] font-medium leading-6" style={{ color: accent }}>
              {company}
            </p>
          )}
        </div>

        {about && (
          <p className="mt-7 text-[15px] leading-8 text-[#4B5563] whitespace-pre-line">
            {about}
          </p>
        )}

        {cta && (
          <a
            href={cta.href}
            target={cta.href.startsWith("http") ? "_blank" : undefined}
            rel={cta.href.startsWith("http") ? "noreferrer" : undefined}
            className="mt-8 flex h-12 w-full items-center justify-center rounded-full text-[13px] font-semibold uppercase tracking-[0.14em] text-white"
            style={{ background: accent }}
          >
            {cta.label}
          </a>
        )}

        <button
          type="button"
          onClick={saveContact}
          className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-full text-[13px] font-semibold uppercase tracking-[0.14em] text-white"
          style={{ background: accent }}
        >
          <Download className="h-4 w-4" />
          Save contact
        </button>
      </div>

      {rows.length > 0 && (
        <section className="mx-auto w-full max-w-[430px] px-6">
          {rows.map((row) => {
            const Icon = row.icon;
            return (
              <a
                key={`${row.caption}-${row.label}-${row.href}`}
                href={row.href}
                target={row.external ? "_blank" : undefined}
                rel={row.external ? "noreferrer" : undefined}
                className="flex items-center gap-4 border-b border-[#F3F4F6] py-4"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white" style={{ background: accent }}>
                  {row.social ? <SocialBrandIcon kind={row.social} className="h-5 w-5" /> : Icon ? <Icon className="h-5 w-5" /> : null}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[16px] font-medium">{row.label}</span>
                  <span className="mt-0.5 block text-[13px] capitalize text-[#9CA3AF]">{row.caption}</span>
                </span>
              </a>
            );
          })}
        </section>
      )}

      <div className="mx-auto w-full max-w-[430px] px-6">
        <button
          type="button"
          onClick={saveContact}
          className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-full text-[13px] font-semibold uppercase tracking-[0.14em] text-white"
          style={{ background: accent }}
        >
          <Download className="h-4 w-4" />
          Save contact
        </button>

        {children ? <div className="mt-10 overflow-hidden">{children}</div> : null}
      </div>

      <footer className="mt-10 w-full" style={{ background: accent }}>
        <p className="px-6 py-3 text-center text-[12px] text-white/90">
          {brandName ? `A digital business card from ${brandName}` : "Digital business card"}
        </p>
      </footer>
    </div>
  );
}
