import type { PublicProfile } from "@/types";
import { PlaceShell } from "@/components/public/PlaceShell";
import { ProfileBody } from "@/components/public/ProfileBody";
import { pageClass } from "@/components/public/tone";

export function BusinessTemplate({ profile }: { profile: PublicProfile }) {
  return (
    <div className={pageClass("business")}>
      <PlaceShell profile={profile} tone="business">
        <ProfileBody profile={profile} tone="business" hideName compact />
      </PlaceShell>
    </div>
  );
}
