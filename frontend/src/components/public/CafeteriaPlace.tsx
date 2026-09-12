import { Coffee } from "lucide-react";
import type { PublicMenuItem, PublicProfile } from "@/types";
import { mediaSrc } from "@/lib/media";
import { realAddress } from "@/lib/location";
import { formatPrice, mapsLink, whatsappLink } from "@/lib/utils";
import { HiHelloShell } from "./HiHelloShell";
import { LocationSection } from "./LocationSection";

export function CafeteriaPlace({ profile }: { profile: PublicProfile }) {
  const items = profile.menu.flatMap((category) => category.items.filter((item) => item.available !== false));
  const phone = profile.contact.phone;
  const wa = whatsappLink(profile.contact.whatsapp || profile.contact.phone);
  const bookHref = wa || (phone ? `tel:${phone}` : "");
  const address = realAddress(profile.location);
  const maps = mapsLink(address, profile.location.mapsUrl, profile.location.latitude, profile.location.longitude);

  return (
    <HiHelloShell
      profile={profile}
      kindLabel="Cafeteria"
      cta={bookHref ? { href: bookHref, label: "Order now" } : undefined}
    >
      {items.length > 0 && (
        <section id="menu" className="mt-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9CA3AF]">Menu</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">Today’s board</h2>
          <div className="mt-4 space-y-2">
            {items.map((item) => (
              <MenuLine key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {profile.media.gallery.length > 0 && (
        <section id="gallery" className="mt-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9CA3AF]">Gallery</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {profile.media.gallery.map((src) => (
              <img key={src} src={mediaSrc(src, 700)} alt="" className="h-36 w-full rounded-2xl object-cover" />
            ))}
          </div>
        </section>
      )}

      {(address || maps) && (
        <div id="location" className="mt-10">
          <LocationSection profile={profile} tone="business" />
        </div>
      )}
    </HiHelloShell>
  );
}

function MenuLine({ item }: { item: PublicMenuItem }) {
  return (
    <article className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
      {item.imageUrl ? (
        <img src={mediaSrc(item.imageUrl, 160)} alt="" className="h-12 w-12 rounded-full object-cover" />
      ) : (
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F3F4F6] text-[#6B7280]">
          <Coffee className="h-4 w-4" />
        </span>
      )}
      <p className="min-w-0 flex-1 truncate text-[14px] font-medium">{item.name}</p>
      <p className="shrink-0 text-[14px] font-semibold tabular-nums">{formatPrice(item.price, item.currency)}</p>
    </article>
  );
}
