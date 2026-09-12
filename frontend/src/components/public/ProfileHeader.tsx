import { typeLabel } from "@shared/profileTypes";
import type { PublicProfile } from "@/types";
import { cn } from "@/lib/utils";
import { VerifiedBadge } from "./VerifiedBadge";
import { mutedClass, type PublicTone } from "./tone";

export function ProfileHeader({ profile, tone }: { profile: PublicProfile; tone: PublicTone }) {
  return (
    <header className={cn("public-in", profile.media.logoUrl || profile.media.avatarUrl ? "mt-1" : "mt-2")}>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider"
          style={{ background: "color-mix(in oklab, var(--p) 12%, transparent)", color: "var(--p)" }}
        >
          {typeLabel(profile.type)}
        </span>
        <VerifiedBadge verified={profile.isVerified} />
      </div>
      <h1 className={cn("mt-3 text-3xl font-semibold tracking-tight @md:text-5xl", (tone === "luxury" || tone === "hotel" || tone === "personal") && "font-serif")}>
        {profile.name}
      </h1>
      {profile.tagline && <p className={cn("mt-2 text-lg @md:text-xl", mutedClass(tone))}>{profile.tagline}</p>}
    </header>
  );
}
