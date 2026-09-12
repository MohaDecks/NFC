import type { PublicProfile } from "@/types";
import { CafeteriaPlace } from "@/components/public/CafeteriaPlace";

export function CafeteriaTemplate({ profile }: { profile: PublicProfile }) {
  return <CafeteriaPlace profile={profile} />;
}
