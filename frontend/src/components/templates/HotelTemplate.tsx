import type { PublicProfile } from "@/types";
import { HotelPlace } from "@/components/public/HotelPlace";

export function HotelTemplate({ profile }: { profile: PublicProfile }) {
  return <HotelPlace profile={profile} />;
}
