import { Camera, Coffee, Globe, MapPin, MessageCircle, Phone, UtensilsCrossed } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useBranding } from "@/hooks/useBranding";
import type { PublicMenuItem, PublicProfile } from "@/types";
import { mediaSrc } from "@/lib/media";
import { formatPrice, mapsLink, profileUrl, websiteLink, whatsappLink } from "@/lib/utils";
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

export function CafeteriaPlace({ profile }: { profile: PublicProfile }) {
  const { brandName, logoUrl } = useBranding();
  const items = profile.menu.flatMap((category) => category.items.filter((item) => item.available !== false));
  const featured = items.find((item) => item.featured && item.imageUrl) || items.find((item) => item.imageUrl) || null;
  const name = profile.name?.trim() || "Cafeteria";
  const tagline = profile.tagline?.trim() || "Great coffee. Brighter days.";
  const cover = profile.media.coverUrl || featured?.imageUrl || profile.media.gallery[0] || null;
  const url = typeof window !== "undefined" ? profileUrl(profile.publicId) : `/p/${profile.publicId}`;
  const address = fullAddress(profile.location);
  const maps = mapsLink(address, profile.location.mapsUrl, profile.location.latitude, profile.location.longitude);
  const phone = profile.contact.phone;
  const wa = whatsappLink(profile.contact.whatsapp || profile.contact.phone);
  const site = websiteLink(profile.contact.website);

  const shortcuts = [
    { href: "#menu", label: "Menu", icon: UtensilsCrossed },
    { href: "#gallery", label: "Gallery", icon: Camera },
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
    <div className="min-h-screen bg-white xl:flex xl:items-center xl:justify-center xl:gap-12 xl:bg-[#052E16] xl:px-8 xl:py-10">
      <aside className="hidden w-[260px] shrink-0 flex-col gap-6 text-[#E8F5E9] xl:flex">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#86EFAC]">Cafeteria profile</p>
          <h2 className="mt-2 text-[26px] font-semibold leading-tight tracking-tight">Great coffee. Brighter days.</h2>
        </div>
        <div>
          <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-[#86EFAC]/70">Front side</p>
          <CafeteriaCardFace name={name} brandName={brandName} logoUrl={logoUrl || profile.media.logoUrl} />
        </div>
        <div>
          <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-[#86EFAC]/70">Back side</p>
          <CafeteriaCardBack brandName={brandName} qrValue={url} />
        </div>
      </aside>

      <div className="mx-auto w-full max-w-[390px] overflow-hidden bg-white xl:rounded-[40px] xl:border-[10px] xl:border-[#111111] xl:shadow-[0_40px_80px_rgba(0,0,0,0.45)]">
        <div className="relative min-h-screen bg-white xl:min-h-[760px] xl:max-h-[800px] xl:overflow-y-auto">
          <header className="relative">
            {cover ? (
              <img src={mediaSrc(cover, 1200)} alt="" className="h-[200px] w-full object-cover" />
            ) : (
              <div className="h-[168px] w-full bg-[radial-gradient(circle_at_20%_20%,#86EFAC_0%,#047857_48%,#052E16_100%)]" />
            )}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
          </header>

          <div className="relative -mt-8 px-5 pb-28">
            <div className="text-center">
              <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-[#052E16]">{name}</h1>
              <p className="mt-1 text-[13px] text-[#6B7280]">{tagline}</p>
            </div>

            <div className="mt-5 grid grid-cols-4 gap-2">
              {shortcuts.map((item) => {
                const Icon = item.icon;
                return (
                  <a key={item.href} href={item.href} className="flex flex-col items-center gap-1.5 text-[11px] font-medium text-[#14532D]">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ECFDF5] text-[#047857]">
                      <Icon className="h-5 w-5" />
                    </span>
                    {item.label}
                  </a>
                );
              })}
            </div>

            <article className="mt-5 overflow-hidden rounded-[22px]">
              {featured?.imageUrl || cover ? (
                <div className="relative">
                  <img src={mediaSrc(featured?.imageUrl || cover, 1100)} alt="" className="h-40 w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <p className="text-[18px] font-semibold leading-tight">{featured?.name || "Life begins after coffee"}</p>
                    <p className="mt-1 text-[12px] text-white/80">{featured?.description || tagline}</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-[22px] bg-[#ECFDF5] px-5 py-8 text-center">
                  <p className="text-[18px] font-semibold text-[#052E16]">Life begins after coffee</p>
                  <p className="mt-1 text-[13px] text-[#6B7280]">{tagline}</p>
                </div>
              )}
            </article>

            <section id="menu" className="mt-6">
              <h2 className="mb-3 text-[16px] font-semibold text-[#052E16]">Menu</h2>
              <div className="space-y-1">
                {items.map((item) => (
                  <MenuLine key={item.id} item={item} />
                ))}
                {items.length === 0 && (
                  <p className="rounded-2xl bg-[#ECFDF5] px-4 py-8 text-center text-sm text-[#6B7280]">Menu coming soon.</p>
                )}
              </div>
            </section>

            {profile.media.gallery.length > 0 && (
              <div id="gallery" className="mt-8 grid grid-cols-2 gap-2">
                {profile.media.gallery.slice(0, 4).map((src) => (
                  <img key={src} src={mediaSrc(src, 600)} alt="" className="h-24 w-full rounded-2xl object-cover" />
                ))}
              </div>
            )}

            <div id="location" className="mt-8">
              <LocationSection profile={profile} tone="business" />
            </div>
            <div id="contact" className="h-px w-full" />
          </div>

          {dock.length > 0 && (
            <nav className="sticky bottom-0 border-t border-[#ECFDF5] bg-white/95 px-3 py-2.5 pb-[max(0.65rem,env(safe-area-inset-bottom))] backdrop-blur xl:static">
              <div className="grid grid-cols-4 gap-1">
                {dock.slice(0, 4).map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noreferrer" : undefined}
                      className="flex flex-col items-center gap-1 py-1 text-[10px] font-medium text-[#14532D]"
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

function MenuLine({ item }: { item: PublicMenuItem }) {
  return (
    <article className="flex items-center gap-3 border-b border-[#F1F5F3] py-3 last:border-0">
      {item.imageUrl ? (
        <img src={mediaSrc(item.imageUrl, 160)} alt="" className="h-10 w-10 rounded-full object-cover" />
      ) : (
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ECFDF5] text-[#047857]">
          <Coffee className="h-4 w-4" />
        </span>
      )}
      <p className="min-w-0 flex-1 truncate text-[14px] font-medium text-[#052E16]">{item.name}</p>
      <p className="shrink-0 text-[14px] font-semibold tabular-nums text-[#052E16]">{formatPrice(item.price, item.currency)}</p>
    </article>
  );
}

function CafeteriaCardFace({
  name,
  brandName,
  logoUrl,
}: {
  name: string;
  brandName: string;
  logoUrl?: string | null;
}) {
  return (
    <div className="relative aspect-[1.586/1] overflow-hidden rounded-[18px] bg-[#064E3B] p-5 text-[#ECFDF5] shadow-[0_22px_40px_rgba(0,0,0,0.35)]">
      <div className="flex items-start justify-between">
        {logoUrl ? <img src={logoUrl} alt="" className="h-8 w-auto max-w-16 object-contain" /> : <p className="text-[10px] font-semibold tracking-wide">{brandName}</p>}
        <NfcMark className="h-6 w-6 text-[#86EFAC]" />
      </div>
      <div className="absolute bottom-5 left-5 right-5">
        <p className="text-[16px] font-semibold leading-tight">{name}</p>
        <p className="mt-1 text-[11px] text-[#86EFAC]">Cafeteria</p>
      </div>
    </div>
  );
}

function CafeteriaCardBack({ brandName, qrValue }: { brandName: string; qrValue: string }) {
  return (
    <div className="flex aspect-[1.586/1] flex-col items-center justify-between rounded-[18px] bg-white p-5 text-center shadow-[0_22px_40px_rgba(0,0,0,0.28)]">
      <p className="text-[11px] font-medium text-slate-400">Scan or tap</p>
      <QRCodeSVG value={qrValue} size={86} />
      <div>
        <p className="text-[12px] font-semibold text-slate-800">Our menu</p>
        <p className="mt-0.5 text-[10px] text-slate-400">{brandName}</p>
      </div>
    </div>
  );
}
