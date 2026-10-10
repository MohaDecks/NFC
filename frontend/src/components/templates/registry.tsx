import type { TemplateId } from "@shared/profileTypes";
import type { PublicProfile } from "@/types";
import { ThemeFrame } from "./ThemeFrame";
import { FreeSite } from "./FreeSite";

export function ProfileRenderer({
  profile,
  className,
}: {
  profile: PublicProfile;
  template?: TemplateId;
  fullPage?: boolean;
  className?: string;
}) {
  return (
    <ThemeFrame design={profile.design} className={className}>
      <FreeSite profile={profile} />
    </ThemeFrame>
  );
}
