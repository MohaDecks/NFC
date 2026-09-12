import type { PublicProfile } from "@/types";
import { cardClass, mutedClass, sectionTitleClass, type PublicTone } from "./tone";

export function AboutSection({ profile, tone }: { profile: PublicProfile; tone: PublicTone }) {
  if (!profile.description) return null;
  return (
    <section className={cardClass(tone)}>
      <h2 className={sectionTitleClass(tone)} style={tone === "luxury" || tone === "hotel" ? undefined : { color: "var(--p)" }}>
        About
      </h2>
      <p className={`whitespace-pre-wrap text-base leading-relaxed @md:text-lg ${mutedClass(tone)}`}>
        {profile.description}
      </p>
    </section>
  );
}
