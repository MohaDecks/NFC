import { Hotel } from "lucide-react";
import type { HotelRoomItem, PublicProfile } from "@/types";
import { mediaSrc } from "@/lib/media";
import { realAddress } from "@/lib/location";
import { formatPrice, mapsLink, whatsappLink } from "@/lib/utils";
import { HiHelloShell } from "./HiHelloShell";
import { LocationSection } from "./LocationSection";

export function HotelPlace({ profile }: { profile: PublicProfile }) {
  const rooms = (profile.rooms ?? []).filter((room) => room.available !== false);
  const phone = profile.contact.phone;
  const wa = whatsappLink(profile.contact.whatsapp || profile.contact.phone);
  const bookHref = wa || (phone ? `tel:${phone}` : "");
  const address = realAddress(profile.location);
  const maps = mapsLink(address, profile.location.mapsUrl, profile.location.latitude, profile.location.longitude);

  return (
    <HiHelloShell
      profile={profile}
      kindLabel="Hotel"
      cta={bookHref ? { href: bookHref, label: "Book now" } : undefined}
    >
      {rooms.length > 0 && (
        <section id="rooms" className="mt-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9CA3AF]">Rooms</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">Stay with us</h2>
          <div className="mt-4 space-y-3">
            {rooms.map((room) => (
              <RoomRow key={room.id} room={room} />
            ))}
          </div>
        </section>
      )}

      {profile.services.length > 0 && (
        <section id="services" className="mt-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9CA3AF]">Services</p>
          <div className="mt-3 space-y-2">
            {profile.services.map((service) => (
              <article key={service.id} className="rounded-2xl bg-white px-4 py-4 shadow-sm">
                <h3 className="text-[15px] font-semibold">{service.name}</h3>
                {service.description && <p className="mt-1 text-sm leading-6 text-[#6B7280]">{service.description}</p>}
              </article>
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
          <LocationSection profile={profile} tone="business" />
        </div>
      )}
    </HiHelloShell>
  );
}

function RoomRow({ room }: { room: HotelRoomItem }) {
  const image = room.imageUrls[0];
  return (
    <article className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm">
      {image ? (
        <img src={mediaSrc(image, 400)} alt="" className="h-20 w-20 rounded-2xl object-cover" />
      ) : (
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#F3F4F6] text-[#6B7280]">
          <Hotel className="h-6 w-6" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[15px] font-semibold">{room.name}</h3>
        {room.description && <p className="mt-0.5 line-clamp-2 text-[13px] text-[#6B7280]">{room.description}</p>}
        {room.price > 0 && (
          <p className="mt-1 text-[13px] font-semibold">{formatPrice(room.price, room.currency)} / night</p>
        )}
      </div>
    </article>
  );
}
