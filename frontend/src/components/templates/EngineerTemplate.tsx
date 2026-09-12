import type { PublicProfile } from "@/types";
import { EngineerPlace } from "@/components/public/EngineerPlace";

export function EngineerTemplate({ profile }: { profile: PublicProfile }) {
  return <EngineerPlace profile={profile} />;
}
