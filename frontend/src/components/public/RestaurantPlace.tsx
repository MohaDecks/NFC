import { useMemo, useState } from "react";
import { Camera, Globe, MapPin, MessageCircle, Phone, UtensilsCrossed } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useBranding } from "@/hooks/useBranding";
import type { PublicMenuItem, PublicProfile } from "@/types";
import { mediaSrc } from "@/lib/media";
import { formatPrice, mapsLink, profileUrl, websiteLink, whatsappLink } from "@/lib/utils";
import { fullAddress } from "@/lib/media";
import { GallerySection } from "./GallerySection";
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

export function RestaurantPlace({ profile }: { profile: PublicProfile }) {
  const { brandName, logoUrl } = useBranding();
  const categories = profile.menu.filter((category) => category.items.some((item) => item.available !== false));
  const allItems = useMemo(
    () => categories.flatMap((category) => category.items.filter((item) => item.available !== false)),
    [categories],
  );
  const [active, setActive] = useState("all");
  const visible = active === "all" ? allItems : categories.find((category) => category.id === active)?.items.filter((item) => item.available !== false) ?? [];
  const featured = allItems.find((item) => item.featured && item.imageUrl) || allItems.find((item) => item.imageUrl) || null;
  const name = profile.name?.trim() || "Restaurant";
  const tagline = profile.tagline?.trim() || "Good Food. Good Mood.";
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
    <div className="min-h-screen bg-white xl:flex xl:items-center xl:justify-center xl:gap-12 xl:bg-[#3B1D0F] xl:px-8 xl:py-10">
      <aside className="hidden w-[260px] shrink-0 flex-col gap-6 text-[#F8EDE3] xl:flex">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#E8C39A]">Restaurant profile</p>
          <h2 className="mt-2 text-[26px] font-semibold leading-tight tracking-tight">Delicious food. Unforgettable moments.</h2>
        </div>
        <div>
          <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-[#E8C39A]/70">Front side</p>
          <RestaurantCardFace
            name={name}
            brandName={brandName}
            logoUrl={logoUrl || profile.media.logoUrl}
          />
        </div>
        <div>
          <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-[#E8C39A]/70">Back side</p>
          <RestaurantCardBack name={name} brandName={brandName} qrValue={url} />
        </div>
      </aside>

      <div className="mx-auto w-full max-w-[390px] overflow-hidden bg-white xl:rounded-[40px] xl:border-[10px] xl:border-[#111111] xl:shadow-[0_40px_80px_rgba(0,0,0,0.45)]">
        <div className="relative min-h-screen bg-white xl:min-h-[760px] xl:max-h-[800px] xl:overflow-y-auto">
          <header className="relative">
            {cover ? (
              <img src={mediaSrc(cover, 1200)} alt="" className="h-[200px] w-full object-cover" />
            ) : (
              <div className="h-[168px] w-full bg-[radial-gradient(circle_at_20%_20%,#F59E0B_0%,#C2410C_42%,#3B1D0F_100%)]" />
            )}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
          </header>

          <div className="relative -mt-8 px-5 pb-28">
            <div className="text-center">
              <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-[#1C1410]">{name}</h1>
              <p className="mt-1 text-[13px] text-[#8A7A6C]">{tagline}</p>
            </div>

            <div className="mt-5 grid grid-cols-4 gap-2">
              {shortcuts.map((item) => {
                const Icon = item.icon;
                return (
                  <a key={item.href} href={item.href} className="flex flex-col items-center gap-1.5 text-[11px] font-medium text-[#3B2A1F]">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F4EEE8] text-[#3B1D0F]">
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
                  <img src={mediaSrc(featured?.imageUrl || cover, 1100)} alt="" className="h-44 w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <p className="text-[18px] font-semibold leading-tight">{featured?.name || "Fresh Food. Great Taste."}</p>
                    <p className="mt-1 text-[12px] text-white/80">{featured?.description || tagline}</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-[22px] bg-[#F4EEE8] px-5 py-8 text-center">
                  <p className="text-[18px] font-semibold text-[#1C1410]">Fresh Food. Great Taste.</p>
                  <p className="mt-1 text-[13px] text-[#8A7A6C]">{tagline}</p>
                </div>
              )}
            </article>

            <section id="menu" className="mt-6">
              <div className="flex gap-2 overflow-x-auto pb-1">
                <Tab label="All" selected={active === "all"} onClick={() => setActive("all")} />
                {categories.map((category) => (
                  <Tab key={category.id} label={category.name} selected={active === category.id} onClick={() => setActive(category.id)} />
                ))}
              </div>

              <div className="mt-4 space-y-3">
                {visible.map((item) => (
                  <MenuRow key={item.id} item={item} />
                ))}
                {visible.length === 0 && (
                  <p className="rounded-2xl bg-[#F7F3EE] px-4 py-8 text-center text-sm text-[#8A7A6C]">Menu coming soon.</p>
                )}
              </div>
            </section>

            {profile.media.gallery.length > 0 && (
              <div id="gallery" className="mt-8">
                <GallerySection images={profile.media.gallery} tone="food" />
              </div>
            )}

            <div id="location" className="mt-8">
              <LocationSection profile={profile} tone="food" />
            </div>
            <div id="contact" className="h-px w-full" />
          </div>

          {dock.length > 0 && (
            <nav className="sticky bottom-0 border-t border-[#EEE8E1] bg-white/95 px-3 py-2.5 pb-[max(0.65rem,env(safe-area-inset-bottom))] backdrop-blur xl:static">
              <div className="grid grid-cols-4 gap-1">
                {dock.slice(0, 4).map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noreferrer" : undefined}
                      className="flex flex-col items-center gap-1 py-1 text-[10px] font-medium text-[#3B2A1F]"
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

function Tab({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-1.5 text-[13px] font-medium ${selected ? "bg-[#1C1410] text-white" : "bg-[#F4EEE8] text-[#6B5B4E]"}`}
    >
      {label}
    </button>
  );
}

function MenuRow({ item }: { item: PublicMenuItem }) {
  return (
    <article className="flex items-center gap-3">
      {item.imageUrl ? (
        <img src={mediaSrc(item.imageUrl, 240)} alt="" className="h-16 w-16 rounded-2xl object-cover" />
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F4EEE8] text-[#C2410C]">
          <UtensilsCrossed className="h-5 w-5" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[15px] font-semibold text-[#1C1410]">{item.name}</h3>
        {item.description && <p className="mt-0.5 line-clamp-1 text-[12px] text-[#8A7A6C]">{item.description}</p>}
      </div>
      <p className="shrink-0 text-[15px] font-semibold tabular-nums text-[#1C1410]">{formatPrice(item.price, item.currency)}</p>
    </article>
  );
}

function RestaurantCardFace({
  name,
  brandName,
  logoUrl,
}: {
  name: string;
  brandName: string;
  logoUrl?: string | null;
}) {
  return (
    <div className="relative aspect-[1.586/1] overflow-hidden rounded-[18px] bg-[#14110E] p-5 text-[#F8EDE3] shadow-[0_22px_40px_rgba(0,0,0,0.35)]">
      <div className="flex items-start justify-between">
        {logoUrl ? <img src={logoUrl} alt="" className="h-8 w-auto max-w-16 object-contain" /> : <p className="text-[10px] font-semibold tracking-wide">{brandName}</p>}
        <NfcMark className="h-6 w-6 text-[#C9A227]" />
      </div>
      <div className="absolute bottom-5 left-5 right-5">
        <p className="text-[16px] font-semibold leading-tight">{name}</p>
        <p className="mt-1 text-[11px] text-[#E8C39A]">Restaurant</p>
      </div>
    </div>
  );
}

function RestaurantCardBack({
  name,
  brandName,
  qrValue,
}: {
  name: string;
  brandName: string;
  qrValue: string;
}) {
  return (
    <div className="flex aspect-[1.586/1] flex-col items-center justify-between rounded-[18px] bg-white p-5 text-center shadow-[0_22px_40px_rgba(0,0,0,0.28)]">
      <p className="text-[11px] font-medium text-slate-400">Scan or tap</p>
      <QRCodeSVG value={qrValue} size={86} />
      <div>
        <p className="text-[12px] font-semibold text-slate-800">View our menu</p>
        <p className="mt-0.5 text-[10px] text-slate-400">{brandName}</p>
        <p className="sr-only">{name}</p>
      </div>
    </div>
  );
}
