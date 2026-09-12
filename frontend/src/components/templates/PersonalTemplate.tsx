import type { PublicProfile } from "@/types";
import { PersonalPlace } from "@/components/public/PersonalPlace";

export function PersonalTemplate({ profile }: { profile: PublicProfile }) {
  return <PersonalPlace profile={profile} />;
}
