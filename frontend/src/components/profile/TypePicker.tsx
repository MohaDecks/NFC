import { useEffect, useState } from "react";
import {
  Briefcase,
  Camera,
  Coffee,
  Hotel,
  Stethoscope,
  UserRound,
  Users,
  UtensilsCrossed,
  Wrench,
} from "lucide-react";
import { resolveProfileType, type ProfileType } from "@shared/profileTypes";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

const icons = {
  user: UserRound,
  briefcase: Briefcase,
  users: Users,
  hotel: Hotel,
  utensils: UtensilsCrossed,
  coffee: Coffee,
  stethoscope: Stethoscope,
  wrench: Wrench,
  badge: Briefcase,
  building: Briefcase,
  camera: Camera,
};

const tones: Record<string, string> = {
  HOTEL: "bg-[#EEF2FF] text-[#1E3A8A]",
  RESTAURANT: "bg-[#FFF7ED] text-[#C2410C]",
  CAFETERIA: "bg-[#ECFDF5] text-[#047857]",
  DOCTOR: "bg-[#EFF6FF] text-[#1D4ED8]",
  PERSONAL: "bg-[#F5F3FF] text-[#6D28D9]",
  ENGINEER: "bg-[#E0E7FF] text-[#1E3A8A]",
  BUSINESS: "bg-[#EFF6FF] text-[#1D4ED8]",
  PORTFOLIO: "bg-[#F5F3FF] text-[#7C3AED]",
  PROFESSIONAL: "bg-[#EEF2FF] text-[#312E81]",
  ORGANIZATION: "bg-[#F0FDFA] text-[#0F766E]",
  INDIVIDUAL_BUSINESS: "bg-[#F8FAFC] text-[#334155]",
};

const ORDER = ["HOTEL", "RESTAURANT", "DOCTOR", "PERSONAL", "ENGINEER", "CAFETERIA", "BUSINESS", "PORTFOLIO", "INDIVIDUAL_BUSINESS", "ORGANIZATION"];

type ApiType = { slug: string; name: string; description: string; icon: string; status: string };

export function TypePicker({
  value,
  onChange,
}: {
  value?: ProfileType | string;
  onChange: (type: ProfileType) => void;
}) {
  const [types, setTypes] = useState<ApiType[]>([]);

  useEffect(() => {
    void api
      .get<{ profileTypes: ApiType[] }>("/api/admin/profile-types?active=true&usage=PLACE")
      .then((data) => setTypes(data.profileTypes.filter((item) => item.slug !== "PROFESSIONAL")))
      .catch(() => setTypes([]));
  }, []);

  const fallback = ORDER.map((slug) => {
    const config = resolveProfileType(slug);
    return { slug, name: config.label, description: config.description, icon: config.icon, status: "ACTIVE" };
  });
  const options = (types.length ? types : fallback).slice().sort((a, b) => {
    const left = ORDER.indexOf(a.slug);
    const right = ORDER.indexOf(b.slug);
    return (left === -1 ? 99 : left) - (right === -1 ? 99 : right);
  });

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
      {options.map((item) => {
        const config = resolveProfileType(item.slug);
        const Icon = icons[config.icon as keyof typeof icons] ?? UserRound;
        const selected = value === item.slug;
        return (
          <button
            key={item.slug}
            type="button"
            onClick={() => onChange(item.slug as ProfileType)}
            className={cn(
              "rounded-[20px] border bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm",
              selected ? "border-[#93C5FD] shadow-[0_10px_24px_rgba(29,78,216,0.12)]" : "border-[#EEEFF3]",
            )}
          >
            <div className={cn("mb-3 flex h-10 w-10 items-center justify-center rounded-2xl", tones[item.slug] ?? "bg-[#EEF0F4] text-[#6B7280]")}>
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
            </div>
            <h3 className="text-[14px] font-semibold tracking-tight text-[#111827]">{item.name}</h3>
            <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-[#8B93A7]">{item.description || config.description}</p>
          </button>
        );
      })}
    </div>
  );
}
