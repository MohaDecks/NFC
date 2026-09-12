import type { PublicProfile } from "@/types";
import { HiHelloShell } from "@/components/public/HiHelloShell";
import { PlaceExtras } from "@/components/public/PlaceExtras";
import { whatsappLink } from "@/lib/utils";

export function DoctorTemplate({ profile }: { profile: PublicProfile }) {
  const book = whatsappLink(profile.contact.whatsapp || profile.contact.phone);
  return (
    <HiHelloShell
      profile={profile}
      kindLabel="Doctor"
      cta={book ? { href: book, label: "Book appointment" } : undefined}
    >
      <PlaceExtras profile={profile} />
    </HiHelloShell>
  );
}
