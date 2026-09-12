import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { TEMPLATE_REGISTRY } from "@shared/profileTypes";
import { api } from "@/lib/api";
import { friendlyError } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MenuItemRow } from "@/components/admin/MenuItemRow";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConnectionCard } from "@/components/admin/ConnectionCard";
import { CardDesigner } from "@/components/admin/CardDesigner";
import { useAdmin } from "@/hooks/useAdmin";
import { defaultCardDesignForType } from "@shared/cardDesign";
import type { Admin, AdminProfile, AnalyticsSummary, AuditItem, HotelRoomItem, MediaItem } from "@/types";

export function CardsPage() {
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  useEffect(() => {
    void api.get<{ profiles: AdminProfile[] }>("/api/admin/profiles?limit=50").then((d) => setProfiles(d.profiles));
  }, []);
  return (
    <ConnectionGrid title="QR codes" hint="Every profile shares one stable URL. Download the QR or copy the link for the card." profiles={profiles} />
  );
}

export function MenusHubPage() {
  const [categories, setCategories] = useState<{
    id: string;
    name: string;
    profileId: string;
    profileName: string;
    items: { id: string; name: string; description: string; price: number; currency: string; imageUrl: string | null; available: boolean; featured: boolean }[];
  }[]>([]);
  useEffect(() => {
    void api.get<{ categories: typeof categories }>("/api/admin/menus").then((d) => setCategories(d.categories));
  }, []);
  const groups = categories.reduce<Record<string, { name: string; id: string; cats: typeof categories }>>((acc, category) => {
    const key = category.profileId || category.profileName;
    acc[key] ??= { name: category.profileName || "Profile", id: category.profileId, cats: [] };
    acc[key].cats.push(category);
    return acc;
  }, {});
  return (
    <Page title="Menus" hint="Every restaurant and cafeteria menu — compact rows with photo and price.">
      {Object.values(groups).map((group) => (
        <div key={group.id || group.name} className="rounded-xl border bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">{group.name}</h2>
            {group.id && (
              <Button size="sm" variant="outline" asChild>
                <Link to={`/admin/profiles/${group.id}?tab=website`}>Open</Link>
              </Button>
            )}
          </div>
          {group.cats.map((category) => (
            <div key={category.id} className="mb-3 last:mb-0">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{category.name}</p>
              <div className="divide-y divide-black/5">
                {category.items.map((item) => (
                  <MenuItemRow key={item.id} item={item} />
                ))}
                {category.items.length === 0 && <p className="py-2 text-xs text-muted-foreground">No items</p>}
              </div>
            </div>
          ))}
        </div>
      ))}
      {categories.length === 0 && <p className="text-sm text-muted-foreground">No menus yet.</p>}
    </Page>
  );
}

export function RoomsHubPage() {
  const [rooms, setRooms] = useState<(HotelRoomItem & { profileId?: string; profileName?: string })[]>([]);
  useEffect(() => {
    void api.get<{ rooms: typeof rooms }>("/api/admin/rooms").then((d) => setRooms(d.rooms));
  }, []);
  return (
    <Page title="Rooms" hint="Hotel rooms across every property. Open a profile to edit photos, beds, and prices.">
      {rooms.map((room) => (
        <div key={room.id} className="flex items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3">
          <div>
            <p className="text-sm font-medium">{room.name}</p>
            <p className="text-xs text-muted-foreground">{room.profileName}</p>
          </div>
          {room.profileId && (
            <Button size="sm" variant="outline" asChild>
              <Link to={`/admin/profiles/${room.profileId}?tab=website`}>Open</Link>
            </Button>
          )}
        </div>
      ))}
      {rooms.length === 0 && <p className="text-sm text-muted-foreground">No rooms yet.</p>}
    </Page>
  );
}

