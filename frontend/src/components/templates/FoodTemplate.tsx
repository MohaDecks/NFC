import type { PublicProfile } from "@/types";
import { RestaurantPlace } from "@/components/public/RestaurantPlace";

export function FoodTemplate({ profile }: { profile: PublicProfile }) {
  return <RestaurantPlace profile={profile} />;
}
