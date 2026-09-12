import type { PublicProfile } from "@/types";
import { collectSocials } from "@/lib/collectSocials";
import { cardClass, sectionTitleClass, type PublicTone } from "./tone";
import { SOCIAL_COLORS, SocialBrandIcon } from "./SocialBrandIcon";

export function SocialLinks({ profile, tone }: { profile: PublicProfile; tone: PublicTone }) {
  const links = collectSocials(profile);
  if (!links.length) return null;

  return (
    <section className={cardClass(tone)}>
      <h2 className={sectionTitleClass(tone)} style={tone === "luxury" || tone === "hotel" ? undefined : { color: "var(--p)" }}>
        Social
      </h2>
      <div className="flex flex-wrap gap-3">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            aria-label={link.label}
            className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-medium text-white transition hover:-translate-y-0.5"
            style={{
              background: SOCIAL_COLORS[link.kind],
              color: link.kind === "snapchat" ? "#111827" : "#fff",
            }}
          >
            <SocialBrandIcon kind={link.kind} className="h-5 w-5" />
            {link.label}
          </a>
        ))}
      </div>
    </section>
  );
}
