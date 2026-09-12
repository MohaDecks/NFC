import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "sonner";
import { FONTS, PRESET_COLORS, resolveProfileType, TEMPLATE_REGISTRY, templatesForType } from "@shared/profileTypes";
import { defaultCardDesignForType } from "@shared/cardDesign";
import { LocationSelect } from "@/components/admin/LocationSelect";
import { api } from "@/lib/api";
import { friendlyError, profileUrl } from "@/lib/utils";
import { Monitor, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PublishBadge, StatusBadge, VerifiedBadge } from "@/components/admin/StatusBadges";
import { ProfileBuilder } from "@/components/admin/ProfileBuilder";
import { ImageUpload } from "@/components/profile/ImageUpload";
import { OpeningHoursEditor, SocialLinksEditor, TagInput } from "@/components/profile/FieldEditors";
import { ProfileRenderer } from "@/components/templates/registry";
import { useAdmin } from "@/hooks/useAdmin";
import { CardDesigner } from "@/components/admin/CardDesigner";
import { ownerToPublic, type AdminProfile, type AnalyticsSummary, type AuditItem, type Design } from "@/types";

type ConfirmKind = "deactivate" | "block" | "delete" | null;

export function ProfileDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { can } = useAdmin();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [confirm, setConfirm] = useState<ConfirmKind>(null);
  const tab = params.get("tab") ?? "overview";

  async function load() {
    if (!id) return;
    const data = await api.get<{ profile: AdminProfile }>(`/api/admin/profiles/${id}`);
    setProfile(data.profile);
  }

  useEffect(() => {
    void load().catch((err) => toast.error(friendlyError(err)));
  }, [id]);

  if (!profile) return <p className="text-sm text-muted-foreground">Loading profile…</p>;
  const image = profile.avatarUrl || profile.logoUrl;

  async function act(path: string, msg: string) {
    const data = await api.post<{ profile: AdminProfile }>(path);
    setProfile(data.profile);
    toast.success(msg);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          {image ? (
            <img src={image} alt="" className="h-16 w-16 rounded-2xl object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1b6b5a]/10 text-xl">{profile.name[0]}</div>
          )}
          <div>
            <h1 className="font-serif text-3xl">{profile.name}</h1>
            <p className="text-sm text-muted-foreground">
              {resolveProfileType(profile.type).label} · {profile.owner.name || "No owner name"}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <StatusBadge status={profile.status} />
              <PublishBadge state={profile.publishState} />
              <VerifiedBadge verified={profile.isVerified} />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link to={`/p/${profile.publicId}`} target="_blank">
              Preview
            </Link>
          </Button>
          {can("profiles.edit") && (
            <Button variant="outline" onClick={() => setParams({ tab: "overview" })}>
              Edit
            </Button>
          )}
          {can("profiles.publish") && (
            <Button
              onClick={() =>
                void act(
                  `/api/admin/profiles/${profile.id}/${profile.publishState === "PUBLISHED" ? "unpublish" : "publish"}`,
                  profile.publishState === "PUBLISHED" ? "Unpublished" : "Published",
                )
              }
            >
              {profile.publishState === "PUBLISHED" ? "Unpublish" : "Publish"}
            </Button>
          )}
          {can("profiles.verify") && (
          <Button
            variant="outline"
            onClick={() =>
              void act(
                `/api/admin/profiles/${profile.id}/${profile.isVerified ? "unverify" : "verify"}`,
                profile.isVerified ? "Unverified" : "Verified",
              )
            }
          >
            {profile.isVerified ? "Unverify" : "Verify"}
          </Button>
          )}
          {can("profiles.publish") && (profile.status === "ACTIVE" ? (
            <Button variant="outline" onClick={() => setConfirm("deactivate")}>
              Deactivate
            </Button>
          ) : (
            <Button variant="outline" onClick={() => void act(`/api/admin/profiles/${profile.id}/activate`, "Activated")}>
              Activate
            </Button>
          ))}
          {can("profiles.publish") && (profile.status === "BLOCKED" ? (
            <Button variant="outline" onClick={() => void act(`/api/admin/profiles/${profile.id}/unblock`, "Unblocked")}>
              Unblock
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setConfirm("block")}>
              Block
            </Button>
          ))}
          {can("profiles.delete") && (
          <Button variant="outline" className="text-red-600" onClick={() => setConfirm("delete")}>
            Delete
          </Button>
          )}
        </div>
      </div>

      <Tabs value={tab} onValueChange={(value) => setParams({ tab: value })}>
        <TabsList className="flex h-auto flex-wrap gap-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="website">Website</TabsTrigger>
          <TabsTrigger value="design">Design</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="nfc">NFC / QR</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <OverviewTab profile={profile} onChange={setProfile} />
        </TabsContent>
        <TabsContent value="content">
          <ContentTab profile={profile} onChange={setProfile} />
        </TabsContent>
        <TabsContent value="website">
          <ProfileBuilder profile={profile} onChange={setProfile} />
        </TabsContent>
        <TabsContent value="media">
          <MediaTab profile={profile} onChange={setProfile} />
        </TabsContent>
        <TabsContent value="design">
          <DesignTab profile={profile} onChange={setProfile} />
        </TabsContent>
        <TabsContent value="social">
          <SocialTab profile={profile} onChange={setProfile} />
        </TabsContent>
        <TabsContent value="nfc">
          <NfcTab profile={profile} onChange={setProfile} />
        </TabsContent>
        <TabsContent value="analytics">
          <AnalyticsTab profileId={profile.id} />
        </TabsContent>
        <TabsContent value="activity">
          <ActivityTab profileId={profile.id} />
        </TabsContent>
      </Tabs>

      <AlertDialog open={Boolean(confirm)} onOpenChange={() => setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm === "delete" && "Delete Profile"}
              {confirm === "deactivate" && "Deactivate this profile?"}
              {confirm === "block" && "Block this profile?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm === "delete" &&
                "This permanently removes the profile, menu, services, and public URL. The NFC card will stop working."}
              {confirm === "deactivate" && "The public page will show “Profile unavailable.” until you activate it again."}
              {confirm === "block" && "The public profile will become unavailable. You can unblock it later."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (confirm === "delete") {
                  await api.delete(`/api/admin/profiles/${profile.id}`);
                  toast.success("Profile deleted");
                  navigate("/admin/profiles");
                  return;
                }
                if (confirm === "deactivate") await act(`/api/admin/profiles/${profile.id}/deactivate`, "Deactivated");
                if (confirm === "block") await act(`/api/admin/profiles/${profile.id}/block`, "Blocked");
                setConfirm(null);
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function OverviewTab({ profile, onChange }: { profile: AdminProfile; onChange: (p: AdminProfile) => void }) {
  const [form, setForm] = useState(profile);
  useEffect(() => setForm(profile), [profile]);
  return (
    <div className="space-y-4 rounded-2xl border bg-white p-6">
      <Field label="Name" value={form.name} onChange={(name) => setForm({ ...form, name })} />
      <Field label="Owner" value={form.owner.name} onChange={(name) => setForm({ ...form, owner: { ...form.owner, name } })} />
      <Field label="Owner email" value={form.owner.email} onChange={(email) => setForm({ ...form, owner: { ...form.owner, email } })} />
      <Field label="Owner phone" value={form.owner.phone} onChange={(phone) => setForm({ ...form, owner: { ...form.owner, phone } })} />
      <Field label="Job title / tagline" value={form.tagline} onChange={(tagline) => setForm({ ...form, tagline })} />
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>
      <p className="text-xs text-muted-foreground">Public ID stays the same: /p/{profile.publicId}</p>
      <Button
        onClick={async () => {
          const data = await api.patch<{ profile: AdminProfile }>(`/api/admin/profiles/${profile.id}`, {
            name: form.name,
            tagline: form.tagline,
            description: form.description,
            ownerName: form.owner.name,
            ownerEmail: form.owner.email,
            ownerPhone: form.owner.phone,
          });
          onChange(data.profile);
          toast.success("Saved");
        }}
      >
        Save
      </Button>
    </div>
  );
}

function ContentTab({ profile, onChange }: { profile: AdminProfile; onChange: (p: AdminProfile) => void }) {
  const features = resolveProfileType(profile.type).features;
  const [form, setForm] = useState(profile);
  useEffect(() => setForm(profile), [profile]);
  return (
    <div className="space-y-6">
      <div className="grid gap-4 rounded-2xl border bg-white p-6 sm:grid-cols-2">
        <Field label="Phone" value={form.contact.phone} onChange={(phone) => setForm({ ...form, contact: { ...form.contact, phone } })} />
        <Field label="WhatsApp" value={form.contact.whatsapp} onChange={(whatsapp) => setForm({ ...form, contact: { ...form.contact, whatsapp } })} />
        <Field label="Email" value={form.contact.email} onChange={(email) => setForm({ ...form, contact: { ...form.contact, email } })} />
        <Field label="Website" value={form.contact.website} onChange={(website) => setForm({ ...form, contact: { ...form.contact, website } })} />
        <div className="sm:col-span-2">
          <LocationSelect
            countryId={form.location.countryId}
            cityId={form.location.cityId}
            onChange={(next) => setForm({ ...form, location: { ...form.location, ...next } })}
          />
        </div>
        <Field label="Address" value={form.location.address} onChange={(address) => setForm({ ...form, location: { ...form.location, address } })} />
        <Field label="Maps URL" value={form.location.mapsUrl} onChange={(mapsUrl) => setForm({ ...form, location: { ...form.location, mapsUrl } })} />
        <Field
          label="Latitude"
          value={form.location.latitude == null ? "" : String(form.location.latitude)}
          onChange={(value) => setForm({ ...form, location: { ...form.location, latitude: value === "" ? null : Number(value) } })}
        />
        <Field
          label="Longitude"
          value={form.location.longitude == null ? "" : String(form.location.longitude)}
          onChange={(value) => setForm({ ...form, location: { ...form.location, longitude: value === "" ? null : Number(value) } })}
        />
      </div>
      {features.openingHours && (
        <div className="rounded-2xl border bg-white p-6">
          <OpeningHoursEditor value={form.openingHours} onChange={(openingHours) => setForm({ ...form, openingHours })} />
        </div>
      )}
      {features.amenities && (
        <div className="rounded-2xl border bg-white p-6">
          <TagInput value={form.amenities} onChange={(amenities) => setForm({ ...form, amenities })} placeholder="WiFi, Parking..." />
        </div>
      )}
      {features.socialLinks && (
        <div className="rounded-2xl border bg-white p-6">
          <SocialLinksEditor value={form.socialLinks} onChange={(socialLinks) => setForm({ ...form, socialLinks })} />
        </div>
      )}
      <Button
        onClick={async () => {
          const data = await api.patch<{ profile: AdminProfile }>(`/api/admin/profiles/${profile.id}`, {
            contact: form.contact,
            location: {
              ...form.location,
              latitude: Number.isFinite(form.location.latitude as number) ? form.location.latitude : null,
              longitude: Number.isFinite(form.location.longitude as number) ? form.location.longitude : null,
            },
            openingHours: form.openingHours,
            amenities: form.amenities,
            socialLinks: form.socialLinks,
          });
          onChange(data.profile);
          toast.success("Content saved");
        }}
      >
        Save content
      </Button>
    </div>
  );
}

async function attachImage(
  profileId: string,
  field: "avatar" | "logo" | "cover" | "gallery",
  media: { id: string } | null,
  gallery: string[],
) {
  const body =
    field === "gallery"
      ? { gallery: media ? [...gallery, media.id] : gallery }
      : { [field]: media?.id ?? null };
  const data = await api.patch<{ profile: AdminProfile }>(`/api/admin/profiles/${profileId}`, body);
  return data.profile;
}

function MediaTab({ profile, onChange }: { profile: AdminProfile; onChange: (p: AdminProfile) => void }) {
  const features = resolveProfileType(profile.type).features;

  async function saveField(field: "avatar" | "logo" | "cover" | "gallery", media: { id: string } | null) {
    try {
      onChange(await attachImage(profile.id, field, media, profile.gallery));
    } catch (err) {
      toast.error(friendlyError(err, "Could not save this image"));
    }
  }

  return (
    <div className="grid gap-6 overflow-hidden rounded-2xl border bg-white p-6 sm:grid-cols-2">
      {features.avatar && (
        <ImageUpload
          label="Profile image"
          kind="avatar"
          aspect="circle"
          profileId={profile.id}
          previewUrl={profile.avatarUrl}
          onProfile={onChange}
          onChange={(media) => void saveField("avatar", media)}
        />
      )}
      {features.logo && (
        <ImageUpload
          label="Logo"
          kind="logo"
          aspect="square"
          profileId={profile.id}
          previewUrl={profile.logoUrl}
          onProfile={onChange}
          onChange={(media) => void saveField("logo", media)}
        />
      )}
      <div className="sm:col-span-2">
        <ImageUpload
          label="Cover"
          kind="cover"
          profileId={profile.id}
          previewUrl={profile.coverUrl}
          onProfile={onChange}
          onChange={(media) => void saveField("cover", media)}
        />
      </div>
      <div className="sm:col-span-2">
        <ImageUpload
          label="Add gallery image"
          kind="gallery"
          profileId={profile.id}
          onProfile={onChange}
          onChange={(media) => {
            if (!media) return;
            void saveField("gallery", media);
          }}
        />
        <div className="mt-4 grid grid-cols-3 gap-3">
          {profile.galleryUrls.map((url, index) => (
            <div key={`${url}-${index}`} className="relative overflow-hidden rounded-xl">
              <img src={url} alt="" className="h-28 w-full object-cover" />
              <button
                type="button"
                className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] text-white"
                onClick={async () => {
                  try {
                    const next = profile.gallery.filter((_, i) => i !== index);
                    const data = await api.patch<{ profile: AdminProfile }>(`/api/admin/profiles/${profile.id}`, { gallery: next });
                    onChange(data.profile);
                  } catch (err) {
                    toast.error(friendlyError(err, "Could not remove image"));
                  }
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DesignTab({ profile, onChange }: { profile: AdminProfile; onChange: (p: AdminProfile) => void }) {
  const [design, setDesign] = useState(profile.design);
  const [device, setDevice] = useState<"mobile" | "desktop">("desktop");
  const preview = useMemo(() => ownerToPublic({ ...profile, design }), [profile, design]);
  async function save(next: Design) {
    setDesign(next);
    const data = await api.patch<{ profile: AdminProfile }>(`/api/admin/profiles/${profile.id}/design`, next);
    onChange(data.profile);
  }
  return (
    <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
      <div className="space-y-4 rounded-2xl border bg-white p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Template</p>
        {templatesForType(profile.type).map((id) => (
          <button
            key={id}
            type="button"
            className={`w-full rounded-xl border p-3 text-left ${design.template === id ? "border-primary" : ""}`}
            onClick={() => void save({ ...design, template: id })}
          >
            <span className="font-medium">{TEMPLATE_REGISTRY[id].name}</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">{TEMPLATE_REGISTRY[id].description}</span>
          </button>
        ))}
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Primary</p>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              className="h-8 w-8 rounded-full border"
              style={{ background: c.value }}
              onClick={() => void save({ ...design, primaryColor: c.value })}
            />
          ))}
        </div>
        <Label>Custom primary</Label>
        <Input type="color" value={design.primaryColor} onChange={(e) => void save({ ...design, primaryColor: e.target.value })} />
        <Label>Secondary</Label>
        <Input type="color" value={design.secondaryColor} onChange={(e) => void save({ ...design, secondaryColor: e.target.value })} />
        <Label>Accent</Label>
        <Input type="color" value={design.accentColor || "#C9A227"} onChange={(e) => void save({ ...design, accentColor: e.target.value })} />
        <select
          className="h-10 w-full rounded-md border px-3 text-sm"
          value={design.font}
          onChange={(e) => void save({ ...design, font: e.target.value as Design["font"] })}
        >
          {FONTS.map((f) => (
            <option key={f}>{f}</option>
          ))}
        </select>
        <select className="h-10 w-full rounded-md border px-3 text-sm" value={design.buttonStyle} onChange={(e) => void save({ ...design, buttonStyle: e.target.value as Design["buttonStyle"] })}>
          <option value="rounded">Rounded buttons</option>
          <option value="pill">Pill buttons</option>
          <option value="square">Square buttons</option>
        </select>
        <select className="h-10 w-full rounded-md border px-3 text-sm" value={design.borderRadius} onChange={(e) => void save({ ...design, borderRadius: e.target.value as Design["borderRadius"] })}>
          <option value="none">No radius</option>
          <option value="sm">Small radius</option>
          <option value="md">Medium radius</option>
          <option value="lg">Large radius</option>
          <option value="full">Full radius</option>
        </select>
        <select className="h-10 w-full rounded-md border px-3 text-sm" value={design.coverStyle} onChange={(e) => void save({ ...design, coverStyle: e.target.value as Design["coverStyle"] })}>
          <option value="full">Full hero</option>
          <option value="banner">Banner hero</option>
          <option value="minimal">Minimal hero</option>
        </select>
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
        <div className={`overflow-hidden border bg-white shadow-xl ${device === "mobile" ? "mx-auto w-[360px] rounded-[2rem]" : "rounded-2xl"}`}>
          <div className="h-[720px] overflow-y-auto">
            <ProfileRenderer profile={preview} />
          </div>
        </div>
      </div>
    </div>
  );
}

function NfcTab({ profile, onChange }: { profile: AdminProfile; onChange: (p: AdminProfile) => void }) {
  const url = profileUrl(profile.publicId);
  const [cardDesign, setCardDesign] = useState(profile.cardDesign ?? defaultCardDesignForType(profile.type));
  useEffect(() => {
    setCardDesign(profile.cardDesign ?? defaultCardDesignForType(profile.type));
  }, [profile]);
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6">
          <p className="text-xs uppercase text-muted-foreground">NFC URL</p>
          <p className="mt-2 break-all font-mono text-sm">{url}</p>
          <p className="mt-3 text-sm text-muted-foreground">The card stores only this URL. Profile content always stays on the website.</p>
          <Button
            className="mt-4"
            onClick={() => {
              void navigator.clipboard.writeText(url);
              toast.success("Copied");
            }}
          >
            Copy URL
          </Button>
        </div>
        <div className="rounded-2xl border bg-white p-6 text-center">
          <QRCodeCanvas id={`qr-${profile.publicId}`} value={url} size={200} includeMargin />
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => {
              const canvas = document.getElementById(`qr-${profile.publicId}`) as HTMLCanvasElement | null;
              if (!canvas) return;
              const a = document.createElement("a");
              a.href = canvas.toDataURL("image/png");
              a.download = `${profile.publicId}-qr.png`;
              a.click();
            }}
          >
            Download QR
          </Button>
        </div>
      </div>
      <div className="rounded-2xl border bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold">Card design</h2>
        <CardDesigner
          profile={profile}
          value={cardDesign}
          onChange={setCardDesign}
          onSave={async () => {
            const data = await api.patch<{ profile: AdminProfile }>(`/api/admin/profiles/${profile.id}`, { cardDesign });
            onChange(data.profile);
            toast.success("Card design saved");
          }}
        />
      </div>
    </div>
  );
}

function AnalyticsTab({ profileId }: { profileId: string }) {
  const [stats, setStats] = useState<AnalyticsSummary | null>(null);
  useEffect(() => {
    void api.get<AnalyticsSummary>(`/api/admin/profiles/${profileId}/analytics`).then(setStats);
  }, [profileId]);
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {(
        [
          ["Total", stats?.totalViews],
          ["Today", stats?.viewsToday],
          ["Week", stats?.viewsThisWeek],
          ["Month", stats?.viewsThisMonth],
        ] as const
      ).map(([label, value]) => (
        <div key={label} className="rounded-2xl border bg-white p-5">
          <p className="text-xs uppercase text-muted-foreground">{label}</p>
          <p className="mt-2 font-serif text-3xl">{value ?? 0}</p>
        </div>
      ))}
    </div>
  );
}

function ActivityTab({ profileId }: { profileId: string }) {
  const [logs, setLogs] = useState<AuditItem[]>([]);
  useEffect(() => {
    void api.get<{ logs: AuditItem[] }>(`/api/admin/audit-logs?targetId=${profileId}`).then((d) => setLogs(d.logs));
  }, [profileId]);
  return (
    <div className="space-y-3 rounded-2xl border bg-white p-5">
      {logs.map((log) => (
        <div key={log.id} className="border-b border-black/5 pb-3 last:border-0">
          <p className="text-sm">
            <span className="font-medium">{log.adminName}</span> {log.action.replaceAll("_", " ").toLowerCase()} {log.targetName}
          </p>
          <p className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</p>
        </div>
      ))}
      {logs.length === 0 && <p className="text-sm text-muted-foreground">No activity recorded yet.</p>}
    </div>
  );
}

function SocialTab({ profile, onChange }: { profile: AdminProfile; onChange: (p: AdminProfile) => void }) {
  return (
    <div className="rounded-2xl border bg-white p-6">
      <SocialLinksEditor
        value={profile.socialLinks}
        onChange={(socialLinks) =>
          void api
            .patch<{ profile: AdminProfile }>(`/api/admin/profiles/${profile.id}`, { socialLinks })
            .then((data) => {
              onChange(data.profile);
              toast.success("Social links saved");
            })
        }
      />
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
