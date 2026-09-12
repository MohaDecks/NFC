import { Briefcase, Globe, MapPin, MessageCircle, Phone, Stethoscope, UserRound } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useBranding } from "@/hooks/useBranding";
import type { PublicProfile } from "@/types";
import { mediaSrc } from "@/lib/media";
import { mapsLink, profileUrl, websiteLink, whatsappLink } from "@/lib/utils";
import { fullAddress } from "@/lib/media";
import { LocationSection } from "./LocationSection";

function NfcMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M7.5 9.5c2.8-2.8 6.2-2.8 9 0" strokeLinecap="round" />
      <path d="M5.2 6.8c4.2-4.2 9.4-4.2 13.6 0" strokeLinecap="round" />
      <path d="M9.8 12.4c1.4-1.4 3-1.4 4.4 0" strokeLinecap="round" />
      <circle cx="12" cy="16.2" r="1.15" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function DoctorPlace({ profile }: { profile: PublicProfile }) {
  const { brandName, logoUrl } = useBranding();
  const name = profile.name?.trim() || "Doctor";
  const title = profile.tagline?.trim() || "General practitioner";
  const photo = profile.media.avatarUrl || profile.media.logoUrl;
  const url = typeof window !== "undefined" ? profileUrl(profile.publicId) : `/p/${profile.publicId}`;
  const address = fullAddress(profile.location);
  const maps = mapsLink(address, profile.location.mapsUrl, profile.location.latitude, profile.location.longitude);
  const phone = profile.contact.phone;
  const wa = whatsappLink(profile.contact.whatsapp || profile.contact.phone);
  const site = websiteLink(profile.contact.website);
  const bookHref = wa || (phone ? `tel:${phone}` : "#contact");

  const shortcuts = [
    { href: "#about", label: "About", icon: UserRound },
    { href: "#services", label: "Services", icon: Briefcase },
    { href: "#location", label: "Location", icon: MapPin },
    { href: "#contact", label: "Contact", icon: Phone },
  ];

  const dock = [
    phone ? { href: `tel:${phone}`, label: "Call", icon: Phone } : null,
    wa ? { href: wa, label: "WhatsApp", icon: MessageCircle, external: true } : null,
    maps ? { href: maps, label: "Location", icon: MapPin, external: true } : null,
    site ? { href: site, label: "Website", icon: Globe, external: true } : null,
  ].filter(Boolean) as { href: string; label: string; icon: typeof Phone; external?: boolean }[];

  return (
    <div className="min-h-screen bg-white xl:flex xl:items-center xl:justify-center xl:gap-12 xl:bg-[#E8F1FF] xl:px-8 xl:py-10">
      <aside className="hidden w-[260px] shrink-0 flex-col gap-6 text-[#0F2744] xl:flex">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#1D4ED8]">Doctor profile</p>
          <h2 className="mt-2 text-[26px] font-semibold leading-tight tracking-tight">Your health. Our priority.</h2>
        </div>
        <div>
          <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-[#1D4ED8]/70">Front side</p>
          <PersonCardFace name={name} title={title} photo={photo} brandLogo={logoUrl} tone="doctor" />
        </div>
        <div>
          <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-[#1D4ED8]/70">Back side</p>
          <PersonCardBack label="Book appointment" brandName={brandName} qrValue={url} />
        </div>
      </aside>

      <div className="mx-auto w-full max-w-[390px] overflow-hidden bg-white xl:rounded-[40px] xl:border-[10px] xl:border-[#111111] xl:shadow-[0_40px_80px_rgba(15,23,42,0.18)]">
        <div className="relative min-h-screen bg-white xl:min-h-[760px] xl:max-h-[800px] xl:overflow-y-auto">
          <div className="px-5 pb-28 pt-8">
            <div className="flex flex-col items-center text-center">
              {photo ? (
                <img src={mediaSrc(photo, 360)} alt="" className="h-24 w-24 rounded-full object-cover ring-4 ring-[#E8F1FF]" />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#1D4ED8] text-white ring-4 ring-[#E8F1FF]">
                  <Stethoscope className="h-8 w-8" />
                </div>
              )}
              <h1 className="mt-4 text-[24px] font-semibold leading-tight text-[#0F172A]">{name}</h1>
              <p className="mt-1 text-[13px] font-medium text-[#1D4ED8]">{title}</p>
              <p className="mt-1 text-[12px] text-[#64748B]">Your health. Our priority.</p>
            </div>

            <div className="mt-5 grid grid-cols-4 gap-2">
              {shortcuts.map((item) => {
                const Icon = item.icon;
                return (
                  <a key={item.href} href={item.href} className="flex flex-col items-center gap-1.5 text-[11px] font-medium text-[#1E293B]">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF4FF] text-[#1D4ED8]">
                      <Icon className="h-5 w-5" />
                    </span>
                    {item.label}
                  </a>
                );
              })}
            </div>

            <a
              href={bookHref}
              target={bookHref.startsWith("http") ? "_blank" : undefined}
              rel={bookHref.startsWith("http") ? "noreferrer" : undefined}
              className="mt-5 flex h-12 items-center justify-center rounded-full bg-[#1D4ED8] text-[14px] font-semibold text-white"
            >
              Book appointment
            </a>

            <section id="about" className="mt-6">
              <h2 className="text-[16px] font-semibold text-[#0F172A]">About me</h2>
              <p className="mt-2 text-[13px] leading-6 text-[#64748B]">
                {profile.description?.trim() || "Dedicated to providing high-quality healthcare with compassion and care."}
              </p>
            </section>

            <section id="services" className="mt-6">
              <h2 className="text-[16px] font-semibold text-[#0F172A]">Services</h2>
              {profile.services.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {profile.services.map((service) => (
                    <li key={service.id} className="flex items-center gap-2 rounded-2xl bg-[#F8FAFF] px-3 py-2.5 text-[13px] text-[#1E293B]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#1D4ED8]" />
                      {service.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 rounded-2xl bg-[#F8FAFF] px-4 py-6 text-center text-sm text-[#64748B]">Services coming soon.</p>
              )}
            </section>

            <div id="location" className="mt-8">
              <LocationSection profile={profile} tone="doctor" />
            </div>
            <div id="contact" className="h-px w-full" />
          </div>

          {dock.length > 0 && (
            <nav className="sticky bottom-0 border-t border-[#E8F1FF] bg-white/95 px-3 py-2.5 pb-[max(0.65rem,env(safe-area-inset-bottom))] backdrop-blur xl:static">
              <div className="grid grid-cols-4 gap-1">
                {dock.slice(0, 4).map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noreferrer" : undefined}
                      className="flex flex-col items-center gap-1 py-1 text-[10px] font-medium text-[#1E293B]"
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </a>
                  );
                })}
              </div>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}

function PersonCardFace({
  name,
  title,
  photo,
  brandLogo,
  tone,
}: {
  name: string;
  title: string;
  photo?: string | null;
  brandLogo?: string | null;
  tone: "doctor" | "personal" | "engineer";
}) {
  const bg = tone === "doctor" ? "bg-[#1D4ED8]" : tone === "engineer" ? "bg-[#1E3A5F]" : "bg-[#6D28D9]";
  return (
    <div className={`relative aspect-[1.586/1] overflow-hidden rounded-[18px] p-5 text-white shadow-[0_22px_40px_rgba(15,23,42,0.22)] ${bg}`}>
      <div className="flex items-start justify-between">
        {brandLogo ? <img src={brandLogo} alt="" className="h-7 w-auto max-w-14 object-contain brightness-0 invert" /> : <span className="text-[10px] font-semibold">MUBAREK</span>}
        <NfcMark className="h-6 w-6 text-white/80" />
      </div>
      <div className="absolute bottom-5 left-5 right-5 flex items-center gap-3">
        {photo ? (
          <img src={mediaSrc(photo, 160)} alt="" className="h-12 w-12 rounded-full object-cover ring-2 ring-white/40" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
            <UserRound className="h-5 w-5" />
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold leading-tight">{name}</p>
          <p className="truncate text-[11px] text-white/75">{title}</p>
        </div>
      </div>
    </div>
  );
}

function PersonCardBack({
  label,
  brandName,
  qrValue,
}: {
  label: string;
  brandName: string;
  qrValue: string;
}) {
  return (
    <div className="flex aspect-[1.586/1] flex-col items-center justify-between rounded-[18px] bg-white p-5 text-center shadow-[0_22px_40px_rgba(15,23,42,0.12)]">
      <p className="text-[11px] font-medium text-slate-400">Scan or tap</p>
      <QRCodeSVG value={qrValue} size={86} />
      <div>
        <p className="text-[12px] font-semibold text-slate-800">{label}</p>
        <p className="mt-0.5 text-[10px] text-slate-400">{brandName}</p>
      </div>
    </div>
  );
}

export { PersonCardFace, PersonCardBack, NfcMark };
