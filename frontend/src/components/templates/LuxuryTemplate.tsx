import type { PublicProfile } from "@/types";
import { PlaceShell } from "@/components/public/PlaceShell";
import { ProfileBody } from "@/components/public/ProfileBody";
import { pageClass } from "@/components/public/tone";

export function LuxuryTemplate({ profile }: { profile: PublicProfile }) {
  return (
    <div className={pageClass("luxury")}>
      <PlaceShell profile={profile} tone="luxury">
        <ProfileBody profile={profile} tone="luxury" hideName compact />
      </PlaceShell>
    </div>
  );
}
