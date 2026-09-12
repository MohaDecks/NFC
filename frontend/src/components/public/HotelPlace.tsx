import { Briefcase, Camera, Globe, Hotel, MapPin, MessageCircle, Phone } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useBranding } from "@/hooks/useBranding";
import type { HotelRoomItem, PublicProfile } from "@/types";
import { mediaSrc } from "@/lib/media";
import { formatPrice, mapsLink, profileUrl, websiteLink, whatsappLink } from "@/lib/utils";
import { fullAddress } from "@/lib/media";
import { GallerySection } from "./GallerySection";
import { LocationSection } from "./LocationSection";
import { ServicesSection } from "./ServicesSection";

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

export function HotelPlace({ profile }: { profile: PublicProfile }) {
  const { brandName, logoUrl } = useBranding();
  const rooms = (profile.rooms ?? []).filter((room) => room.available !== false);
  const name = profile.name?.trim() || "Hotel";
  const tagline = profile.tagline?.trim() || "Luxury stays. Memorable experiences.";
  const cover = profile.media.coverUrl || rooms[0]?.imageUrls[0] || profile.media.gallery[0] || null;
  const featuredImage = profile.media.coverUrl || profile.media.gallery[0] || rooms[0]?.imageUrls[0] || null;
  const url = typeof window !== "undefined" ? profileUrl(profile.publicId) : `/p/${profile.publicId}`;
  const address = fullAddress(profile.location);
  const maps = mapsLink(address, profile.location.mapsUrl, profile.location.latitude, profile.location.longitude);
  const phone = profile.contact.phone;
  const wa = whatsappLink(profile.contact.whatsapp || profile.contact.phone);
  const site = websiteLink(profile.contact.website);
  const bookHref = wa || (phone ? `tel:${phone}` : "#contact");

  const shortcuts = [
    { href: "#rooms", label: "Rooms", icon: Hotel },
    { href: "#services", label: "Services", icon: Briefcase },
    { href: "#gallery", label: "Gallery", icon: Camera },
    { href: "#contact", label: "Contact", icon: Phone },
  ];

  const dock = [
    phone ? { href: `tel:${phone}`, label: "Call", icon: Phone } : null,
    wa ? { href: wa, label: "WhatsApp", icon: MessageCircle, external: true } : null,
    maps ? { href: maps, label: "Location", icon: MapPin, external: true } : null,
    site ? { href: site, label: "Website", icon: Globe, external: true } : null,
  ].filter(Boolean) as { href: string; label: string; icon: typeof Phone; external?: boolean }[];

  return (
    <div className="min-h-screen bg-white xl:flex xl:items-center xl:justify-center xl:gap-12 xl:bg-[#0B1B3A] xl:px-8 xl:py-10">
      <aside className="hidden w-[260px] shrink-0 flex-col gap-6 text-[#E8EEF8] xl:flex">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#C9A227]">Hotel profile</p>
          <h2 className="mt-2 text-[26px] font-semibold leading-tight tracking-tight">Luxury stays. Memorable experiences.</h2>
        </div>
        <div>
          <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-[#C9A227]/70">Front side</p>
          <HotelCardFace name={name} brandName={brandName} logoUrl={logoUrl || profile.media.logoUrl} />
        </div>
        <div>
          <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-[#C9A227]/70">Back side</p>
          <HotelCardBack name={name} brandName={brandName} qrValue={url} />
        </div>
      </aside>

      <div className="mx-auto w-full max-w-[390px] overflow-hidden bg-white xl:rounded-[40px] xl:border-[10px] xl:border-[#111111] xl:shadow-[0_40px_80px_rgba(0,0,0,0.45)]">
        <div className="relative min-h-screen bg-white xl:min-h-[760px] xl:max-h-[800px] xl:overflow-y-auto">
          <header className="relative">
            {cover ? (
              <img src={mediaSrc(cover, 1200)} alt="" className="h-[200px] w-full object-cover" />
            ) : (
              <div className="h-[168px] w-full bg-[radial-gradient(circle_at_20%_20%,#C9A227_0%,#1F3A5F_48%,#0B1B3A_100%)]" />
            )}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
          </header>

          <div className="relative -mt-8 px-5 pb-28">
            <div className="text-center">
              <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-[#0B1B3A]">{name}</h1>
              <p className="mt-1 text-[13px] text-[#6B7280]">{tagline}</p>
            </div>

            <div className="mt-5 grid grid-cols-4 gap-2">
              {shortcuts.map((item) => {
                const Icon = item.icon;
                return (
                  <a key={item.href} href={item.href} className="flex flex-col items-center gap-1.5 text-[11px] font-medium text-[#1F2937]">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF2F7] text-[#0B1B3A]">
                      <Icon className="h-5 w-5" />
                    </span>
                    {item.label}
                  </a>
                );
              })}
            </div>

            <article className="mt-5 overflow-hidden rounded-[22px]">
              {featuredImage ? (
                <div className="relative">
                  <img src={mediaSrc(featuredImage, 1100)} alt="" className="h-44 w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <p className="text-[18px] font-semibold leading-tight">A perfect stay awaits</p>
                    <p className="mt-1 text-[12px] text-white/80">
                      {profile.description?.trim() || "Experience comfort, elegance, and world-class hospitality."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-[22px] bg-[#EEF2F7] px-5 py-8 text-center">
                  <p className="text-[18px] font-semibold text-[#0B1B3A]">A perfect stay awaits</p>
                  <p className="mt-1 text-[13px] text-[#6B7280]">{tagline}</p>
                </div>
              )}
            </article>

            <a
              href={bookHref}
              target={bookHref.startsWith("http") ? "_blank" : undefined}
              rel={bookHref.startsWith("http") ? "noreferrer" : undefined}
              className="mt-4 flex h-12 items-center justify-center rounded-full bg-[#0B1B3A] text-[14px] font-semibold text-white"
            >
              Book now
            </a>

            <section id="rooms" className="mt-6">
              <div className="mb-3 flex items-end justify-between">
                <h2 className="text-[18px] font-semibold text-[#0B1B3A]">Our rooms</h2>
                {rooms.length > 2 && <a href="#rooms" className="text-[12px] font-medium text-[#0B1B3A]">View all</a>}
              </div>
              {rooms.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {rooms.slice(0, 4).map((room) => (
                    <RoomCard key={room.id} room={room} />
                  ))}
                </div>
              ) : (
                <p className="rounded-2xl bg-[#F3F6FA] px-4 py-8 text-center text-sm text-[#6B7280]">Rooms coming soon.</p>
              )}
            </section>

            {profile.services.length > 0 && (
              <div id="services" className="mt-8">
                <ServicesSection profile={profile} tone="business" />
              </div>
            )}

            {profile.media.gallery.length > 0 && (
              <div id="gallery" className="mt-8">
                <GallerySection images={profile.media.gallery} tone="business" />
              </div>
            )}

            <div id="location" className="mt-8">
              <LocationSection profile={profile} tone="business" />
            </div>
            <div id="contact" className="h-px w-full" />
          </div>

          {dock.length > 0 && (
            <nav className="sticky bottom-0 border-t border-[#EEF2F7] bg-white/95 px-3 py-2.5 pb-[max(0.65rem,env(safe-area-inset-bottom))] backdrop-blur xl:static">
              <div className="grid grid-cols-4 gap-1">
                {dock.slice(0, 4).map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noreferrer" : undefined}
                      className="flex flex-col items-center gap-1 py-1 text-[10px] font-medium text-[#1F2937]"
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

function RoomCard({ room }: { room: HotelRoomItem }) {
  const image = room.imageUrls[0];
  return (
    <article>
      {image ? (
        <img src={mediaSrc(image, 600)} alt="" className="h-24 w-full rounded-2xl object-cover" />
      ) : (
        <div className="flex h-24 items-center justify-center rounded-2xl bg-[#EEF2F7] text-[#0B1B3A]">
          <Hotel className="h-6 w-6" />
        </div>
      )}
      <h3 className="mt-2 truncate text-[13px] font-semibold text-[#0B1B3A]">{room.name}</h3>
      {room.price > 0 && (
        <p className="text-[12px] text-[#6B7280]">{formatPrice(room.price, room.currency)}/night</p>
      )}
    </article>
  );
}

function HotelCardFace({
  name,
  brandName,
  logoUrl,
}: {
  name: string;
  brandName: string;
  logoUrl?: string | null;
}) {
  return (
    <div className="relative aspect-[1.586/1] overflow-hidden rounded-[18px] bg-[#08142B] p-5 text-[#F5E6C8] shadow-[0_22px_40px_rgba(0,0,0,0.35)]">
      <div className="flex items-start justify-between">
        {logoUrl ? <img src={logoUrl} alt="" className="h-8 w-auto max-w-16 object-contain" /> : <p className="text-[10px] font-semibold tracking-wide">{brandName}</p>}
        <NfcMark className="h-6 w-6 text-[#C9A227]" />
      </div>
      <div className="absolute bottom-5 left-5 right-5">
        <p className="text-[16px] font-semibold leading-tight">{name}</p>
        <p className="mt-1 text-[11px] text-[#C9A227]">Hotel</p>
      </div>
    </div>
  );
}

function HotelCardBack({
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
        <p className="text-[12px] font-semibold text-slate-800">Discover our hotel</p>
        <p className="mt-0.5 text-[10px] text-slate-400">{brandName}</p>
        <p className="sr-only">{name}</p>
      </div>
    </div>
  );
}
