import { cn } from "@/lib/utils";

export type PublicTone = "modern" | "luxury" | "business" | "food" | "hotel" | "personal" | "doctor" | "engineer" | "cafeteria" | "portfolio";

export function pageClass(tone: PublicTone) {
  return cn(
    "min-h-full @container",
    tone === "luxury" && "bg-[#0d0c0b] text-[#f6f1e7]",
    tone === "hotel" && "bg-[#14110e] text-[#f4ece0]",
    tone === "business" && "bg-[#f4f6f8] text-slate-900",
    tone === "food" && "bg-[#fff8f1] text-stone-900",
    tone === "personal" && "bg-[#f5f3ff] text-neutral-900",
    tone === "modern" && "bg-[#f7f4ee] text-neutral-900",
    tone === "doctor" && "bg-[#f0f7ff] text-slate-900",
    tone === "engineer" && "bg-[#0b1220] text-[#e8eef8]",
    tone === "cafeteria" && "bg-[#052e16] text-[#f3f8f1]",
    tone === "portfolio" && "bg-[#2e1065] text-[#f5f3ff]",
  );
}

export function cardClass(tone: PublicTone, className?: string) {
  return cn(
    "public-in rounded-[var(--radius)] p-5 @md:p-7",
    tone === "luxury" && "border border-white/10 bg-white/[0.04] shadow-[0_16px_40px_rgba(0,0,0,0.28)]",
    tone === "hotel" && "border border-white/8 bg-white/[0.035] shadow-[0_20px_50px_rgba(0,0,0,0.32)]",
    tone === "business" && "border border-slate-200/80 bg-white shadow-sm",
    tone === "food" && "border border-orange-100 bg-white shadow-[0_10px_30px_rgba(80,40,10,0.06)]",
    tone === "personal" && "border border-violet-100 bg-white shadow-[0_12px_36px_rgba(20,20,20,0.05)]",
    tone === "modern" && "border border-black/5 bg-white shadow-[0_10px_30px_rgba(20,20,20,0.05)]",
    tone === "doctor" && "border border-blue-100 bg-white shadow-sm",
    tone === "engineer" && "border border-white/10 bg-white/[0.04]",
    tone === "cafeteria" && "border border-white/10 bg-white/[0.05]",
    tone === "portfolio" && "border border-white/10 bg-white/[0.05]",
    className,
  );
}

export function mutedClass(tone: PublicTone) {
  return tone === "luxury" || tone === "hotel" || tone === "engineer" || tone === "cafeteria" || tone === "portfolio"
    ? "text-white/62"
    : "text-neutral-500";
}

export function sectionTitleClass(tone: PublicTone) {
  return cn(
    "mb-4 text-xl font-semibold tracking-tight sm:text-2xl",
    (tone === "luxury" || tone === "hotel" || tone === "portfolio") && "font-serif text-[color:var(--a)]",
    tone === "personal" && "font-serif",
    tone === "business" && "text-slate-900",
    tone === "doctor" && "text-blue-950",
  );
}

export function chipClass(tone: PublicTone) {
  return cn(
    "rounded-full px-3 py-1.5 text-sm",
    tone === "luxury" || tone === "hotel" || tone === "engineer" || tone === "cafeteria" || tone === "portfolio"
      ? "border border-white/10 bg-white/5"
      : "bg-black/[0.04]",
  );
}

export function siteMaxClass() {
  return "mx-auto w-full max-w-[1180px] px-5 md:px-8";
}
