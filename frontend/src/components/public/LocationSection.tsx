import { MapPin } from "lucide-react";
import type { PublicProfile } from "@/types";
import { realAddress } from "@/lib/location";
import { mapsEmbedSrc, mapsLink } from "@/lib/utils";

export function LocationSection({ profile }: { profile: PublicProfile; tone?: string }) {
  const address = realAddress(profile.location);
  const maps = mapsLink(address, profile.location.mapsUrl, profile.location.latitude, profile.location.longitude);
  const embed = mapsEmbedSrc(address, profile.location.mapsUrl, profile.location.latitude, profile.location.longitude);
  if (!address && !maps) return null;

  return (
    <section className="overflow-hidden rounded-[24px] bg-white shadow-[0_10px_30px_rgba(17,24,39,0.05)] [transform:translateZ(0)]">
      <div className="p-5">
        <h2 className="text-lg font-semibold tracking-tight">Location</h2>
        {address && (
          <p className="mt-2 flex items-start gap-2 text-[14px] leading-6 text-[#6B7280]">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#6D28D9]" />
            {address}
          </p>
        )}
        {maps && (
          <a
            href={maps}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex h-11 items-center rounded-full bg-[#111827] px-5 text-sm font-semibold text-white"
          >
            Open map
          </a>
        )}
      </div>
      {embed && (
        <div className="relative h-56 overflow-hidden [clip-path:inset(0)] [transform:translateZ(0)] [-webkit-mask-image:-webkit-radial-gradient(white,black)]">
          <iframe
            title={`${profile.name} location`}
            src={embed}
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}
    </section>
  );
}
