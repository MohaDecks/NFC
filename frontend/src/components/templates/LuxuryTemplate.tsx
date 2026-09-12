import type { PublicProfile } from "@/types";
import { HiHelloShell } from "@/components/public/HiHelloShell";
import { PlaceExtras } from "@/components/public/PlaceExtras";

export function LuxuryTemplate({ profile }: { profile: PublicProfile }) {
  return (
    <HiHelloShell profile={profile}>
      <PlaceExtras profile={profile} />
    </HiHelloShell>
  );
}
