import { useMemo, useState } from "react";
import type { PublicMenuCategory, PublicMenuItem, PublicProfile } from "@/types";
import { cn, formatPrice } from "@/lib/utils";
import { mediaSrc } from "@/lib/media";
import { mutedClass, sectionTitleClass, type PublicTone } from "./tone";

export function MenuSection({ profile, tone }: { profile: PublicProfile; tone: PublicTone }) {
  const categories = profile.menu.filter((category) => category.items.some((item) => item.available !== false));
  const [active, setActive] = useState(categories[0]?.id ?? "");
  const current = useMemo(
    () => categories.find((category) => category.id === active) ?? categories[0],
    [categories, active],
  );

  if (!categories.length) return null;

  return (
    <section className="public-in space-y-6">
      <div>
        <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${mutedClass(tone)}`}>Digital menu</p>
        <h2 className={`${sectionTitleClass(tone)} mb-0`} style={tone === "luxury" || tone === "hotel" ? undefined : { color: "var(--p)" }}>
          Menu
        </h2>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((category) => {
          const selected = category.id === current.id;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => setActive(category.id)}
              className="shrink-0 px-4 py-2 text-sm font-medium transition"
              style={{
                borderRadius: "var(--btn-radius)",
                background: selected ? "var(--p)" : "color-mix(in oklab, var(--p) 10%, transparent)",
                color: selected ? "#fff" : "var(--p)",
              }}
            >
              {category.name}
            </button>
          );
        })}
      </div>
      {current && <MenuCategoryGrid category={current} tone={tone} />}
    </section>
  );
}

function MenuCategoryGrid({ category, tone }: { category: PublicMenuCategory; tone: PublicTone }) {
  const items = category.items.filter((item) => item.available !== false);
  return (
    <div>
      {category.description && <p className={`mb-5 text-sm ${mutedClass(tone)}`}>{category.description}</p>}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <FoodCard key={item.id} item={item} tone={tone} />
        ))}
      </div>
    </div>
  );
}

function FoodCard({ item, tone }: { item: PublicMenuItem; tone: PublicTone }) {
  const dark = tone === "luxury" || tone === "hotel";
  return (
    <article
      className={cn(
        "overflow-hidden rounded-[var(--radius)] transition duration-300 hover:-translate-y-1",
        dark ? "border border-white/10 bg-white/[0.04]" : "border border-black/5 bg-white shadow-[0_12px_30px_rgba(20,20,20,0.05)]",
      )}
    >
      {item.imageUrl ? (
        <img src={mediaSrc(item.imageUrl, 900)} alt="" className="aspect-[4/3] w-full object-cover" loading="lazy" />
      ) : (
        <div className="flex aspect-[4/3] items-center justify-center text-sm" style={{ background: "color-mix(in oklab, var(--p) 12%, transparent)", color: "var(--p)" }}>
          {item.name}
        </div>
      )}
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold leading-tight">{item.name}</h3>
            {item.featured && (
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--p)" }}>
                Featured
              </p>
            )}
          </div>
          <p className="shrink-0 text-base font-semibold tabular-nums" style={{ color: "var(--p)" }}>
            {formatPrice(item.price, item.currency)}
          </p>
        </div>
        {item.description && <p className={`text-sm leading-relaxed ${mutedClass(tone)}`}>{item.description}</p>}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {item.tags.map((tag) => (
              <span key={tag} className={`rounded-full px-2 py-0.5 text-[11px] ${dark ? "bg-white/8" : "bg-black/5"}`}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
