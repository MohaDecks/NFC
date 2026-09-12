import type { PublicProfile } from "@/types";
import { HiHelloShell } from "@/components/public/HiHelloShell";
import { PlaceExtras } from "@/components/public/PlaceExtras";

export function EngineerTemplate({ profile }: { profile: PublicProfile }) {
  return (
    <HiHelloShell profile={profile} kindLabel="Engineer">
      <PlaceExtras profile={profile} />
    </HiHelloShell>
  );
}
