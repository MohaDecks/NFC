import { SECTION_REGISTRY, type SectionType } from "@shared/sections";
import type { PublicProfile } from "@/types";
import { siteMaxClass, type PublicTone } from "./tone";
import { cn } from "@/lib/utils";

const NAV_ORDER: SectionType[] = [
  "about",
  "menu",
  "rooms",
  "services",
  "amenities",
  "experience",
  "skills",
  "portfolio",
  "gallery",
  "hours",
  "location",
  "contact",
];

export function SiteNav({ profile, tone }: { profile: PublicProfile; tone: PublicTone }) {
  const items = (profile.sections ?? [])
    .filter((section) => section.visible !== false && NAV_ORDER.includes(section.type))
    .sort((a, b) => NAV_ORDER.indexOf(a.type) - NAV_ORDER.indexOf(b.type));

  if (!items.length) return null;

  const dark = tone === "luxury" || tone === "hotel" || tone === "engineer" || tone === "cafeteria" || tone === "portfolio";

  return (
    <nav
      className={cn(
        "sticky top-0 z-30 border-b backdrop-blur-xl",
        dark ? "border-white/10 bg-black/40" : "border-black/5 bg-white/80",
      )}
    >
      <div className={`${siteMaxClass()} flex items-center gap-4 overflow-x-auto py-3`}>
        <a href="#top" className="shrink-0 text-sm font-semibold tracking-tight">
          {profile.name}
        </a>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
          {items.map((section) => (
            <a
              key={section.id}
              href={`#${section.type}`}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition hover:opacity-80 md:text-sm",
                dark ? "text-white/70 hover:bg-white/10" : "text-neutral-600 hover:bg-black/5",
              )}
            >
              {section.title || SECTION_REGISTRY[section.type]?.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
