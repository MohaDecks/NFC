import type { PublicProfile, SocialLink } from "@/types";
import { detectSocialKind, socialHref, socialLabel, type SocialKind } from "./social";

export type ReadySocial = {
  kind: SocialKind;
  href: string;
  label: string;
};

export function collectSocials(profile: PublicProfile): ReadySocial[] {
  const rows: ReadySocial[] = [];
  const seen = new Set<string>();

  function add(kind: SocialKind, url: string, username?: string) {
    const href = socialHref(kind, url, username);
    if (!href || seen.has(kind) || seen.has(href)) return;
    seen.add(kind);
    seen.add(href);
    rows.push({ kind, href, label: socialLabel(kind, username) });
  }

  if (profile.contact.whatsapp) add("whatsapp", profile.contact.whatsapp);
  else if (profile.contact.phone) add("whatsapp", profile.contact.phone);

  for (const link of profile.socialLinks as SocialLink[]) {
    if (!link.url && !link.username) continue;
    add(detectSocialKind(link.platform, link.url), link.url, link.username);
  }

  return rows;
}
