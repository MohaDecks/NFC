import { useEffect, useMemo, useState, type ReactNode } from "react";
import { GripVertical, Eye, EyeOff, Monitor, Plus, Smartphone, Trash2 } from "lucide-react";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { ROOM_TYPE_LABELS, ROOM_TYPES, type RoomType } from "@shared/profileTypes";
import { SECTION_REGISTRY, SECTION_TYPES, type SectionType } from "@shared/sections";
import { api } from "@/lib/api";
import { friendlyError } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ProfileRenderer } from "@/components/templates/registry";
import { OpeningHoursEditor, SocialLinksEditor, TagInput } from "@/components/profile/FieldEditors";
import { AdminMenuBuilder } from "@/components/admin/AdminMenuBuilder";
import { AdminServicesBuilder } from "@/components/admin/AdminServicesBuilder";
import { ImageUpload } from "@/components/profile/ImageUpload";
import { ownerToPublic, type AdminProfile, type HotelRoomItem, type HotelServiceItem, type MenuCategory, type ProfileSectionItem, type PublicProfile } from "@/types";

export function ProfileBuilder({ profile, onChange }: { profile: AdminProfile; onChange: (profile: AdminProfile) => void }) {
  const [sections, setSections] = useState<ProfileSectionItem[]>(profile.sections ?? []);
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");
  const [extras, setExtras] = useState<Pick<PublicProfile, "menu" | "services" | "rooms">>({ menu: [], services: [], rooms: [] });
  const [device, setDevice] = useState<"mobile" | "desktop">("mobile");
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const active = sections.find((section) => section.id === activeId) ?? sections[0];
  const preview = useMemo(() => ownerToPublic({ ...profile, sections }, extras), [profile, sections, extras]);

  async function load() {
    const data = await api.get<{ sections: ProfileSectionItem[] }>(`/api/admin/profiles/${profile.id}/sections`);
    setSections(data.sections);
    onChange({ ...profile, sections: data.sections });
    setActiveId((current) => current || data.sections[0]?.id || "");
  }

  async function loadExtras() {
    const [menu, services, rooms] = await Promise.all([
      api.get<{ categories: MenuCategory[] }>(`/api/admin/profiles/${profile.id}/menu`).catch(() => ({ categories: [] })),
      api.get<{ services: HotelServiceItem[] }>(`/api/admin/profiles/${profile.id}/services`).catch(() => ({ services: [] })),
      api.get<{ rooms: HotelRoomItem[] }>(`/api/admin/profiles/${profile.id}/rooms`).catch(() => ({ rooms: [] })),
    ]);
    setExtras({
      menu: menu.categories.map((category) => ({
        id: category.id,
        name: category.name,
        description: category.description,
        items: category.items.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          currency: item.currency,
          imageUrl: item.imageUrl,
          available: item.available,
          featured: item.featured,
          tags: item.tags,
        })),
      })),
      services: services.services.map((service) => ({
        id: service.id,
        name: service.name,
        description: service.description,
        icon: service.icon,
        imageUrl: service.imageUrl,
      })),
      rooms: rooms.rooms,
    });
  }

  useEffect(() => {
    void load().catch((err) => toast.error(friendlyError(err)));
    void loadExtras().catch(() => undefined);
  }, [profile.id]);

  async function onDrag(event: DragEndEvent) {
    const { active: drag, over } = event;
    if (!over || drag.id === over.id) return;
    const oldIndex = sections.findIndex((section) => section.id === drag.id);
    const newIndex = sections.findIndex((section) => section.id === over.id);
    const next = arrayMove(sections, oldIndex, newIndex);
    setSections(next);
    await api.patch(`/api/admin/profiles/${profile.id}/sections/reorder`, { orderedIds: next.map((section) => section.id) });
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)_320px]">
      <div className="rounded-2xl border bg-white p-3">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sections</p>
          <select
            className="h-8 rounded-md border px-2 text-xs"
            defaultValue=""
            onChange={async (e) => {
              const type = e.target.value as SectionType;
              if (!type) return;
              await api.post(`/api/admin/profiles/${profile.id}/sections`, { type });
              e.target.value = "";
              await load();
            }}
          >
            <option value="">Add</option>
            {SECTION_TYPES.map((type) => (
              <option key={type} value={type}>{SECTION_REGISTRY[type].label}</option>
            ))}
          </select>
        </div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(event) => void onDrag(event)}>
          <SortableContext items={sections.map((section) => section.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-1">
              {sections.map((section) => (
                <SortableRow key={section.id} id={section.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(section.id)}
                    className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm ${section.id === active?.id ? "bg-[#1b6b5a]/10 text-[#1b6b5a]" : "hover:bg-black/5"}`}
                  >
                    <span>{section.title}</span>
                    {!section.visible && <EyeOff className="h-3.5 w-3.5 opacity-50" />}
                  </button>
                </SortableRow>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="rounded-2xl border bg-white p-5">
        {active ? (
          <SectionEditor
            profile={profile}
            section={active}
            onProfile={onChange}
            onSection={async (next) => {
              await api.patch(`/api/admin/sections/${active.id}`, next);
              await load();
            }}
            onDelete={async () => {
              await api.delete(`/api/admin/sections/${active.id}`);
              await load();
            }}
          />
        ) : (
          <p className="text-sm text-muted-foreground">Add a section to start building this presence.</p>
        )}
      </div>

      <div>
        <div className="mb-2 flex justify-end gap-1">
          <Button size="sm" variant={device === "mobile" ? "default" : "outline"} onClick={() => setDevice("mobile")}>
            <Smartphone className="h-3.5 w-3.5" /> Phone
          </Button>
          <Button size="sm" variant={device === "desktop" ? "default" : "outline"} onClick={() => setDevice("desktop")}>
            <Monitor className="h-3.5 w-3.5" /> Desktop
          </Button>
        </div>
        <div className={`overflow-hidden border bg-white shadow-xl ${device === "mobile" ? "mx-auto w-[320px] rounded-[2rem]" : "rounded-2xl"}`}>
          <div className="h-[720px] overflow-y-auto">
            <ProfileRenderer profile={preview} template={profile.design.template} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SortableRow({ id, children }: { id: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className="flex items-center gap-1">
      <button type="button" className="text-muted-foreground" {...attributes} {...listeners}><GripVertical className="h-3.5 w-3.5" /></button>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function SectionEditor({
  profile,
  section,
  onProfile,
  onSection,
  onDelete,
}: {
  profile: AdminProfile;
  section: ProfileSectionItem;
  onProfile: (profile: AdminProfile) => void;
  onSection: (patch: Partial<ProfileSectionItem>) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [title, setTitle] = useState(section.title);
  const [content, setContent] = useState(section.content);
  useEffect(() => {
    setTitle(section.title);
    setContent(section.content);
  }, [section]);

  async function saveProfile(patch: Record<string, unknown>) {
    const data = await api.patch<{ profile: AdminProfile }>(`/api/admin/profiles/${profile.id}`, patch);
    onProfile(data.profile);
    toast.success("Saved");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl">{section.title}</h2>
          <p className="text-sm text-muted-foreground">{SECTION_REGISTRY[section.type]?.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={section.visible} onCheckedChange={(visible) => void onSection({ visible })} />
          {section.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          <Button size="icon" variant="ghost" onClick={() => void onDelete()}><Trash2 className="h-4 w-4" /></Button>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Section title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} onBlur={() => void onSection({ title })} />
      </div>

      {section.type === "about" && (
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea value={profile.description} onChange={(e) => onProfile({ ...profile, description: e.target.value })} onBlur={() => void saveProfile({ description: profile.description })} />
        </div>
      )}
      {section.type === "contact" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Phone" value={profile.contact.phone} onChange={(phone) => onProfile({ ...profile, contact: { ...profile.contact, phone } })} onBlur={() => void saveProfile({ contact: profile.contact })} />
          <Field label="WhatsApp" value={profile.contact.whatsapp} onChange={(whatsapp) => onProfile({ ...profile, contact: { ...profile.contact, whatsapp } })} onBlur={() => void saveProfile({ contact: profile.contact })} />
          <Field label="Email" value={profile.contact.email} onChange={(email) => onProfile({ ...profile, contact: { ...profile.contact, email } })} onBlur={() => void saveProfile({ contact: profile.contact })} />
          <Field label="Website" value={profile.contact.website} onChange={(website) => onProfile({ ...profile, contact: { ...profile.contact, website } })} onBlur={() => void saveProfile({ contact: profile.contact })} />
        </div>
      )}
      {section.type === "hours" && <OpeningHoursEditor value={profile.openingHours} onChange={(openingHours) => void saveProfile({ openingHours })} />}
      {section.type === "social" && <SocialLinksEditor value={profile.socialLinks} onChange={(socialLinks) => void saveProfile({ socialLinks })} />}
      {section.type === "location" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Address" value={profile.location.address} onChange={(address) => onProfile({ ...profile, location: { ...profile.location, address } })} onBlur={() => void saveProfile({ location: profile.location })} />
          <Field label="City" value={profile.location.city} onChange={(city) => onProfile({ ...profile, location: { ...profile.location, city } })} onBlur={() => void saveProfile({ location: profile.location })} />
          <Field label="Country" value={profile.location.country} onChange={(country) => onProfile({ ...profile, location: { ...profile.location, country } })} onBlur={() => void saveProfile({ location: profile.location })} />
          <Field label="Maps URL" value={profile.location.mapsUrl} onChange={(mapsUrl) => onProfile({ ...profile, location: { ...profile.location, mapsUrl } })} onBlur={() => void saveProfile({ location: profile.location })} />
          <Field
            label="Latitude"
            value={profile.location.latitude == null ? "" : String(profile.location.latitude)}
            onChange={(value) => onProfile({ ...profile, location: { ...profile.location, latitude: value === "" ? null : Number(value) } })}
            onBlur={() => void saveProfile({ location: { ...profile.location, latitude: Number.isFinite(profile.location.latitude as number) ? profile.location.latitude : null } })}
          />
          <Field
            label="Longitude"
            value={profile.location.longitude == null ? "" : String(profile.location.longitude)}
            onChange={(value) => onProfile({ ...profile, location: { ...profile.location, longitude: value === "" ? null : Number(value) } })}
            onBlur={() => void saveProfile({ location: { ...profile.location, longitude: Number.isFinite(profile.location.longitude as number) ? profile.location.longitude : null } })}
          />
        </div>
      )}
      {section.type === "amenities" && <TagInput value={profile.amenities} onChange={(amenities) => void saveProfile({ amenities })} placeholder="WiFi, Pool..." />}
      {section.type === "gallery" && (
        <div className="space-y-3">
          <ImageUpload
            label="Add gallery image"
            kind="gallery"
            profileId={profile.id}
            onChange={async (media) => {
              if (!media) return;
              const data = await api.patch<{ profile: AdminProfile }>(`/api/admin/profiles/${profile.id}`, {
                gallery: [...profile.gallery, media.id],
              });
              onProfile(data.profile);
            }}
          />
          <div className="grid grid-cols-3 gap-3">
            {profile.galleryUrls.map((url, index) => (
              <img key={`${url}-${index}`} src={url} alt="" className="h-20 w-full rounded-xl object-cover" />
            ))}
          </div>
        </div>
      )}
      {section.type === "menu" && <AdminMenuBuilder profile={profile} />}
      {section.type === "services" && <AdminServicesBuilder profileId={profile.id} />}
      {section.type === "rooms" && <RoomsEditor profileId={profile.id} />}
      {["testimonials", "faq", "experience", "skills", "portfolio", "products", "cta", "booking", "links"].includes(section.type) && (
        <GenericContent content={content} onChange={setContent} onSave={() => void onSection({ content })} />
      )}
      {section.type === "hero" && <p className="text-sm text-muted-foreground">Hero uses the profile name, tagline, logo, and cover from Overview and Media.</p>}
    </div>
  );
}

function GenericContent({
  content,
  onChange,
  onSave,
}: {
  content: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
  onSave: () => void;
}) {
  const heading = String(content.heading ?? "");
  const body = String(content.body ?? "");
  const items = (Array.isArray(content.items) ? content.items : []) as { title?: string; text?: string; url?: string }[];
  return (
    <div className="space-y-3">
      <Field label="Heading" value={heading} onChange={(value) => onChange({ ...content, heading: value })} />
      <div className="space-y-2">
        <Label>Body</Label>
        <Textarea value={body} onChange={(e) => onChange({ ...content, body: e.target.value })} />
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="grid gap-2 rounded-xl border p-3 sm:grid-cols-3">
            <Input placeholder="Title" value={item.title ?? ""} onChange={(e) => {
              const next = items.slice();
              next[index] = { ...item, title: e.target.value };
              onChange({ ...content, items: next });
            }} />
            <Input placeholder="Text" value={item.text ?? ""} onChange={(e) => {
              const next = items.slice();
              next[index] = { ...item, text: e.target.value };
              onChange({ ...content, items: next });
            }} />
            <Input placeholder="URL" value={item.url ?? ""} onChange={(e) => {
              const next = items.slice();
              next[index] = { ...item, url: e.target.value };
              onChange({ ...content, items: next });
            }} />
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={() => onChange({ ...content, items: [...items, { title: "", text: "" }] })}>
          <Plus className="h-3.5 w-3.5" /> Add item
        </Button>
      </div>
      <Button onClick={onSave}>Save section</Button>
    </div>
  );
}

function RoomsEditor({ profileId }: { profileId: string }) {
  const [rooms, setRooms] = useState<HotelRoomItem[]>([]);
  async function load() {
    const data = await api.get<{ rooms: HotelRoomItem[] }>(`/api/admin/profiles/${profileId}/rooms`);
    setRooms(data.rooms);
  }
  useEffect(() => { void load(); }, [profileId]);

  async function add(roomType: RoomType) {
    const defaults: Record<RoomType, { name: string; price: number; capacity: number; beds: number }> = {
      single: { name: "Single Room", price: 1800, capacity: 1, beds: 1 },
      double: { name: "Double Room", price: 2800, capacity: 2, beds: 1 },
      twin: { name: "Twin Room", price: 2600, capacity: 2, beds: 2 },
      deluxe: { name: "Deluxe Room", price: 4200, capacity: 2, beds: 1 },
      suite: { name: "Suite", price: 6500, capacity: 3, beds: 1 },
      family: { name: "Family Room", price: 5200, capacity: 4, beds: 2 },
    };
    const preset = defaults[roomType];
    await api.post(`/api/admin/profiles/${profileId}/rooms`, { ...preset, roomType, currency: "ETB" });
    await load();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {ROOM_TYPES.map((type) => (
          <Button key={type} size="sm" variant="outline" onClick={() => void add(type)}>
            + {ROOM_TYPE_LABELS[type]}
          </Button>
        ))}
      </div>
      {rooms.map((room) => (
        <div key={room.id} className="rounded-2xl border bg-[#fbfaf6] p-4">
          {room.imageUrls[0] && <img src={room.imageUrls[0]} alt="" className="mb-3 h-36 w-full rounded-xl object-cover" />}
          <div className="grid gap-2 sm:grid-cols-2">
            <Input defaultValue={room.name} onBlur={(e) => void api.patch(`/api/admin/rooms/${room.id}`, { name: e.target.value })} />
            <select
              className="h-10 rounded-md border bg-background px-3 text-sm"
              defaultValue={room.roomType ?? "double"}
              onChange={(e) => void api.patch(`/api/admin/rooms/${room.id}`, { roomType: e.target.value })}
            >
              {ROOM_TYPES.map((type) => (
                <option key={type} value={type}>{ROOM_TYPE_LABELS[type]}</option>
              ))}
            </select>
            <Input type="number" defaultValue={room.price} onBlur={(e) => void api.patch(`/api/admin/rooms/${room.id}`, { price: Number(e.target.value) })} />
            <Input defaultValue={room.currency} onBlur={(e) => void api.patch(`/api/admin/rooms/${room.id}`, { currency: e.target.value })} />
            <Input type="number" defaultValue={room.capacity} placeholder="Guests" onBlur={(e) => void api.patch(`/api/admin/rooms/${room.id}`, { capacity: Number(e.target.value) })} />
            <Input type="number" defaultValue={room.beds ?? 1} placeholder="Beds" onBlur={(e) => void api.patch(`/api/admin/rooms/${room.id}`, { beds: Number(e.target.value) })} />
            <Input defaultValue={room.amenities.join(", ")} placeholder="WiFi, TV, Balcony" onBlur={(e) => void api.patch(`/api/admin/rooms/${room.id}`, { amenities: e.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} />
          </div>
          <Textarea className="mt-2" defaultValue={room.description} placeholder="Room description" onBlur={(e) => void api.patch(`/api/admin/rooms/${room.id}`, { description: e.target.value })} />
          <div className="mt-3">
            <ImageUpload
              label="Room photo"
              kind="room"
              profileId={profileId}
              previewUrl={room.imageUrls[0]}
              onChange={async (media) => {
                if (!media) return;
                await api.patch(`/api/admin/rooms/${room.id}`, { images: [...(room.images ?? []), media.id] });
                await load();
              }}
            />
          </div>
          <div className="mt-2 flex justify-end">
            <Button size="sm" variant="ghost" onClick={async () => { await api.delete(`/api/admin/rooms/${room.id}`); await load(); }}>Remove</Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function Field({ label, value, onChange, onBlur }: { label: string; value: string; onChange: (value: string) => void; onBlur?: () => void }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
    </div>
  );
}