export function CardDesignsPage() {
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [activeId, setActiveId] = useState("");
  useEffect(() => {
    void api.get<{ profiles: AdminProfile[] }>("/api/admin/profiles?limit=50").then((d) => {
      setProfiles(d.profiles);
      setActiveId(d.profiles[0]?.id ?? "");
    });
  }, []);
  const active = profiles.find((profile) => profile.id === activeId);
  return (
    <Page title="Card designs" hint="Visual front/back preview for printed NFC cards. The chip still stores only the public URL.">
      {profiles.length > 0 && (
        <select className="h-10 rounded-md border px-3 text-sm" value={activeId} onChange={(e) => setActiveId(e.target.value)}>
          {profiles.map((profile) => (
            <option key={profile.id} value={profile.id}>{profile.name || profile.publicId}</option>
          ))}
        </select>
      )}
      {active && (
        <CardDesigner
          profile={active}
          value={active.cardDesign ?? defaultCardDesignForType(active.type)}
          onChange={(cardDesign) => setProfiles((current) => current.map((profile) => profile.id === active.id ? { ...profile, cardDesign } : profile))}
          onSave={async () => {
            const cardDesign = (profiles.find((profile) => profile.id === active.id)?.cardDesign) ?? defaultCardDesignForType(active.type);
            await api.patch(`/api/admin/profiles/${active.id}`, { cardDesign });
            toast.success("Card design saved");
          }}
        />
      )}
      {profiles.length === 0 && <p className="text-sm text-muted-foreground">Create a profile to design its NFC card.</p>}
    </Page>
  );
}

export function ServicesHubPage() {
  const [services, setServices] = useState<{ id: string; name: string; profileName: string }[]>([]);
  useEffect(() => {
    void api.get<{ services: { id: string; name: string; profileName: string }[] }>("/api/admin/services").then((d) => setServices(d.services));
  }, []);
  return (
    <Page title="Services" hint="Hotel services across the platform.">
      {services.map((s) => (
        <div key={s.id} className="flex justify-between rounded-xl border bg-white px-4 py-3">
          <span>{s.name}</span>
          <span className="text-sm text-muted-foreground">{s.profileName}</span>
        </div>
      ))}
    </Page>
  );
}

