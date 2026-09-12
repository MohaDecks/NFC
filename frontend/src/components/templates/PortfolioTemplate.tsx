import type { PublicProfile } from "@/types";
import { PersonalPlace } from "@/components/public/PersonalPlace";

export function PortfolioTemplate({ profile }: { profile: PublicProfile }) {
  return <PersonalPlace profile={profile} />;
}
