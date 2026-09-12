import { typeLabel } from "@shared/profileTypes";
import type { PublicProfile } from "@/types";
import { mediaSrc } from "@/lib/media";
import { cn } from "@/lib/utils";
import { VerifiedBadge } from "./VerifiedBadge";
import { siteMaxClass, type PublicTone } from "./tone";

export function ProfileHero({ profile, tone }: { profile: PublicProfile; tone: PublicTone }) {
  const portrait = profile.media.logoUrl || profile.media.avatarUrl;
  const overlay = tone === "luxury" || tone === "food" || tone === "hotel" || tone === "engineer" || tone === "cafeteria" || tone === "portfolio";
  const circle = ["PERSONAL", "INDIVIDUAL_BUSINESS", "DOCTOR", "ENGINEER", "PROFESSIONAL", "PORTFOLIO"].includes(profile.type) || tone === "personal" || tone === "doctor";
  const height =
    profile.design.coverStyle === "minimal"
      ? "h-56 md:h-72"
      : profile.design.coverStyle === "banner"
        ? "h-72 md:h-[420px] lg:h-[480px]"
        : "h-[68vh] min-h-[420px] max-h-[720px]";

  return (
    <section id="top" className="relative">
      <div className={cn("relative overflow-hidden", height)}>
        {profile.media.coverUrl ? (
          <img
            src={mediaSrc(profile.media.coverUrl, 1800)}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background: `linear-gradient(145deg, var(--s) 0%, var(--p) 55%, color-mix(in oklab, var(--p) 70%, black) 100%)`,
            }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              tone === "luxury" || tone === "hotel"
                ? "linear-gradient(to top, rgba(13,12,11,0.92), rgba(13,12,11,0.2) 48%, transparent)"
                : tone === "engineer" || tone === "cafeteria" || tone === "portfolio"
                  ? "linear-gradient(to top, rgba(5,10,20,0.88), rgba(5,10,20,0.2) 50%, transparent)"
                : tone === "food"
                  ? "linear-gradient(to top, rgba(0,0,0,0.58), transparent 52%)"
                  : "linear-gradient(to top, rgba(0,0,0,0.38), transparent 46%)",
          }}
        />
        {overlay && (
          <div className={`absolute inset-x-0 bottom-0 ${siteMaxClass()} pb-16 text-white md:pb-20`}>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/70">
              {typeLabel(profile.type)}
            </p>
            <h1 className={cn("mt-3 text-4xl font-semibold tracking-tight md:text-6xl", (tone === "luxury" || tone === "hotel") && "font-serif")}>
              {profile.name}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <VerifiedBadge verified={profile.isVerified} />
            </div>
            {profile.tagline && <p className="mt-4 max-w-2xl text-base text-white/80 md:text-xl">{profile.tagline}</p>}
          </div>
        )}
      </div>

      {portrait && (
        <div className={`relative z-10 ${siteMaxClass()} ${overlay ? "-mt-12 md:-mt-14" : "-mt-16 md:-mt-20"}`}>
          <img
            src={mediaSrc(portrait, 360)}
            alt={profile.name}
            className={cn(
              "h-24 w-24 object-cover shadow-xl ring-4 md:h-32 md:w-32",
              circle ? "rounded-full" : "rounded-2xl",
              tone === "luxury" || tone === "hotel" || tone === "engineer" || tone === "cafeteria" || tone === "portfolio" ? "ring-[#0b1220]" : "ring-white",
            )}
          />
        </div>
      )}
    </section>
  );
}
