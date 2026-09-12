import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CARD_TYPE_ORDER, isProfileType, resolveProfileType, type ProfileType } from "@shared/profileTypes";
import { TypePhonePreview } from "@/components/profile/TypePhonePreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { friendlyError } from "@/lib/utils";
import type { AdminProfile } from "@/types";

type CardType = { slug: string; name: string; description: string; status: string };

export function RegisterBusinessCardPage() {
  const navigate = useNavigate();
  const [types, setTypes] = useState<CardType[]>([]);
  const [type, setType] = useState<ProfileType>("PERSONAL");
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const config = resolveProfileType(type);

  useEffect(() => {
    void api
      .get<{ profileTypes: CardType[] }>("/api/admin/profile-types?active=true&usage=CARD")
      .then((data) => {
        const rows = data.profileTypes
          .filter((item) => item.slug !== "PROFESSIONAL")
          .slice()
          .sort((a, b) => {
            const left = CARD_TYPE_ORDER.indexOf(a.slug as (typeof CARD_TYPE_ORDER)[number]);
            const right = CARD_TYPE_ORDER.indexOf(b.slug as (typeof CARD_TYPE_ORDER)[number]);
            return (left === -1 ? 99 : left) - (right === -1 ? 99 : right);
          });
        setTypes(rows);
        if (rows[0] && isProfileType(rows[0].slug)) setType(rows[0].slug);
      })
      .catch(() => {
        setTypes(CARD_TYPE_ORDER.map((slug) => {
          const item = resolveProfileType(slug);
          return { slug, name: item.shortLabel, description: item.description, status: "ACTIVE" };
        }));
      });
  }, []);

  async function submit() {
    if (!type) return toast.error("Choose a card type");
    if (!name.trim()) return toast.error("Enter a name");
    setBusy(true);
    try {
      const created = await api.post<{ profile: AdminProfile }>("/api/admin/profiles", {
        type,
        name: name.trim(),
        ownerName: name.trim(),
      });
      const updated = await api.patch<{ profile: AdminProfile }>(`/api/admin/profiles/${created.profile.id}`, {
        name: name.trim(),
        tagline: tagline.trim(),
        ownerName: name.trim(),
        contact: { phone, email, whatsapp, website },
      });
      await api.post(`/api/admin/profiles/${updated.profile.id}/publish`).catch(() => undefined);
      toast.success("Business card registered");
      navigate(`/admin/profiles/${updated.profile.id}`);
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
      <div className="space-y-5">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Business Card Register</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Register a digital business card. Choose the type from the dropdown — Personal, Hotel, Cafeteria, Engineer, and any types you add under Card Types.
          </p>
        </div>
        <div className="space-y-5 rounded-[22px] border border-[#EEEFF3] bg-white p-5">
          <div className="space-y-2">
            <Label>Card type *</Label>
            <select
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value as ProfileType)}
            >
              {(types.length ? types : CARD_TYPE_ORDER.map((slug) => ({ slug, name: resolveProfileType(slug).shortLabel }))).map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
            <p className="text-[12px] text-slate-400">{config.description}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name *" value={name} onChange={setName} placeholder="Mohamed Ali" />
            <Field label="Title / company" value={tagline} onChange={setTagline} placeholder={config.shortLabel} />
            <Field label="Phone number" value={phone} onChange={setPhone} />
            <Field label="WhatsApp" value={whatsapp} onChange={setWhatsapp} />
            <Field label="Email" value={email} onChange={setEmail} />
            <Field label="Website" value={website} onChange={setWebsite} />
          </div>
          <Button className="rounded-full bg-[#1565C0] hover:bg-[#0D47A1]" disabled={busy} onClick={() => void submit()}>
            Register business card
          </Button>
        </div>
      </div>
      <aside className="xl:sticky xl:top-24">
        <p className="mb-3 text-center text-[12px] text-slate-400">Live preview</p>
        <TypePhonePreview type={type} name={name} subtitle={tagline} />
        <p className="mt-3 text-center text-[11px] text-slate-400">{config.shortLabel} business card</p>
      </aside>
    </div>
  );
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
