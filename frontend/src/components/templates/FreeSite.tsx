import type { ReactNode } from "react";
import { Download, Globe, Mail, MapPin, Phone } from "lucide-react";
import type { ProfileSectionItem, PublicProfile } from "@/types";
import { collectSocials } from "@/lib/collectSocials";
import { itemsOf, techList, type ContentItem } from "@/lib/sectionContent";
import { fullAddress, mediaSrc } from "@/lib/media";
import { buildVCard, downloadTextFile, formatPrice, mapsEmbedSrc, mapsLink, websiteLink, whatsappLink } from "@/lib/utils";
import { SocialBrandIcon } from "@/components/public/SocialBrandIcon";

export function FreeSite({ profile }: { profile: PublicProfile }) {
  const name = profile.name?.trim() || "Profile";
  const tagline = profile.tagline?.trim() || "";
  const about = profile.description?.trim() || "";
  const photo = profile.media.avatarUrl || profile.media.logoUrl || profile.media.coverUrl;
  const logo = profile.media.logoUrl && profile.media.logoUrl !== photo ? profile.media.logoUrl : null;
  const address = fullAddress(profile.location);
  const mapHref = mapsLink(address, profile.location.mapsUrl, profile.location.latitude, profile.location.longitude);
  const mapEmbed = mapsEmbedSrc(address, profile.location.mapsUrl, profile.location.latitude, profile.location.longitude);
  const phone = profile.contact.phone?.trim() || "";
  const email = profile.contact.email?.trim() || "";
  const site = websiteLink(profile.contact.website || "");
  const wa = whatsappLink(profile.contact.whatsapp || profile.contact.phone);
  const socials = collectSocials(profile).filter((link) => link.kind !== "whatsapp" || !wa);
  const hours = profile.openingHours.filter((row) => row.day && (row.closed || row.open || row.close));
  const gallery = profile.media.gallery.filter(Boolean);
  const services = profile.services.filter((item) => item.name || item.description);
  const rooms = (profile.rooms ?? []).filter((room) => room.name);
  const menu = profile.menu.filter((category) => category.name || category.items.length);
  const amenities = profile.amenities.filter(Boolean);
  const sections = (profile.sections ?? []).filter((section) => section.visible !== false);
  const ordered = sections.length
    ? sections
    : fallbackSections(profile);

  function saveContact() {
    downloadTextFile(`${name}.vcf`, buildVCard(profile), "text/vcard");
  }

  const blocks = ordered
    .map((section) => renderSection(section, {
      profile,
      about,
      address,
      mapHref,
      mapEmbed,
      phone,
      email,
      site,
      wa,
      socials,
      hours,
      gallery,
      services,
      rooms,
      menu,
      amenities,
    }))
    .filter(Boolean);

  return (
    <div className="min-h-screen w-full bg-[#f6f7fb] text-[#17181c]">
      <header className="sticky top-0 z-20 border-b border-black/5 bg-white/85 backdrop-blur">
        <div className="flex w-full items-center justify-between gap-4 px-5 py-3 md:px-10 lg:px-14">
          <a href="#top" className="flex min-w-0 items-center gap-3">
            {logo || photo ? (
              <img src={mediaSrc(logo || photo, 120)} alt="" className="h-9 w-9 rounded-full object-cover" />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white" style={{ background: "var(--p)" }}>
                {name[0]}
              </span>
            )}
            <span className="truncate text-sm font-semibold">{name}</span>
          </a>
          <div className="flex shrink-0 items-center gap-2">
            {phone && (
              <a href={`tel:${phone}`} className="hidden h-9 items-center rounded-full px-4 text-sm font-medium text-white sm:inline-flex" style={{ background: "var(--p)" }}>
                Call
              </a>
            )}
            {wa && (
              <a href={wa} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center rounded-full border border-black/10 bg-white px-4 text-sm font-medium">
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </header>

      <section id="top" className="w-full bg-white">
        <div className="grid w-full items-center gap-8 px-5 py-10 md:px-10 md:py-14 lg:grid-cols-[minmax(0,1fr)_300px] lg:px-14 lg:py-16">
          <div className="min-w-0">
            {profile.isVerified && (
              <p className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--p)" }}>Verified</p>
            )}
            <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">{name}</h1>
            {tagline && <p className="mt-3 max-w-2xl text-lg text-[#5c6270]">{tagline}</p>}
            {address && (
              <p className="mt-4 flex items-start gap-2 text-sm text-[#5c6270]">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--p)" }} />
                <span>{address}</span>
              </p>
            )}
            <div className="mt-6 flex flex-wrap gap-2">
              {phone && <Action href={`tel:${phone}`} icon={<Phone className="h-4 w-4" />} label={phone} solid />}
              {email && <Action href={`mailto:${email}`} icon={<Mail className="h-4 w-4" />} label={email} />}
              {site && <Action href={site} icon={<Globe className="h-4 w-4" />} label="Website" external />}
              <button type="button" onClick={saveContact} className="inline-flex h-10 items-center gap-2 rounded-[var(--btn-radius)] border border-black/10 bg-white px-4 text-sm font-medium">
                <Download className="h-4 w-4" /> Save contact
              </button>
            </div>
          </div>
          {photo && (
            <img
              src={mediaSrc(photo, 800)}
              alt=""
              className="h-72 w-full max-w-sm justify-self-start rounded-[var(--radius)] object-cover shadow-[0_18px_40px_rgba(20,24,40,0.12)] lg:justify-self-end"
            />
          )}
        </div>
      </section>

      <main className="flex w-full flex-col gap-8 px-5 py-8 md:px-10 lg:px-14 lg:py-12">
        {blocks}
      </main>
    </div>
  );
}

