import type { PublicProfile } from "@/types";
import { PersonalPortfolio } from "@/components/public/PersonalPortfolio";

export function PortfolioTemplate({ profile }: { profile: PublicProfile }) {
  return <PersonalPortfolio profile={profile} />;
}
