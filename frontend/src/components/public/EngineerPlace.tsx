import { Briefcase, Camera, FolderKanban, Globe, MapPin, MessageCircle, Phone, UserRound, Wrench } from "lucide-react";
import { useBranding } from "@/hooks/useBranding";
import type { PublicProfile } from "@/types";
import { mediaSrc } from "@/lib/media";
import { mapsLink, profileUrl, websiteLink, whatsappLink } from "@/lib/utils";
import { fullAddress } from "@/lib/media";
import { PersonCardBack, PersonCardFace } from "./DoctorPlace";
import { LocationSection } from "./LocationSection";

export function EngineerPlace({ profile }: { profile: PublicProfile }) {
  const { brandName, logoUrl } = useBranding();
  const name = profile.name?.trim() || "Engineer";
  const title = profile.tagline?.trim() || "Civil engineer";
  const photo = profile.media.avatarUrl || profile.media.logoUrl;
  const cover = profile.media.coverUrl || profile.media.gallery[0] || null;
  const url = typeof window !== "undefined" ? profileUrl(profile.publicId) : `/p/${profile.publicId}`;
  const address = fullAddress(profile.location);
  const maps = mapsLink(address, profile.location.mapsUrl, profile.location.latitude, profile.location.longitude);
  const phone = profile.contact.phone;
  const wa = whatsappLink(profile.contact.whatsapp || profile.contact.phone);
  const site = websiteLink(profile.contact.website);

  const shortcuts = [
    { href: "#about", label: "About", icon: UserRound },
    { href: "#services", label: "Services", icon: Briefcase },
    { href: "#portfolio", label: "Portfolio", icon: Camera },
    { href: "#contact", label: "Contact", icon: Phone },
  ];

  const dock = [
    phone ? { href: `tel:${phone}`, label: "Call", icon: Phone } : null,
    wa ? { href: wa, label: "WhatsApp", icon: MessageCircle, external: true } : null,
    maps ? { href: maps, label: "Location", icon: MapPin, external: true } : null,
    site ? { href: site, label: "Website", icon: Globe, external: true } : null,
  ].filter(Boolean) as { href: string; label: string; icon: typeof Phone; external?: boolean }[];

  return (
    <div className="min-h-screen bg-white xl:flex xl:items-center xl:justify-center xl:gap-12 xl:bg-[#0B1220] xl:px-8 xl:py-10">
      <aside className="hidden w-[260px] shrink-0 flex-col gap-6 text-[#E8EEF8] xl:flex">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#38BDF8]">Engineer profile</p>
          <h2 className="mt-2 text-[26px] font-semibold leading-tight tracking-tight">Build. Design. Innovate.</h2>
        </div>
        <div>
          <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-[#38BDF8]/70">Front side</p>
          <PersonCardFace name={name} title={title} photo={photo} brandLogo={logoUrl} tone="engineer" />
        </div>
        <div>
          <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-[#38BDF8]/70">Back side</p>
          <PersonCardBack label="My projects" brandName={brandName} qrValue={url} />
        </div>
      </aside>

      <div className="mx-auto w-full max-w-[390px] overflow-hidden bg-white xl:rounded-[40px] xl:border-[10px] xl:border-[#111111] xl:shadow-[0_40px_80px_rgba(0,0,0,0.45)]">
        <div className="relative min-h-screen bg-white xl:min-h-[760px] xl:max-h-[800px] xl:overflow-y-auto">
          <div className="px-5 pb-28 pt-8">
            <div className="flex items-center gap-3">
              {photo ? (
                <img src={mediaSrc(photo, 240)} alt="" className="h-16 w-16 rounded-full object-cover ring-4 ring-[#E8EEF8]" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0B1220] text-white ring-4 ring-[#E8EEF8]">
                  <Wrench className="h-6 w-6" />
                </div>
              )}
              <div className="min-w-0">
                <h1 className="truncate text-[20px] font-semibold leading-tight text-[#0B1220]">{name}</h1>
                <p className="text-[13px] font-medium text-[#2563EB]">{title}</p>
                <p className="text-[12px] text-[#64748B]">Building a better tomorrow.</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-4 gap-2">
              {shortcuts.map((item) => {
                const Icon = item.icon;
                return (
                  <a key={item.href} href={item.href} className="flex flex-col items-center gap-1.5 text-[11px] font-medium text-[#1E293B]">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF2FF] text-[#1E3A8A]">
                      <Icon className="h-5 w-5" />
                    </span>
                    {item.label}
                  </a>
                );
              })}
            </div>

            <article id="about" className="mt-5 overflow-hidden rounded-[22px]">
              {cover ? (
                <div className="relative">
                  <img src={mediaSrc(cover, 1100)} alt="" className="h-44 w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <p className="text-[17px] font-semibold leading-tight">Engineering solutions for a better tomorrow</p>
                    {profile.description && <p className="mt-1 line-clamp-2 text-[12px] text-white/80">{profile.description}</p>}
                  </div>
                </div>
              ) : (
                <div className="rounded-[22px] bg-[#EEF2FF] px-5 py-8">
                  <p className="text-[17px] font-semibold text-[#0B1220]">Engineering solutions for a better tomorrow</p>
                  <p className="mt-2 text-[13px] text-[#64748B]">{profile.description?.trim() || title}</p>
                </div>
              )}
            </article>

            <section id="services" className="mt-6">
              <h2 className="text-[16px] font-semibold text-[#0B1220]">My services</h2>
              {profile.services.length > 0 ? (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {profile.services.slice(0, 6).map((service) => (
                    <div key={service.id} className="rounded-2xl bg-[#F8FAFF] px-3 py-4 text-center">
                      <FolderKanban className="mx-auto h-5 w-5 text-[#1E3A8A]" />
                      <p className="mt-2 text-[12px] font-medium text-[#1E293B]">{service.name}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 rounded-2xl bg-[#F8FAFF] px-4 py-8 text-center text-sm text-[#64748B]">Services coming soon.</p>
              )}
            </section>

            {profile.media.gallery.length > 0 && (
              <section id="portfolio" className="mt-6">
                <h2 className="text-[16px] font-semibold text-[#0B1220]">Portfolio</h2>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {profile.media.gallery.slice(0, 4).map((src) => (
                    <img key={src} src={mediaSrc(src, 600)} alt="" className="h-24 w-full rounded-2xl object-cover" />
                  ))}
                </div>
              </section>
            )}

            <div id="location" className="mt-8">
              <LocationSection profile={profile} tone="business" />
            </div>
            <div id="contact" className="h-px w-full" />
          </div>

          {dock.length > 0 && (
            <nav className="sticky bottom-0 border-t border-[#EEF2FF] bg-white/95 px-3 py-2.5 pb-[max(0.65rem,env(safe-area-inset-bottom))] backdrop-blur xl:static">
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