type Bag = {
  profile: PublicProfile;
  about: string;
  address: string;
  mapHref?: string;
  mapEmbed?: string;
  phone: string;
  email: string;
  site?: string;
  wa?: string;
  socials: ReturnType<typeof collectSocials>;
  hours: PublicProfile["openingHours"];
  gallery: string[];
  services: PublicProfile["services"];
  rooms: NonNullable<PublicProfile["rooms"]>;
  menu: PublicProfile["menu"];
  amenities: string[];
};

function renderSection(section: ProfileSectionItem, bag: Bag) {
  const heading = String(section.content.heading ?? section.title ?? "");
  const body = String(section.content.body ?? "");
  const items = itemsOf(section);

  switch (section.type) {
    case "hero":
    case "footer":
      return body ? <Panel key={section.id} title={heading || section.title}><p className="whitespace-pre-line leading-7 text-[#3d4250]">{body}</p></Panel> : null;
    case "about":
      return bag.about || body ? (
        <Panel key={section.id} title={heading || "About"}>
          <p className="max-w-3xl whitespace-pre-line text-base leading-8 text-[#3d4250]">{bag.about || body}</p>
        </Panel>
      ) : null;
    case "specialization":
    case "skills":
      return items.length || body ? (
        <Panel key={section.id} title={heading || section.title}>
          {body && <p className="mb-4 whitespace-pre-line leading-7 text-[#3d4250]">{body}</p>}
          <div className="flex flex-wrap gap-2">
            {items.map((item, index) => (
              <span key={`${item.title}-${index}`} className="rounded-full bg-[#eef0f6] px-3 py-1.5 text-sm">{item.title || item.text}</span>
            ))}
          </div>
        </Panel>
      ) : null;
    case "services":
      return bag.services.length || items.length ? (
        <Panel key={section.id} title={heading || "Services"}>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {(bag.services.length ? bag.services.map((item) => ({ title: item.name, text: item.description, image: item.imageUrl || "" })) : items).map((item, index) => (
              <article key={`${item.title}-${index}`} className="overflow-hidden rounded-2xl border border-black/5 bg-[#fbfbfd]">
                {item.image && <img src={mediaSrc(item.image, 800)} alt="" className="h-36 w-full object-cover" />}
                <div className="p-4">
                  <h3 className="font-semibold">{item.title}</h3>
                  {item.text && <p className="mt-1 text-sm leading-6 text-[#5c6270]">{item.text}</p>}
                </div>
              </article>
            ))}
          </div>
        </Panel>
      ) : null;
    case "experience":
    case "education":
    case "certifications":
      return items.length || body ? (
        <Panel key={section.id} title={heading || section.title}>
          {body && <p className="mb-5 whitespace-pre-line leading-7 text-[#3d4250]">{body}</p>}
          <div className="space-y-4">
            {items.map((item, index) => <RecordCard key={`${item.title}-${index}`} item={item} />)}
          </div>
        </Panel>
      ) : null;
    case "portfolio":
    case "products":
      return items.length ? (
        <Panel key={section.id} title={heading || section.title}>
          {body && <p className="mb-5 whitespace-pre-line leading-7 text-[#3d4250]">{body}</p>}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item, index) => <WorkCard key={`${item.title}-${index}`} item={item} />)}
          </div>
        </Panel>
      ) : null;
    case "gallery":
      return bag.gallery.length ? (
        <Panel key={section.id} title={heading || "Gallery"}>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {bag.gallery.map((url, index) => (
              <img key={`${url}-${index}`} src={mediaSrc(url, 900)} alt="" className="h-44 w-full rounded-2xl object-cover md:h-56" />
            ))}
          </div>
        </Panel>
      ) : null;
    case "menu":
      return bag.menu.length ? (
        <Panel key={section.id} title={heading || "Menu"}>
          <div className="space-y-8">
            {bag.menu.map((category) => (
              <div key={category.id}>
                <h3 className="text-lg font-semibold">{category.name}</h3>
                {category.description && <p className="mt-1 text-sm text-[#5c6270]">{category.description}</p>}
                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                  {category.items.filter((item) => item.available !== false).map((item) => (
                    <article key={item.id} className="flex gap-3 rounded-2xl border border-black/5 bg-[#fbfbfd] p-3">
                      {item.imageUrl && <img src={mediaSrc(item.imageUrl, 240)} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />}
                      <div className="min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="font-medium">{item.name}</h4>
                          <span className="shrink-0 text-sm font-semibold" style={{ color: "var(--p)" }}>{formatPrice(item.price, item.currency)}</span>
                        </div>
                        {item.description && <p className="mt-1 text-sm leading-6 text-[#5c6270]">{item.description}</p>}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      ) : null;
    case "rooms":
      return bag.rooms.length ? (
        <Panel key={section.id} title={heading || "Rooms"}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {bag.rooms.map((room) => (
              <article key={room.id} className="overflow-hidden rounded-2xl border border-black/5 bg-[#fbfbfd]">
                {room.imageUrls[0] && <img src={mediaSrc(room.imageUrls[0], 900)} alt="" className="h-44 w-full object-cover" />}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold">{room.name}</h3>
                    <span className="text-sm font-semibold" style={{ color: "var(--p)" }}>{formatPrice(room.price, room.currency)}</span>
                  </div>
                  {room.description && <p className="mt-2 text-sm leading-6 text-[#5c6270]">{room.description}</p>}
                  <p className="mt-2 text-xs text-[#5c6270]">{[room.capacity ? `${room.capacity} guests` : "", room.beds ? `${room.beds} beds` : ""].filter(Boolean).join(" · ")}</p>
                  {room.amenities.length > 0 && <p className="mt-2 text-xs text-[#5c6270]">{room.amenities.join(" · ")}</p>}
                </div>
              </article>
            ))}
          </div>
        </Panel>
      ) : null;
    case "amenities":
      return bag.amenities.length ? (
        <Panel key={section.id} title={heading || "Amenities"}>
          <div className="flex flex-wrap gap-2">
            {bag.amenities.map((item) => <span key={item} className="rounded-full bg-[#eef0f6] px-3 py-1.5 text-sm">{item}</span>)}
          </div>
        </Panel>
      ) : null;
    case "hours":
      return bag.hours.length ? (
        <Panel key={section.id} title={heading || "Hours"}>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {bag.hours.map((row) => (
              <div key={row.day} className="flex items-center justify-between rounded-xl bg-[#fbfbfd] px-3 py-2 text-sm">
                <span className="font-medium">{row.day}</span>
                <span className="text-[#5c6270]">{row.closed ? "Closed" : `${row.open} – ${row.close}`}</span>
              </div>
            ))}
          </div>
        </Panel>
      ) : null;
    case "contact":
      return bag.phone || bag.email || bag.site || bag.wa ? (
        <Panel key={section.id} title={heading || "Contact"}>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {bag.phone && <Info href={`tel:${bag.phone}`} label="Phone" value={bag.phone} />}
            {bag.wa && <Info href={bag.wa} label="WhatsApp" value="Message" external />}
            {bag.email && <Info href={`mailto:${bag.email}`} label="Email" value={bag.email} />}
            {bag.site && <Info href={bag.site} label="Website" value={bag.profile.contact.website} external />}
          </div>
        </Panel>
      ) : null;
    case "social":
      return bag.socials.length ? (
        <Panel key={section.id} title={heading || "Social"}>
          <div className="flex flex-wrap gap-2">
            {bag.socials.map((link) => (
              <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-full border border-black/10 bg-white px-4 text-sm font-medium">
                <SocialBrandIcon kind={link.kind} className="h-4 w-4" />
                {link.label}
              </a>
            ))}
          </div>
        </Panel>
      ) : null;
    case "location":
      return bag.address || bag.mapEmbed ? (
        <Panel key={section.id} title={heading || "Location"}>
          {bag.address && <p className="text-[#3d4250]">{bag.address}</p>}
          {bag.mapHref && (
            <a href={bag.mapHref} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-medium" style={{ color: "var(--p)" }}>
              Open in maps
            </a>
          )}
          {bag.mapEmbed && (
            <iframe title="Map" src={bag.mapEmbed} className="mt-4 h-72 w-full rounded-2xl border-0" loading="lazy" />
          )}
        </Panel>
      ) : null;
    case "testimonials":
      return items.length ? (
        <Panel key={section.id} title={heading || section.title}>
          <div className="grid gap-3 md:grid-cols-2">
            {items.map((item, index) => (
              <blockquote key={`${item.title}-${index}`} className="rounded-2xl bg-[#fbfbfd] p-4">
                <p className="leading-7">“{item.text || item.title}”</p>
                {item.title && item.text && <footer className="mt-3 text-sm text-[#5c6270]">{item.title}</footer>}
              </blockquote>
            ))}
          </div>
        </Panel>
      ) : null;
    case "faq":
      return items.length ? (
        <Panel key={section.id} title={heading || "FAQ"}>
          <div className="space-y-2">
            {items.map((item, index) => (
              <details key={`${item.title}-${index}`} className="rounded-xl bg-[#fbfbfd] px-4 py-3">
                <summary className="cursor-pointer font-medium">{item.title}</summary>
                {item.text && <p className="mt-2 text-sm leading-6 text-[#5c6270]">{item.text}</p>}
              </details>
            ))}
          </div>
        </Panel>
      ) : null;
    case "cta":
    case "booking": {
      const action = items[0];
      const href = action?.url ? websiteLink(action.url) : bag.wa || (bag.phone ? `tel:${bag.phone}` : undefined);
      if (!body && !heading && !href) return null;
      return (
        <section key={section.id} className="w-full rounded-[var(--radius)] px-6 py-8 text-white md:px-10" style={{ background: "var(--p)" }}>
          <h2 className="text-2xl font-semibold">{heading || section.title || "Get in touch"}</h2>
          {body && <p className="mt-2 max-w-2xl text-white/85">{body}</p>}
          {href && (
            <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="mt-5 inline-flex h-10 items-center rounded-full bg-white px-5 text-sm font-semibold text-[#17181c]">
              {action?.title || "Continue"}
            </a>
          )}
        </section>
      );
    }
    default:
      return body || items.length ? (
        <Panel key={section.id} title={heading || section.title}>
          {body && <p className="whitespace-pre-line leading-7 text-[#3d4250]">{body}</p>}
          {items.length > 0 && (
            <div className="mt-4 space-y-3">
              {items.map((item, index) => <RecordCard key={`${item.title}-${index}`} item={item} />)}
            </div>
          )}
        </Panel>
      ) : null;
  }
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="w-full rounded-[var(--radius)] border border-black/5 bg-white p-5 shadow-[0_10px_30px_rgba(20,24,40,0.04)] md:p-7">
      {title && <h2 className="mb-4 text-xl font-semibold tracking-tight md:text-2xl">{title}</h2>}
      {children}
    </section>
  );
}

function Action({ href, icon, label, solid, external }: { href: string; icon: ReactNode; label: string; solid?: boolean; external?: boolean }) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className={`inline-flex h-10 max-w-full items-center gap-2 rounded-[var(--btn-radius)] px-4 text-sm font-medium ${solid ? "text-white" : "border border-black/10 bg-white"}`}
      style={solid ? { background: "var(--p)" } : undefined}
    >
      {icon}
      <span className="truncate">{label}</span>
    </a>
  );
}

function Info({ href, label, value, external }: { href: string; label: string; value: string; external?: boolean }) {
  return (
    <a href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} className="rounded-2xl bg-[#fbfbfd] p-4">
      <p className="text-xs uppercase tracking-wide text-[#5c6270]">{label}</p>
      <p className="mt-1 break-all font-medium">{value}</p>
    </a>
  );
}

