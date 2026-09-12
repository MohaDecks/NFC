import { Camera, Coffee, Hotel, Nfc, Stethoscope, UserRound, UtensilsCrossed, Wrench, Briefcase } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { resolveProfileType } from "@shared/profileTypes";
import { defaultDesignForType } from "@shared/profileTypes";

const looks: Record<string, {
  bg: string;
  header: string;
  title: string;
  subtitle: string;
  tiles: string[];
  accent: string;
}> = {
  HOTEL: { bg: "#0B1B3A", header: "#08142B", title: "Grandview Hotel", subtitle: "Luxury stays", tiles: ["Rooms", "Services", "Gallery"], accent: "#C9A227" },
  RESTAURANT: { bg: "#3B1D0F", header: "#2A140A", title: "Tasty Kitchen", subtitle: "Delicious food", tiles: ["Menu", "Gallery", "Hours"], accent: "#F59E0B" },
  DOCTOR: { bg: "#F0F7FF", header: "#1D4ED8", title: "Dr. Ahmed", subtitle: "General practitioner", tiles: ["About", "Services", "Book"], accent: "#38BDF8" },
  PERSONAL: { bg: "#F5F3FF", header: "#6D28D9", title: "Mohamed Ali", subtitle: "Digital creator", tiles: ["About", "Portfolio", "Contact"], accent: "#A78BFA" },
  ENGINEER: { bg: "#0B1220", header: "#111827", title: "Hassan Omar", subtitle: "Civil engineer", tiles: ["Projects", "Skills", "Contact"], accent: "#38BDF8" },
  CAFETERIA: { bg: "#052E16", header: "#064E3B", title: "Coffee Time", subtitle: "Great coffee", tiles: ["Menu", "Hours", "Location"], accent: "#86EFAC" },
  BUSINESS: { bg: "#EFF6FF", header: "#1D4ED8", title: "Al-Nour Trading", subtitle: "Trusted partner", tiles: ["Services", "Products", "Contact"], accent: "#38BDF8" },
  PORTFOLIO: { bg: "#2E1065", header: "#4C1D95", title: "Amina Yusuf", subtitle: "Photographer", tiles: ["Gallery", "Work", "Contact"], accent: "#E9D5FF" },
  PROFESSIONAL: { bg: "#EEF2FF", header: "#312E81", title: "Professional", subtitle: "Your presence", tiles: ["About", "Services", "Contact"], accent: "#818CF8" },
  ORGANIZATION: { bg: "#F0FDFA", header: "#0F766E", title: "Organization", subtitle: "Community first", tiles: ["About", "Programs", "Contact"], accent: "#14B8A6" },
  INDIVIDUAL_BUSINESS: { bg: "#F8FAFC", header: "#1D4ED8", title: "Your Business", subtitle: "Personal + work", tiles: ["About", "Services", "Contact"], accent: "#38BDF8" },
};

const icons = {
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

export function TypePhonePreview({
  type,
  name,
  subtitle,
  imageUrl,
  qrValue,
}: {
  type: string;
  name?: string;
  subtitle?: string;
  imageUrl?: string;
  qrValue?: string;
}) {
  const config = resolveProfileType(type);
  const design = defaultDesignForType(type);
  const look = looks[type] ?? {
    bg: design.secondaryColor,
    header: design.primaryColor,
    title: config.label,
    subtitle: config.description,
    tiles: config.highlights.slice(0, 3),
    accent: design.accentColor,
  };
  const Icon = icons[config.icon] ?? UserRound;
  const light = ["DOCTOR", "PERSONAL", "BUSINESS", "PROFESSIONAL", "ORGANIZATION", "INDIVIDUAL_BUSINESS"].includes(type);
  const title = name?.trim() || look.title;
  const line = subtitle?.trim() || look.subtitle;

  return (
    <div className="mx-auto w-[260px]">
      <div className="rounded-[36px] border-[10px] border-[#111827] bg-[#111827] p-1.5 shadow-[0_28px_60px_rgba(15,23,42,0.28)]">
        <div className="overflow-hidden rounded-[26px]" style={{ background: look.bg, color: light ? "#0F172A" : "#F8FAFC" }}>
          <div className="px-4 pb-3 pt-3 text-white" style={{ background: look.header }}>
            <div className="mb-3 flex items-center justify-between text-[10px] text-white/70">
              <span>9:41</span>
              <span>NFC</span>
            </div>
            <div className="flex items-center gap-2">
              {imageUrl ? (
                <img src={imageUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                  <Icon className="h-4 w-4" />
                </div>
              )}
              <div>
                <p className="text-[13px] font-semibold leading-tight">{title}</p>
                <p className="text-[10px] text-white/70">{line}</p>
              </div>
            </div>
          </div>
          <div className="space-y-3 px-3 py-3">
            <div className="grid grid-cols-3 gap-2">
              {look.tiles.map((tile) => (
                <div key={tile} className="rounded-xl px-2 py-3 text-center text-[9px] font-medium" style={{ background: light ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.08)" }}>
                  {tile}
                </div>
              ))}
            </div>
            <div className="rounded-2xl p-3" style={{ background: light ? "#fff" : "rgba(255,255,255,0.08)" }}>
              <div className="mb-2 flex items-center justify-between text-[10px]">
                <span className="inline-flex items-center gap-1"><Nfc className="h-3 w-3" /> Scan or tap</span>
                <span style={{ color: look.accent }}>Front</span>
              </div>
              <div className="flex justify-center rounded-xl bg-white p-2">
                <QRCodeSVG value={qrValue || `https://mubarek.local/p/${type.toLowerCase()}`} size={92} />
              </div>
            </div>
            <p className="pb-2 text-center text-[9px] opacity-60">{config.shortLabel}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
