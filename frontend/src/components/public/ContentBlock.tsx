import type { ProfileSectionItem } from "@/types";
import { cardClass, chipClass, mutedClass, sectionTitleClass, type PublicTone } from "./tone";
import { websiteLink } from "@/lib/utils";

type ContentItem = { title?: string; text?: string; url?: string; image?: string };

export function ContentBlock({ section, tone }: { section: ProfileSectionItem; tone: PublicTone }) {
  const heading = String(section.content.heading ?? section.title ?? "");
  const body = String(section.content.body ?? "");
  const items = (Array.isArray(section.content.items) ? section.content.items : []) as ContentItem[];
  const visibleItems = items.filter((item) => item.title || item.text || item.url);
  if (!body && !visibleItems.length) return null;

  if (section.type === "skills") {
    return (
      <section className={cardClass(tone)}>
        {heading && <h2 className={sectionTitleClass(tone)} style={accent(tone)}>{heading}</h2>}
        {body && <p className={`mb-4 whitespace-pre-wrap ${mutedClass(tone)}`}>{body}</p>}
        <div className="flex flex-wrap gap-2">
          {visibleItems.map((item, index) => (
            <span key={`${item.title}-${index}`} className={chipClass(tone)}>
              {item.title || item.text}
            </span>
          ))}
        </div>
      </section>
    );
  }

  if (section.type === "experience") {
    return (
      <section className={cardClass(tone)}>
        {heading && <h2 className={sectionTitleClass(tone)} style={accent(tone)}>{heading}</h2>}
        {body && <p className={`mb-6 whitespace-pre-wrap ${mutedClass(tone)}`}>{body}</p>}
        <div className="space-y-5 border-l border-black/10 pl-5">
          {visibleItems.map((item, index) => (
            <div key={`${item.title}-${index}`}>
              <h3 className="font-semibold">{item.title}</h3>
              {item.text && <p className={`mt-1 text-sm leading-relaxed ${mutedClass(tone)}`}>{item.text}</p>}
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (section.type === "portfolio") {
    return (
      <section className="public-in space-y-5">
        {heading && <h2 className={sectionTitleClass(tone)} style={accent(tone)}>{heading}</h2>}
        {body && <p className={`whitespace-pre-wrap ${mutedClass(tone)}`}>{body}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          {visibleItems.map((item, index) => {
            const href = item.url ? websiteLink(item.url) : undefined;
            const inner = (
              <>
                {item.image && <img src={item.image} alt="" className="aspect-[16/10] w-full object-cover" loading="lazy" />}
                <div className="p-4">
                  <h3 className="font-semibold">{item.title}</h3>
                  {item.text && <p className={`mt-1 text-sm ${mutedClass(tone)}`}>{item.text}</p>}
                </div>
              </>
            );
            return href ? (
              <a key={`${item.title}-${index}`} href={href} target="_blank" rel="noreferrer" className={cardClass(tone, "overflow-hidden p-0 transition hover:-translate-y-1")}>
                {inner}
              </a>
            ) : (
              <article key={`${item.title}-${index}`} className={cardClass(tone, "overflow-hidden p-0")}>{inner}</article>
            );
          })}
        </div>
      </section>
    );
  }

  if (section.type === "testimonials") {
    return (
      <section className="public-in space-y-5">
        {heading && <h2 className={sectionTitleClass(tone)} style={accent(tone)}>{heading}</h2>}
        <div className="grid gap-4 md:grid-cols-2">
          {visibleItems.map((item, index) => (
            <blockquote key={`${item.title}-${index}`} className={cardClass(tone)}>
              <p className="text-lg leading-relaxed">“{item.text || item.title}”</p>
              {item.title && item.text && <footer className={`mt-3 text-sm ${mutedClass(tone)}`}>{item.title}</footer>}
            </blockquote>
          ))}
        </div>
      </section>
    );
  }

  if (section.type === "faq") {
    return (
      <section className={cardClass(tone)}>
        {heading && <h2 className={sectionTitleClass(tone)} style={accent(tone)}>{heading}</h2>}
        <div className="space-y-3">
          {visibleItems.map((item, index) => (
            <details key={`${item.title}-${index}`} className="rounded-xl border border-black/5 p-3">
              <summary className="cursor-pointer font-medium">{item.title}</summary>
              {item.text && <p className={`mt-2 text-sm leading-relaxed ${mutedClass(tone)}`}>{item.text}</p>}
            </details>
          ))}
        </div>
      </section>
    );
  }

  if (section.type === "booking" || section.type === "cta") {
    const action = visibleItems[0];
    const href = action?.url ? websiteLink(action.url) : undefined;
    return (
      <section className={cardClass(tone, "text-center")}>
        <h2 className={sectionTitleClass(tone)} style={accent(tone)}>{heading || "Get in touch"}</h2>
        {body && <p className={`mx-auto max-w-xl ${mutedClass(tone)}`}>{body}</p>}
        {href && (
          <a
            href={href}
            className="mt-5 inline-flex min-h-12 items-center rounded-[var(--btn-radius)] px-6 text-sm font-semibold text-white"
            style={{ background: "var(--p)" }}
          >
            {action?.title || "Continue"}
          </a>
        )}
      </section>
    );
  }

  return (
    <section className={cardClass(tone)}>
      {heading && <h2 className={sectionTitleClass(tone)} style={accent(tone)}>{heading}</h2>}
      {body && <p className={`whitespace-pre-wrap text-base leading-relaxed ${mutedClass(tone)}`}>{body}</p>}
      {visibleItems.length > 0 && (
        <div className="mt-4 space-y-3">
          {visibleItems.map((item, index) => {
            const href = item.url ? websiteLink(item.url) : undefined;
            return (
              <div key={`${item.title ?? "item"}-${index}`} className="border-t border-black/5 pt-3 first:border-0 first:pt-0">
                {item.title && (href ? <a href={href} target="_blank" rel="noreferrer" className="font-medium underline-offset-2 hover:underline">{item.title}</a> : <h3 className="font-medium">{item.title}</h3>)}
                {item.text && <p className={`mt-1 text-sm leading-relaxed ${mutedClass(tone)}`}>{item.text}</p>}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function accent(tone: PublicTone) {
  return tone === "luxury" || tone === "hotel" ? undefined : { color: "var(--p)" };
}
