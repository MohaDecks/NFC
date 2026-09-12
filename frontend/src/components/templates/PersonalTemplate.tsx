import type { PublicProfile } from "@/types";
import { PersonalPortfolio } from "@/components/public/PersonalPortfolio";

export function PersonalTemplate({ profile }: { profile: PublicProfile }) {
  return <PersonalPortfolio profile={profile} />;
}
