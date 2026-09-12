import type { PublicProfile } from "@/types";
import { PlaceShell } from "@/components/public/PlaceShell";
import { ProfileBody } from "@/components/public/ProfileBody";
import { pageClass } from "@/components/public/tone";

export function ModernTemplate({ profile }: { profile: PublicProfile }) {
  return (
    <div className={pageClass("modern")}>
      <PlaceShell profile={profile} tone="modern">
        <ProfileBody profile={profile} tone="modern" hideName compact />
      </PlaceShell>
    </div>
  );
}
