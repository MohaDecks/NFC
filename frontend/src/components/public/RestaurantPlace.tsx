import { useMemo, useState } from "react";
import { UtensilsCrossed } from "lucide-react";
import type { PublicMenuItem, PublicProfile } from "@/types";
import { mediaSrc } from "@/lib/media";
import { realAddress } from "@/lib/location";
import { formatPrice, mapsLink, whatsappLink } from "@/lib/utils";
import { HiHelloShell } from "./HiHelloShell";
import { LocationSection } from "./LocationSection";

export function RestaurantPlace({ profile }: { profile: PublicProfile }) {
  const categories = profile.menu.filter((category) => category.items.some((item) => item.available !== false));
  const allItems = useMemo(
    () => categories.flatMap((category) => category.items.filter((item) => item.available !== false)),
    [categories],
  );
  const [active, setActive] = useState("all");
  const visible = active === "all" ? allItems : categories.find((category) => category.id === active)?.items.filter((item) => item.available !== false) ?? [];
  const phone = profile.contact.phone;
  const wa = whatsappLink(profile.contact.whatsapp || profile.contact.phone);
  const bookHref = wa || (phone ? `tel:${phone}` : "");
  const address = realAddress(profile.location);
  const maps = mapsLink(address, profile.location.mapsUrl, profile.location.latitude, profile.location.longitude);

  return (
    <HiHelloShell
      profile={profile}
      kindLabel="Restaurant"
      cta={bookHref ? { href: bookHref, label: "Reserve a table" } : undefined}
    >
      {allItems.length > 0 && (
        <section id="menu" className="mt-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9CA3AF]">Menu</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">What we serve</h2>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            <Tab label="All" selected={active === "all"} onClick={() => setActive("all")} />
            {categories.map((category) => (
              <Tab key={category.id} label={category.name} selected={active === category.id} onClick={() => setActive(category.id)} />
            ))}
          </div>
          <div className="mt-3 space-y-2">
            {visible.map((item) => (
              <MenuRow key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {profile.media.gallery.length > 0 && (
        <section id="gallery" className="mt-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9CA3AF]">Gallery</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {profile.media.gallery.map((src, index) => (
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

      {(address || maps) && (
        <div id="location" className="mt-10">
          <LocationSection profile={profile} tone="food" />
        </div>
      )}
    </HiHelloShell>
  );
}

function Tab({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-1.5 text-[13px] font-medium ${selected ? "bg-[#111827] text-white" : "bg-white text-[#6B7280]"}`}
    >
      {label}
    </button>
  );
}

function MenuRow({ item }: { item: PublicMenuItem }) {
  return (
    <article className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
      {item.imageUrl ? (
        <img src={mediaSrc(item.imageUrl, 240)} alt="" className="h-16 w-16 rounded-2xl object-cover" />
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F3F4F6] text-[#9CA3AF]">
          <UtensilsCrossed className="h-5 w-5" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[15px] font-semibold">{item.name}</h3>
        {item.description && <p className="mt-0.5 line-clamp-1 text-[12px] text-[#6B7280]">{item.description}</p>}
      </div>
      <p className="shrink-0 text-[15px] font-semibold tabular-nums">{formatPrice(item.price, item.currency)}</p>
    </article>
  );
}
