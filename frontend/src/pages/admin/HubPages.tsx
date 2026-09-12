import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { FONTS, typeLabel } from "@shared/profileTypes";
import { SECTION_REGISTRY, SECTION_TYPES } from "@shared/sections";
import { api } from "@/lib/api";
import { profileUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PublishBadge, StatusBadge } from "@/components/admin/StatusBadges";
import type { AdminProfile } from "@/types";

type HubSection = {
  id: string;
  type: string;
  title: string;
  visible: boolean;
  profileId: string;
  profileName: string;
  publicId: string;
};

export function PagesHubPage() {
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  useEffect(() => {
    void api.get<{ profiles: AdminProfile[] }>("/api/admin/profiles?limit=50").then((d) => setProfiles(d.profiles));
  }, []);
  return (
    <Hub title="Pages" hint="Every published profile is a mini website. NFC and QR open the same URL.">
      <div className="overflow-hidden rounded-2xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[#f7f4ee] text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Page</th>
              <th>Type</th>
              <th>URL</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {profiles.map((profile) => (
              <tr key={profile.id} className="border-t">
                <td className="px-4 py-3 font-medium">{profile.name}</td>
                <td>{typeLabel(profile.type)}</td>
                <td className="font-mono text-xs">/p/{profile.publicId}</td>
                <td>
                  <div className="flex gap-1.5">
                    <StatusBadge status={profile.status} />
                    <PublishBadge state={profile.publishState} />
                  </div>
                </td>
                <td className="pr-3 text-right">
                  <Button size="sm" variant="outline" asChild>
                    <Link to={`/admin/profiles/${profile.id}?tab=website`}>Builder</Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Hub>
  );
}

export function SectionsHubPage() {
  const [sections, setSections] = useState<HubSection[]>([]);
  useEffect(() => {
    void api.get<{ sections: HubSection[] }>("/api/admin/sections").then((d) => setSections(d.sections));
  }, []);
  return (
    <Hub title="Sections" hint="Reusable website blocks. Add, hide, and reorder them inside a profile builder.">
      <div className="space-y-2">
        {sections.map((section) => (
          <Link
            key={section.id}
            to={`/admin/profiles/${section.profileId}?tab=website`}
            className="flex items-center justify-between rounded-xl border bg-white px-4 py-3 transition hover:-translate-y-0.5 hover:border-[#1b6b5a]/20 hover:shadow-sm"
          >
            <div>
              <p className="font-medium">{section.title}</p>
              <p className="text-xs text-muted-foreground">{section.profileName} · {section.type}</p>
            </div>
            <span className="text-xs text-muted-foreground">{section.visible ? "Visible" : "Hidden"}</span>
          </Link>
        ))}
        {sections.length === 0 && <p className="text-sm text-muted-foreground">No sections yet. Create a profile to seed its preset.</p>}
      </div>
    </Hub>
  );
}

export function ProductsHubPage() {
  const [sections, setSections] = useState<HubSection[]>([]);
  useEffect(() => {
    void api.get<{ sections: HubSection[] }>("/api/admin/sections").then((d) => setSections(d.sections.filter((item) => item.type === "products")));
  }, []);
  return (
    <Hub title="Products" hint="Product highlights live as a reusable section on any profile.">
      {sections.length === 0 ? (
        <p className="text-sm text-muted-foreground">No product sections yet. Open a profile builder and add a Products section.</p>
      ) : (
        sections.map((section) => (
          <Link key={section.id} to={`/admin/profiles/${section.profileId}?tab=website`} className="flex justify-between rounded-xl border bg-white px-4 py-3">
            <span>{section.profileName}</span>
            <span className="text-sm text-muted-foreground">{section.title}</span>
          </Link>
        ))
      )}
    </Hub>
  );
}

export function FontsPage() {
  return (
    <Hub title="Fonts" hint="Fonts are applied per profile in the Design tab. These are the typefaces available now.">
      <div className="grid gap-4 md:grid-cols-2">
        {FONTS.map((font) => (
          <Card key={font}>
            <CardHeader><CardTitle style={{ fontFamily: font }}>{font}</CardTitle></CardHeader>
            <CardContent>
              <p className="text-2xl" style={{ fontFamily: font }}>Create a digital presence.</p>
              <p className="mt-2 text-sm text-muted-foreground">Used by the public mini website when selected on a profile.</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </Hub>
  );
}

export function ComponentsPage() {
  return (
    <Hub title="Components" hint="These section types can be added to any profile. New business types reuse this catalog.">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {SECTION_TYPES.map((type) => (
          <Card key={type}>
            <CardHeader><CardTitle>{SECTION_REGISTRY[type].label}</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">{SECTION_REGISTRY[type].description}</p></CardContent>
          </Card>
        ))}
      </div>
    </Hub>
  );
}

export function SocialHubPage() {
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  useEffect(() => {
    void api.get<{ profiles: AdminProfile[] }>("/api/admin/profiles?limit=50").then((d) => setProfiles(d.profiles));
  }, []);
  const rows = profiles.flatMap((profile) =>
    profile.socialLinks.filter((link) => link.url).map((link) => ({ profile, link })),
  );
  return (
    <Hub title="Social media" hint="Empty links are never shown on the public website.">
      {rows.map(({ profile, link }, index) => (
        <Link key={`${profile.id}-${link.platform}-${index}`} to={`/admin/profiles/${profile.id}?tab=social`} className="flex items-center justify-between rounded-xl border bg-white px-4 py-3">
          <div>
            <p className="font-medium">{link.platform}{link.username ? ` · @${link.username}` : ""}</p>
            <p className="text-xs text-muted-foreground">{profile.name}</p>
          </div>
          <span className="max-w-[40%] truncate font-mono text-[11px] text-muted-foreground">{link.url}</span>
        </Link>
      ))}
      {rows.length === 0 && <p className="text-sm text-muted-foreground">No social links yet.</p>}
    </Hub>
  );
}

export function ContactHubPage() {
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  useEffect(() => {
    void api.get<{ profiles: AdminProfile[] }>("/api/admin/profiles?limit=50").then((d) => setProfiles(d.profiles));
  }, []);
  return (
    <Hub title="Contact links" hint="Call, WhatsApp, email, website, and location use mobile-friendly URI schemes.">
      {profiles.map((profile) => {
        const items = [
          profile.contact.phone && `tel:${profile.contact.phone}`,
          profile.contact.whatsapp && `WhatsApp`,
          profile.contact.email && `mailto:${profile.contact.email}`,
          profile.contact.website && "Website",
          profile.location.address && "Location",
        ].filter(Boolean);
        if (!items.length) return null;
        return (
          <Link key={profile.id} to={`/admin/profiles/${profile.id}?tab=content`} className="flex items-center justify-between rounded-xl border bg-white px-4 py-3">
            <div>
              <p className="font-medium">{profile.name}</p>
              <p className="text-xs text-muted-foreground">{items.join(" · ")}</p>
            </div>
            <span className="font-mono text-[11px] text-muted-foreground">{profileUrl(profile.publicId)}</span>
          </Link>
        );
      })}
    </Hub>
  );
}

function Hub({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
