import type { PublicProfile } from "@/types";
import { DoctorPlace } from "@/components/public/DoctorPlace";

export function DoctorTemplate({ profile }: { profile: PublicProfile }) {
  return <DoctorPlace profile={profile} />;
}