function RecordCard({ item }: { item: ContentItem }) {
  const when = [item.startDate, item.endDate].filter(Boolean).join(" – ");
  const href = item.url ? websiteLink(item.url) : undefined;
  return (
    <article className="rounded-2xl bg-[#fbfbfd] p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        {href ? (
          <a href={href} target="_blank" rel="noreferrer" className="font-semibold underline-offset-2 hover:underline">{item.title}</a>
        ) : (
          <h3 className="font-semibold">{item.title}</h3>
        )}
        {when && <span className="text-xs text-[#5c6270]">{when}</span>}
      </div>
      {item.company && <p className="mt-1 text-sm font-medium" style={{ color: "var(--p)" }}>{item.company}</p>}
      {item.location && <p className="text-sm text-[#5c6270]">{item.location}</p>}
      {item.text && <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#3d4250]">{item.text}</p>}
      {techList(item.technologies).length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {techList(item.technologies).map((tech) => <span key={tech} className="rounded-full bg-white px-2.5 py-1 text-xs">{tech}</span>)}
        </div>
      )}
    </article>
  );
}

function WorkCard({ item }: { item: ContentItem }) {
  const href = item.url ? websiteLink(item.url) : item.github ? websiteLink(item.github) : undefined;
  const inner = (
    <>
      {item.image && <img src={mediaSrc(item.image, 900)} alt="" className="h-44 w-full object-cover" />}
      <div className="p-4">
        <h3 className="font-semibold">{item.title}</h3>
        {item.text && <p className="mt-1 text-sm leading-6 text-[#5c6270]">{item.text}</p>}
      </div>
    </>
  );
  const className = "overflow-hidden rounded-2xl border border-black/5 bg-[#fbfbfd]";
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className={className}>{inner}</a>
  ) : (
    <article className={className}>{inner}</article>
  );
}

function fallbackSections(profile: PublicProfile): ProfileSectionItem[] {
  const types = ["about", "services", "menu", "rooms", "gallery", "experience", "skills", "portfolio", "hours", "amenities", "social", "location", "contact"] as const;
  return types.map((type, index) => ({
    id: type,
    type,
    title: type,
    visible: true,
    sortOrder: index,
    content: {},
  })).filter(() => profile.name);
}
