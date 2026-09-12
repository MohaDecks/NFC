import { Car, Coffee, Dumbbell, Plane, Sparkles, UtensilsCrossed, Waves, Wifi } from "lucide-react";
import type { PublicProfile } from "@/types";
import { mediaSrc } from "@/lib/media";
import { cardClass, chipClass, mutedClass, sectionTitleClass, type PublicTone } from "./tone";

const icons = {
  sparkles: Sparkles,
  wifi: Wifi,
  car: Car,
  coffee: Coffee,
  plane: Plane,
  waves: Waves,
  dumbbell: Dumbbell,
  utensils: UtensilsCrossed,
};

export function ServicesSection({ profile, tone }: { profile: PublicProfile; tone: PublicTone }) {
  if (!profile.services.length) return null;
  return (
    <section className="public-in space-y-4">
      <h2 className={`${sectionTitleClass(tone)} px-1`} style={tone === "luxury" || tone === "hotel" ? undefined : { color: "var(--p)" }}>
        Services
      </h2>
      <div className="grid gap-4 @md:grid-cols-2 @3xl:grid-cols-3">
        {profile.services.map((service) => {
          const Icon = icons[service.icon as keyof typeof icons] ?? Sparkles;
          return (
            <article key={service.id} className={cardClass(tone, "overflow-hidden p-0 transition duration-300 hover:-translate-y-1 hover:shadow-lg")}>
              {service.imageUrl ? (
                <img src={mediaSrc(service.imageUrl, 800)} alt="" className="aspect-[16/9] w-full object-cover" loading="lazy" />
              ) : (
                <div
                  className="flex aspect-[16/9] items-center justify-center"
                  style={{ background: "color-mix(in oklab, var(--p) 12%, transparent)" }}
                >
                  <Icon className="h-8 w-8" style={{ color: "var(--p)" }} />
                </div>
              )}
              <div className="p-5">
                <div className="mb-2 flex items-center gap-2">
                  <Icon className="h-4 w-4" style={{ color: "var(--p)" }} />
                  <h3 className="text-lg font-semibold">{service.name}</h3>
                </div>
                {service.description && <p className={`text-sm leading-relaxed ${mutedClass(tone)}`}>{service.description}</p>}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function AmenitiesSection({ profile, tone }: { profile: PublicProfile; tone: PublicTone }) {
  if (!profile.amenities.length) return null;
  return (
    <section className={cardClass(tone)}>
      <h2 className={sectionTitleClass(tone)} style={tone === "luxury" || tone === "hotel" ? undefined : { color: "var(--p)" }}>
        Amenities
      </h2>
      <div className="flex flex-wrap gap-2">
        {profile.amenities.map((item) => (
          <span key={item} className={chipClass(tone)}>
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}
