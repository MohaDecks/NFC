import { useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { DEFAULT_DESIGN, defaultOpeningHours, isProfileType, resolveProfileType, templatesForType, type ProfileType } from "@shared/profileTypes";
import { LocationSelect } from "@/components/admin/LocationSelect";
import { TypePicker } from "@/components/profile/TypePicker";
import { TypePhonePreview } from "@/components/profile/TypePhonePreview";
import { ImageUpload } from "@/components/profile/ImageUpload";
import { OpeningHoursEditor, SocialLinksEditor } from "@/components/profile/FieldEditors";
import { ProfileRenderer } from "@/components/templates/registry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { friendlyError, profileUrl } from "@/lib/utils";
import { ownerToPublic, type AdminProfile, type Design } from "@/types";

const STEPS = [
  { id: 0, label: "Type", hint: "Choose type" },
  { id: 1, label: "Content", hint: "Add content" },
  { id: 2, label: "Design", hint: "Customize design" },
] as const;

export function CreateProfilePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [step, setStep] = useState(0);
  const [type, setType] = useState<ProfileType>(() => {
    const requested = params.get("type");
    return requested && isProfileType(requested) ? requested : "PERSONAL";
  });
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [countryId, setCountryId] = useState("");
  const [cityId, setCityId] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [busy, setBusy] = useState(false);
  const features = resolveProfileType(type).features;
  const config = resolveProfileType(type);

  async function persist(draftName = name.trim()) {
    const resolvedName = draftName || `New ${config.label}`;
    if (!name.trim()) setName(resolvedName);
    const payload = {
      name: resolvedName,
      tagline: tagline.trim(),
      description,
      ownerName: resolvedName,
      contact: { phone, email, whatsapp, website },
      location: { address, country, city, countryId: countryId || null, cityId: cityId || null },
    };
    if (!profile) {
      const created = await api.post<{ profile: AdminProfile }>("/api/admin/profiles", {
        type,
        name: payload.name,
        ownerName: payload.name,
      });
      const updated = await api.patch<{ profile: AdminProfile }>(`/api/admin/profiles/${created.profile.id}`, payload);
      setProfile(updated.profile);
      return updated.profile;
    }
    const updated = await api.patch<{ profile: AdminProfile }>(`/api/admin/profiles/${profile.id}`, payload);
    setProfile(updated.profile);
    return updated.profile;
  }

  async function goTo(nextStep: number) {
    try {
      if (nextStep <= step) {
        setStep(nextStep);
        return;
      }
      if (nextStep > 0 && !type) return toast.error("Choose a profile type");
      if (nextStep >= 1 && !profile) {
        setBusy(true);
        await persist();
      }
      if (nextStep >= 2) {
        if (!name.trim() && !profile?.name) return toast.error("Enter a name");
        setBusy(true);
        await persist(name.trim() || profile?.name);
      }
      setStep(nextStep);
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  async function next() {
    try {
      if (step === 2 && profile) {
        if (!name.trim()) return toast.error("Enter a name");
        setBusy(true);
        await persist();
        await api.post(`/api/admin/profiles/${profile.id}/publish`);
        toast.success("Profile published");
        navigate(`/admin/profiles/${profile.id}`);
        return;
      }
      await goTo(Math.min(2, step + 1));
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="-mx-4 flex min-h-[calc(100vh-72px)] flex-col bg-[#F7F8FC] lg:-mx-7">
      <div className="border-b border-[#EEEFF3] bg-white px-5 py-4 lg:px-8">
        <Link to="/admin" className="mb-3 inline-flex items-center gap-1.5 text-[13px] text-slate-400 hover:text-slate-700">
          <ArrowLeft className="h-3.5 w-3.5" /> Create profile
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          {STEPS.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => void goTo(item.id)}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] ${
                step === item.id ? "bg-[#1565C0] text-white" : step > item.id ? "bg-[#E3F2FD] text-[#1565C0]" : "bg-[#F3F4F6] text-slate-500"
              }`}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[11px] font-semibold">
                {step > item.id ? <Check className="h-3 w-3" /> : index + 1}
              </span>
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sm:hidden">{item.hint}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid flex-1 items-start gap-8 px-5 py-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:px-8">
        <div className="min-w-0 space-y-5">
          {step === 0 && (
            <section>
              <h1 className="text-[28px] font-semibold tracking-tight">Choose the profile type</h1>
              <p className="mt-1 text-sm text-slate-500">Hotel, restaurant, doctor, personal, engineer, cafeteria, business, or portfolio. Professional is not a place — register those as a business card.</p>
              <div className="mt-5">
                <TypePicker
                  value={type}
                  onChange={(next) => {
                    if (profile && profile.type !== next) {
                      toast.message("This draft already has a type. Cancel and start again to pick another.");
                      return;
                    }
                    setType(next);
                  }}
                />
              </div>
            </section>
          )}

          {step === 1 && (
            <section className="space-y-6">
              <div>
                <h1 className="text-[28px] font-semibold tracking-tight">Add content to this {config.shortLabel.toLowerCase()} profile</h1>
                <p className="mt-1 text-sm text-slate-500">Fill the information you want people to see when they tap the NFC card or scan the QR.</p>
              </div>
              <Card>
                <h2 className="mb-4 text-sm font-semibold">About you</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={features.jobTitle ? "Full name *" : "Profile name *"} value={name} onChange={setName} placeholder="Dr. Ahmed Hassan" />
                  {features.jobTitle && <Field label="Title / specialization" value={tagline} onChange={setTagline} placeholder="General practitioner" />}
                  {!features.jobTitle && <Field label="Tagline" value={tagline} onChange={setTagline} placeholder={config.description} />}
                  <div className="sm:col-span-2 space-y-2">
                    <Label>Summary</Label>
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A short introduction for the public page." />
                  </div>
                </div>
              </Card>
              <Card>
                <h2 className="mb-4 text-sm font-semibold">Contact details</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Phone number" value={phone} onChange={setPhone} />
                  <Field label="WhatsApp" value={whatsapp} onChange={setWhatsapp} />
                  <Field label="Email" value={email} onChange={setEmail} />
                  <Field label="Website" value={website} onChange={setWebsite} />
                </div>
              </Card>
              <Card>
                <h2 className="mb-4 text-sm font-semibold">Address</h2>
                <div className="space-y-4">
                  <LocationSelect
                    countryId={countryId}
                    cityId={cityId}
                    onChange={(next) => {
                      setCountryId(next.countryId);
                      setCityId(next.cityId);
                      setCountry(next.country);
                      setCity(next.city);
                    }}
                  />
                  <Field label="Street / address" value={address} onChange={setAddress} />
                </div>
              </Card>
              {profile && (
                <Card>
                  <h2 className="mb-4 text-sm font-semibold">Images</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {features.avatar && (
                      <ImageUpload label="Profile image" kind="avatar" aspect="circle" profileId={profile.id} previewUrl={profile.avatarUrl} onChange={(media) => void api.patch<{ profile: AdminProfile }>(`/api/admin/profiles/${profile.id}`, { avatar: media?.id ?? null }).then((data) => setProfile(data.profile))} />
                    )}
                    {features.logo && (
                      <ImageUpload label="Logo" kind="logo" aspect="square" profileId={profile.id} previewUrl={profile.logoUrl} onChange={(media) => void api.patch<{ profile: AdminProfile }>(`/api/admin/profiles/${profile.id}`, { logo: media?.id ?? null }).then((data) => setProfile(data.profile))} />
                    )}
                    <div className="sm:col-span-2">
                      <ImageUpload label="Cover / welcome image" kind="cover" profileId={profile.id} previewUrl={profile.coverUrl} onChange={(media) => void api.patch<{ profile: AdminProfile }>(`/api/admin/profiles/${profile.id}`, { cover: media?.id ?? null }).then((data) => setProfile(data.profile))} />
                    </div>
                  </div>
                </Card>
              )}
              {profile && features.socialLinks && (
                <Card>
                  <h2 className="mb-4 text-sm font-semibold">Social networks</h2>
                  <SocialLinksEditor value={profile.socialLinks} onChange={(socialLinks) => void api.patch<{ profile: AdminProfile }>(`/api/admin/profiles/${profile.id}`, { socialLinks }).then((data) => setProfile(data.profile))} />
                </Card>
              )}
              {profile && features.openingHours && (
                <Card>
                  <h2 className="mb-4 text-sm font-semibold">Opening hours</h2>
                  <OpeningHoursEditor value={profile.openingHours.length ? profile.openingHours : defaultOpeningHours()} onChange={(openingHours) => void api.patch<{ profile: AdminProfile }>(`/api/admin/profiles/${profile.id}`, { openingHours }).then((data) => setProfile(data.profile))} />
                </Card>
              )}
            </section>
          )}

          {step === 2 && profile && (
            <DesignStep
              profile={profile}
              onChange={async (design) => {
                const data = await api.patch<{ profile: AdminProfile }>(`/api/admin/profiles/${profile.id}/design`, design);
                setProfile(data.profile);
              }}
            />
          )}
        </div>

        <aside className="lg:sticky lg:top-24">
          <p className="mb-3 text-center text-[12px] text-slate-400">Live preview</p>
          {profile && step === 2 ? (
            <div className="mx-auto w-[260px] overflow-hidden rounded-[36px] border-[10px] border-[#111827] bg-white shadow-[0_28px_60px_rgba(15,23,42,0.28)]">
              <div className="h-[520px] overflow-y-auto">
                <ProfileRenderer profile={ownerToPublic(profile)} />
              </div>
            </div>
          ) : (
            <TypePhonePreview
              type={type}
              name={name}
              subtitle={tagline}
              imageUrl={profile?.avatarUrl || profile?.logoUrl || undefined}
              qrValue={profile ? profileUrl(profile.publicId) : undefined}
            />
          )}
          <p className="mt-3 text-center text-[11px] text-slate-400">{config.label}</p>
        </aside>
      </div>

      <div className="sticky bottom-0 flex items-center justify-between border-t border-[#EEEFF3] bg-white px-5 py-3.5 lg:px-8">
        <Button variant="outline" className="rounded-full" disabled={step === 0} onClick={() => setStep((value) => Math.max(0, value - 1))}>
          Back
        </Button>
        <Button className="rounded-full bg-[#1565C0] hover:bg-[#0D47A1]" disabled={busy} onClick={() => void next()}>
          {step === 2 ? "Publish profile" : "Next"} <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

function DesignStep({ profile, onChange }: { profile: AdminProfile; onChange: (d: Design) => Promise<void> }) {
  const templates = useMemo(() => templatesForType(profile.type), [profile.type]);
  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-[28px] font-semibold tracking-tight">Design and customize</h1>
        <p className="mt-1 text-sm text-slate-500">Choose colors and a layout. The phone preview updates immediately.</p>
      </div>
      <Card>
        <h2 className="mb-3 text-sm font-semibold">Color scheme</h2>
        <div className="flex flex-wrap gap-2">
          {["#1565C0", "#1D4ED8", "#6D28D9", "#0F766E", "#C2410C", "#0B1B3A", "#111111"].map((color) => (
            <button key={color} type="button" className="h-9 w-9 rounded-full border" style={{ background: color }} onClick={() => void onChange({ ...profile.design, primaryColor: color })} />
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="space-y-2"><Label>Primary</Label><Input type="color" value={profile.design.primaryColor} onChange={(e) => void onChange({ ...profile.design, primaryColor: e.target.value })} /></div>
          <div className="space-y-2"><Label>Secondary</Label><Input type="color" value={profile.design.secondaryColor} onChange={(e) => void onChange({ ...profile.design, secondaryColor: e.target.value })} /></div>
          <div className="space-y-2"><Label>Accent</Label><Input type="color" value={profile.design.accentColor || "#C9A227"} onChange={(e) => void onChange({ ...profile.design, accentColor: e.target.value })} /></div>
        </div>
      </Card>
      <Card>
        <h2 className="mb-3 text-sm font-semibold">Place layout</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {templates.map((id) => (
            <button
              key={id}
              type="button"
              className={`rounded-2xl border px-4 py-3 text-left capitalize ${profile.design.template === id ? "border-[#1565C0] bg-[#E3F2FD]" : "border-[#EEEFF3]"}`}
              onClick={() => void onChange({ ...DEFAULT_DESIGN, ...profile.design, template: id })}
            >
              {id}
            </button>
          ))}
        </div>
      </Card>
    </section>
  );
}

function Card({ children }: { children: ReactNode }) {
  return <div className="rounded-[22px] border border-[#EEEFF3] bg-white p-5">{children}</div>;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