export function MediaLibraryPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [kind, setKind] = useState("");
  async function load() {
    const q = kind ? `?kind=${kind}` : "";
    const data = await api.get<{ media: MediaItem[] }>(`/api/admin/media${q}`);
    setMedia(data.media);
  }
  useEffect(() => { void load(); }, [kind]);
  return (
    <div className="space-y-4">
      <h1 className="font-serif text-3xl">Media</h1>
      <div className="flex gap-2">
        {[
          ["", "All"],
          ["profile", "Profile"],
          ["menu", "Menu"],
          ["service", "Hotel"],
          ["room", "Rooms"],
          ["gallery", "Gallery"],
        ].map(([k, label]) => (
          <Button key={k || "all"} size="sm" variant={kind === k ? "default" : "outline"} onClick={() => setKind(k)}>
            {label}
          </Button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {media.map((item) => (
          <div key={item.id} className="overflow-hidden rounded-xl border bg-white">
            <img src={item.url} alt="" className="h-28 w-full object-cover" />
            <div className="p-2">
              <p className="truncate text-[11px] text-muted-foreground">{item.profileName || item.kind}</p>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</span>
                <button className="text-[11px] text-red-600" onClick={async () => { await api.delete(`/api/admin/media/${item.id}`); await load(); }}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ThemesPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-serif text-3xl">Themes</h1>
      <p className="text-sm text-muted-foreground">
        Colors, fonts, and button styles live on each profile. Open a profile workspace and use the Design tab to customize them with live preview.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Primary / secondary / accent", "Brand colors applied across the public site."],
          ["Typography", "Inter, Playfair, DM Sans, Outfit, Lora, Poppins."],
          ["Controls", "Button style, radius, and hero cover treatment."],
        ].map(([title, hint]) => (
          <Card key={title}>
            <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">{hint}</p></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function TemplatesPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-serif text-3xl">Templates</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {Object.values(TEMPLATE_REGISTRY).map((t) => (
          <Card key={t.id}>
            <CardHeader><CardTitle>{t.name}</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{t.description}</p>
              <p className="mt-2 text-xs">{t.compatibleTypes.join(" · ")}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function NfcHubPage() {
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  useEffect(() => {
    void api.get<{ profiles: AdminProfile[] }>("/api/admin/profiles?limit=50").then((d) => setProfiles(d.profiles));
  }, []);
  return (
    <ConnectionGrid title="NFC cards" hint="NFC and QR store only this public URL. Profile content always stays on the website." profiles={profiles} />
  );
}

function ConnectionGrid({ title, hint, profiles }: { title: string; hint: string; profiles: AdminProfile[] }) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {profiles.map((profile) => (
          <ConnectionCard key={profile.id} profile={profile} />
        ))}
      </div>
      {profiles.length === 0 && (
        <div className="rounded-2xl border border-dashed bg-white py-16 text-center text-sm text-muted-foreground">
          No profiles yet. Create one to generate an NFC / QR URL.
        </div>
      )}
    </div>
  );
}

export function AnalyticsHubPage() {
  const [stats, setStats] = useState<(AnalyticsSummary & { activeProfiles?: number }) | null>(null);
  useEffect(() => { void api.get<AnalyticsSummary & { activeProfiles?: number }>("/api/admin/analytics").then(setStats); }, []);
  return (
    <div className="space-y-4">
      <h1 className="font-serif text-3xl">Analytics</h1>
      <div className="grid gap-4 md:grid-cols-5">
        <Stat label="Total views" value={stats?.totalViews ?? 0} />
        <Stat label="Today" value={stats?.viewsToday ?? 0} />
        <Stat label="This week" value={stats?.viewsThisWeek ?? 0} />
        <Stat label="This month" value={stats?.viewsThisMonth ?? 0} />
        <Stat label="Active profiles" value={stats?.activeProfiles ?? 0} />
      </div>
    </div>
  );
}

export function SettingsPage() {
  const { admin, setAdmin, can } = useAdmin();
  const [name, setName] = useState(admin?.name ?? "");
  const [email, setEmail] = useState(admin?.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div>
        <h1 className="font-serif text-3xl">Profile</h1>
        <p className="text-sm text-muted-foreground">{admin?.role?.name ?? "Admin"}</p>
        {can("settings.view") && (
          <Button className="mt-3 rounded-full" variant="outline" asChild>
            <Link to="/admin/settings/branding">Open branding</Link>
          </Button>
        )}
      </div>
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="space-y-2"><Label>Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          {can("settings.edit") && (
          <Button onClick={async () => {
            try {
              const data = await api.patch<{ admin: Admin }>("/api/admin/account", { name, email });
              setAdmin(data.admin);
              toast.success("Saved");
            } catch (err) { toast.error(friendlyError(err)); }
          }}>Save</Button>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-4 p-6">
          <p className="font-medium">Change password</p>
          <div className="space-y-2"><Label>Current password</Label><Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} /></div>
          <div className="space-y-2"><Label>New password</Label><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></div>
          <Button variant="outline" onClick={async () => {
            try {
              await api.post("/api/admin/account/password", { currentPassword, newPassword });
              setCurrentPassword("");
              setNewPassword("");
              toast.success("Password updated");
            } catch (err) { toast.error(friendlyError(err)); }
          }}>Update password</Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function AuditPage() {
  const [logs, setLogs] = useState<AuditItem[]>([]);
  useEffect(() => {
    void api.get<{ logs: AuditItem[] }>("/api/admin/audit-logs").then((d) => setLogs(d.logs));
  }, []);
  return (
    <div className="space-y-4">
      <h1 className="font-serif text-3xl">Audit logs</h1>
      <div className="overflow-hidden rounded-2xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[#f7f4ee] text-left text-xs uppercase text-muted-foreground">
            <tr><th className="px-4 py-3">Admin</th><th>Action</th><th>Target</th><th>Date</th></tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t">
                <td className="px-4 py-3">{log.adminName}</td>
                <td>{log.action}</td>
                <td>{log.targetName}</td>
                <td>{new Date(log.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Page({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-3xl">{title}</h1>
        <p className="text-sm text-muted-foreground">{hint}</p>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs uppercase text-muted-foreground">{label}</p>
        <p className="mt-2 font-serif text-3xl">{value}</p>
      </CardContent>
    </Card>
  );
}
