import type { PublicProfile } from "@/types";
import { mediaSrc } from "@/lib/media";
import { realAddress } from "@/lib/location";
import { mapsLink } from "@/lib/utils";
import { LocationSection } from "./LocationSection";
import { OpeningHours } from "./OpeningHours";

export function PlaceExtras({ profile }: { profile: PublicProfile }) {
  const gallery = profile.media.gallery;
  const services = profile.services;
  const address = realAddress(profile.location);
  const maps = mapsLink(address, profile.location.mapsUrl, profile.location.latitude, profile.location.longitude);
  const hours = profile.openingHours.filter((row) => !row.closed);

  return (
    <>
      {services.length > 0 && (
        <section className="mt-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9CA3AF]">Services</p>
          <div className="mt-3 space-y-2">
            {services.map((service) => (
              <article key={service.id} className="rounded-2xl bg-white px-4 py-4 shadow-sm">
                <h3 className="text-[15px] font-semibold">{service.name}</h3>
                {service.description && <p className="mt-1 text-sm leading-6 text-[#6B7280]">{service.description}</p>}
              </article>
            ))}
          </div>
        </section>
      )}

      {gallery.length > 0 && (
        <section className="mt-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9CA3AF]">Portfolio</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {gallery.map((src, index) => (
              <img
                key={src}
                src={mediaSrc(src, 900)}
                alt=""
                className={`w-full rounded-2xl object-cover ${index === 0 ? "col-span-2 h-52" : "h-36"}`}
              />
            ))}
          </div>
        </section>
      )}

      {hours.length > 0 && (
        <div className="mt-10">
          <OpeningHours profile={profile} tone="business" />
        </div>
      )}

      {(address || maps) && (
        <div className="mt-10">
          <LocationSection profile={profile} tone="business" />
        </div>
      )}
    </>
  );
}
