import type { PublicProfile } from "@/types";
import { mutedClass, type PublicTone } from "./tone";
import { useBranding } from "@/hooks/useBranding";

export function ProfileFooter({ profile, tone }: { profile: PublicProfile; tone: PublicTone }) {
  const { brandName } = useBranding();
  return (
    <footer className={`public-in border-t ${tone === "luxury" || tone === "hotel" || tone === "engineer" || tone === "cafeteria" || tone === "portfolio" ? "border-white/10" : "border-black/5"} px-1 pb-4 pt-8 text-center`}>
      <p className="text-base font-semibold">{profile.name}</p>
      {profile.tagline && <p className={`mt-1 text-sm ${mutedClass(tone)}`}>{profile.tagline}</p>}
      <p className={`mt-4 text-xs ${mutedClass(tone)}`}>{brandName} · Digital presence · NFC · QR</p>
    </footer>
  );
}
