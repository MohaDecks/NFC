import type { PublicProfile } from "@/types";
import { cardClass, mutedClass, sectionTitleClass, type PublicTone } from "./tone";

export function OpeningHours({ profile, tone }: { profile: PublicProfile; tone: PublicTone }) {
  if (!profile.openingHours?.length) return null;
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

  return (
    <section className={cardClass(tone)}>
      <h2 className={sectionTitleClass(tone)} style={tone === "luxury" || tone === "hotel" ? undefined : { color: "var(--p)" }}>
        Opening Hours
      </h2>
      <div className="space-y-1.5">
        {profile.openingHours.map((row) => {
          const isToday = row.day === today;
          return (
            <div
              key={row.day}
              className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm @md:text-base"
              style={
                isToday
                  ? { background: "color-mix(in oklab, var(--p) 12%, transparent)", color: "var(--p)" }
                  : undefined
              }
            >
              <span className={isToday ? "font-semibold" : ""}>
                {row.day}
                {isToday ? " · Today" : ""}
              </span>
              <span className={isToday ? "font-semibold" : mutedClass(tone)}>
                {row.closed ? "Closed" : `${row.open} – ${row.close}`}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
