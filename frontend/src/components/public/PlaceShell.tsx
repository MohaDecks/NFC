import type { ReactNode } from "react";
import {
  Briefcase,
  Camera,
  Coffee,
  FolderKanban,
  Hotel,
  MapPin,
  Nfc,
  Phone,
  Stethoscope,
  UserRound,
  UtensilsCrossed,
  Wrench,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { resolveProfileType } from "@shared/profileTypes";
import type { PublicProfile } from "@/types";
import { mediaSrc } from "@/lib/media";
import { profileUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ActionButtons } from "./ActionButtons";
import { VerifiedBadge } from "./VerifiedBadge";
import { mutedClass, type PublicTone } from "./tone";

const SHORTCUTS: Record<string, { href: string; label: string }[]> = {
  HOTEL: [
    { href: "#rooms", label: "Rooms" },
    { href: "#services", label: "Services" },
    { href: "#gallery", label: "Gallery" },
    { href: "#contact", label: "Contact" },
  ],
  RESTAURANT: [
    { href: "#menu", label: "Menu" },
    { href: "#gallery", label: "Gallery" },
    { href: "#location", label: "Location" },
    { href: "#contact", label: "Contact" },
  ],
  CAFETERIA: [
    { href: "#menu", label: "Menu" },
    { href: "#hours", label: "Hours" },
    { href: "#location", label: "Location" },
    { href: "#contact", label: "Contact" },
  ],
  DOCTOR: [
    { href: "#about", label: "About" },
    { href: "#services", label: "Services" },
    { href: "#location", label: "Location" },
    { href: "#contact", label: "Book" },
  ],
  PERSONAL: [
    { href: "#about", label: "About" },
    { href: "#portfolio", label: "Portfolio" },
    { href: "#social", label: "Social" },
    { href: "#contact", label: "Contact" },
  ],
  ENGINEER: [
    { href: "#about", label: "About" },
    { href: "#services", label: "Services" },
    { href: "#portfolio", label: "Projects" },
    { href: "#contact", label: "Contact" },
  ],
  BUSINESS: [
    { href: "#about", label: "About" },
    { href: "#services", label: "Services" },
    { href: "#gallery", label: "Gallery" },
    { href: "#contact", label: "Contact" },
  ],
  PORTFOLIO: [
    { href: "#gallery", label: "Gallery" },
    { href: "#portfolio", label: "Work" },
    { href: "#about", label: "About" },
    { href: "#contact", label: "Contact" },
  ],
  PROFESSIONAL: [
    { href: "#about", label: "About" },
    { href: "#services", label: "Services" },
    { href: "#portfolio", label: "Work" },
    { href: "#contact", label: "Contact" },
  ],
  ORGANIZATION: [
    { href: "#about", label: "About" },
    { href: "#services", label: "Programs" },
    { href: "#gallery", label: "Gallery" },
    { href: "#contact", label: "Contact" },
  ],
  INDIVIDUAL_BUSINESS: [
    { href: "#about", label: "About" },
    { href: "#services", label: "Services" },
    { href: "#portfolio", label: "Work" },
    { href: "#contact", label: "Contact" },
  ],
};

const typeIcons = {
  hotel: Hotel,
  utensils: UtensilsCrossed,
  coffee: Coffee,
  stethoscope: Stethoscope,
  user: UserRound,
  wrench: Wrench,
  briefcase: Briefcase,
  camera: Camera,
  badge: UserRound,
  users: UserRound,
  building: Briefcase,
};

const shortcutIcons = {
  Rooms: Hotel,
  Services: Briefcase,
  Gallery: Camera,
  Contact: Phone,
  Menu: UtensilsCrossed,
  Location: MapPin,
  Hours: Coffee,
  About: UserRound,
  Book: Phone,
  Portfolio: FolderKanban,
  Social: UserRound,
  Projects: FolderKanban,
  Work: Camera,
  Programs: Briefcase,
};

function isDark(tone: PublicTone) {
  return tone === "luxury" || tone === "hotel" || tone === "engineer" || tone === "cafeteria" || tone === "portfolio";
}

export function PlaceShell({
  profile,
  tone,
  children,
}: {
  profile: PublicProfile;
  tone: PublicTone;
  children: ReactNode;
}) {
  const config = resolveProfileType(profile.type);
  const TypeIcon = typeIcons[config.icon] ?? UserRound;
  const dark = isDark(tone);
  const photo = profile.media.avatarUrl || profile.media.logoUrl;
  const cover = profile.media.coverUrl;
  const name = profile.name?.trim() || config.label;
  const title = profile.tagline?.trim() || config.shortLabel;
  const shortcuts = SHORTCUTS[profile.type] ?? SHORTCUTS.PROFESSIONAL;
  const url = typeof window !== "undefined" ? profileUrl(profile.publicId) : `/p/${profile.publicId}`;

  return (
    <div className={cn("mx-auto min-h-screen w-full max-w-[480px] md:max-w-[720px] lg:max-w-[980px]", dark ? "text-white" : "text-slate-900")}>
      <header className="flex items-center justify-between gap-3 px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: "color-mix(in oklab, var(--p) 18%, transparent)", color: "var(--p)" }}>
            <TypeIcon className="h-4 w-4" />
          </div>
          <p className="truncate text-sm font-semibold">{name}</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium uppercase tracking-wide" style={{ background: "color-mix(in oklab, var(--p) 14%, transparent)", color: dark ? "#fff" : "var(--p)" }}>
          <Nfc className="h-3 w-3" /> NFC
        </span>
      </header>

      <section className="px-4">
        <div className={cn("overflow-hidden rounded-[28px]", dark ? "bg-white/6" : "bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]")}>
          {cover ? (
            <img src={mediaSrc(cover, 1200)} alt="" className="h-44 w-full object-cover sm:h-56 md:h-72" />
          ) : (
            <div className="h-28 w-full sm:h-36" style={{ background: `linear-gradient(135deg, var(--p), color-mix(in oklab, var(--s) 70%, var(--p)))` }} />
          )}
          <div className="px-5 pb-5">
            <div className="-mt-10 mb-3 flex items-end justify-between">
              {photo ? (
                <img src={mediaSrc(photo, 240)} alt="" className="h-20 w-20 rounded-full object-cover ring-4 ring-white/90" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-semibold text-white ring-4 ring-white/90" style={{ background: "var(--p)" }}>
                  {name[0]?.toUpperCase() || "M"}
                </div>
              )}
              <VerifiedBadge verified={profile.isVerified} />
            </div>
            <h1 className="text-[28px] font-semibold leading-tight tracking-tight">{name}</h1>
            <p className={cn("mt-1 text-sm", mutedClass(tone))}>{title}</p>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {shortcuts.map((item) => {
                const Icon = shortcutIcons[item.label as keyof typeof shortcutIcons] ?? UserRound;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={cn("flex flex-col items-center gap-1 rounded-2xl px-1 py-3 text-center text-[11px] font-medium", dark ? "bg-white/8" : "bg-slate-50")}
                  >
                    <Icon className="h-4 w-4" style={{ color: "var(--p)" }} />
                    {item.label}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pt-4">
        <div className={cn("rounded-[28px] p-5 text-center", dark ? "bg-white/6" : "bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)]")}>
          <p className={cn("mb-3 text-[11px] font-medium uppercase tracking-[0.16em]", mutedClass(tone))}>Scan or tap</p>
          <div className="mx-auto w-fit rounded-2xl bg-white p-3">
            <QRCodeSVG value={url} size={132} />
          </div>
          <p className={cn("mt-3 font-mono text-[11px]", mutedClass(tone))}>/p/{profile.publicId}</p>
        </div>
      </section>

      <div className="px-4 pt-4">
        <ActionButtons profile={profile} />
      </div>

      <div className="px-4">{children}</div>
    </div>
  );
}
