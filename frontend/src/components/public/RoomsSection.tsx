import { ROOM_TYPE_LABELS, type RoomType } from "@shared/profileTypes";
import type { PublicProfile } from "@/types";
import { formatPrice } from "@/lib/utils";
import { mediaSrc } from "@/lib/media";
import { cardClass, chipClass, mutedClass, sectionTitleClass, type PublicTone } from "./tone";

export function RoomsSection({ profile, tone }: { profile: PublicProfile; tone: PublicTone }) {
  const rooms = (profile.rooms ?? []).filter((room) => room.available !== false);
  if (!rooms.length) return null;

  return (
    <section className="public-in space-y-6">
      <div>
        <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${mutedClass(tone)}`}>Stay</p>
        <h2 className={`${sectionTitleClass(tone)} mb-0`} style={tone === "luxury" || tone === "hotel" ? undefined : { color: "var(--p)" }}>
          Rooms
        </h2>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {rooms.map((room) => {
          const type = (room.roomType ?? "double") as RoomType;
          return (
            <article key={room.id} className={cardClass(tone, "overflow-hidden p-0 transition duration-300 hover:-translate-y-1 hover:shadow-lg")}>
              {room.imageUrls[0] ? (
                <img src={mediaSrc(room.imageUrls[0], 1200)} alt="" className="aspect-[16/10] w-full object-cover" loading="lazy" />
              ) : (
                <div className="flex aspect-[16/10] items-center justify-center text-sm" style={{ background: "color-mix(in oklab, var(--p) 10%, transparent)", color: "var(--p)" }}>
                  {ROOM_TYPE_LABELS[type]} room
                </div>
              )}
              <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--p)" }}>
                      {ROOM_TYPE_LABELS[type]}
                    </p>
                    <h3 className="mt-1 text-xl font-semibold">{room.name}</h3>
                  </div>
                  {room.price > 0 && (
                    <div className="text-right">
                      <p className="text-lg font-bold" style={{ color: "var(--p)" }}>
                        {formatPrice(room.price, room.currency)}
                      </p>
                      <p className={`text-[11px] ${mutedClass(tone)}`}>per night</p>
                    </div>
                  )}
                </div>
                <p className={`mt-3 text-sm ${mutedClass(tone)}`}>
                  {[
                    room.capacity > 0 ? (room.capacity === 1 ? "1 guest" : `Up to ${room.capacity} guests`) : null,
                    room.beds ? (room.beds === 1 ? "1 bed" : `${room.beds} beds`) : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {room.description && <p className={`mt-3 text-sm leading-relaxed ${mutedClass(tone)}`}>{room.description}</p>}
                {room.amenities.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {room.amenities.map((item) => (
                      <span key={item} className={chipClass(tone)}>{item}</span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
