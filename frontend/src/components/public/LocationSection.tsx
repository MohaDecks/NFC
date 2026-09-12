import { MapPin } from "lucide-react";
import type { PublicProfile } from "@/types";
import { fullAddress } from "@/lib/media";
import { mapsEmbedSrc, mapsLink } from "@/lib/utils";
import { cardClass, mutedClass, sectionTitleClass, type PublicTone } from "./tone";

export function LocationSection({ profile, tone }: { profile: PublicProfile; tone: PublicTone }) {
  const address = fullAddress(profile.location);
  const maps = mapsLink(address, profile.location.mapsUrl, profile.location.latitude, profile.location.longitude);
  const embed = mapsEmbedSrc(address, profile.location.mapsUrl, profile.location.latitude, profile.location.longitude);
  if (!address && !maps) return null;

  return (
    <section className={cardClass(tone, "overflow-hidden p-0")}>
      <div className="p-5 md:p-7">
        <h2 className={sectionTitleClass(tone)} style={tone === "luxury" || tone === "hotel" ? undefined : { color: "var(--p)" }}>
          Location
        </h2>
        {address && (
          <p className={`flex items-start gap-2 text-base md:text-lg ${mutedClass(tone)}`}>
            <MapPin className="mt-1 h-4 w-4 shrink-0" style={{ color: "var(--p)" }} />
            {address}
          </p>
        )}
        {maps && (
          <a
            href={maps}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex min-h-11 items-center rounded-[var(--btn-radius)] px-5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: "var(--p)" }}
          >
            Open map
          </a>
        )}
      </div>
      {embed && (
        <iframe
          title={`${profile.name} location`}
          src={embed}
          className="h-64 w-full border-0 md:h-80"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}
    </section>
  );
}
