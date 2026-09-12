import type { ReactNode } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { applyCardPreset, CARD_PRESET_REGISTRY, CARD_PRESET_IDS, defaultCardDesignForType, type CardDesign } from "@shared/cardDesign";
import type { AdminProfile } from "@/types";
import { profileUrl } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useBranding } from "@/hooks/useBranding";
import { FlipNfcCard } from "@/components/admin/FlipNfcCard";

export function CardDesigner({
  profile,
  value,
  onChange,
  onSave,
}: {
  profile: AdminProfile;
  value?: CardDesign;
  onChange: (design: CardDesign) => void;
  onSave?: () => void;
}) {
  const { brandName, logoUrl: brandLogo } = useBranding();
  const design = value ?? defaultCardDesignForType(profile.type);
  const url = profileUrl(profile.publicId);
  const customerLogo = profile.logoUrl || profile.avatarUrl;
  const logo = design.logoSource === "brand" ? brandLogo : customerLogo;

  return (
    <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
      <div className="space-y-4 rounded-2xl border bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Card presets</p>
        <div className="grid gap-2">
          {CARD_PRESET_IDS.map((id) => (
            <button
              key={id}
              type="button"
              className={`rounded-xl border px-3 py-2 text-left text-sm ${design.preset === id ? "border-primary bg-primary/5" : ""}`}
              onClick={() => onChange(applyCardPreset(id, design))}
            >
              <span className="font-medium">{CARD_PRESET_REGISTRY[id].name}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{CARD_PRESET_REGISTRY[id].description}</span>
            </button>
          ))}
        </div>
        <Label>Front text</Label>
        <Input value={design.frontText} onChange={(e) => onChange({ ...design, frontText: e.target.value })} />
        <Label>Back text</Label>
        <Input value={design.backText} onChange={(e) => onChange({ ...design, backText: e.target.value })} />
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label>Background</Label>
            <Input type="color" value={design.backgroundColor} onChange={(e) => onChange({ ...design, backgroundColor: e.target.value })} />
          </div>
          <div>
            <Label>Text</Label>
            <Input type="color" value={design.primaryColor} onChange={(e) => onChange({ ...design, primaryColor: e.target.value })} />
          </div>
          <div>
            <Label>Accent</Label>
            <Input type="color" value={design.accentColor} onChange={(e) => onChange({ ...design, accentColor: e.target.value })} />
          </div>
        </div>
        <label className="flex items-center justify-between text-sm">
          Show logo
          <Switch checked={design.showLogo} onCheckedChange={(showLogo) => onChange({ ...design, showLogo })} />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" variant={design.logoSource === "brand" ? "default" : "outline"} onClick={() => onChange({ ...design, logoSource: "brand" })}>
            Use MUBAREK Logo
          </Button>
          <Button type="button" variant={design.logoSource === "profile" ? "default" : "outline"} onClick={() => onChange({ ...design, logoSource: "profile" })}>
            Use Customer Logo
          </Button>
        </div>
        <select
          className="h-10 w-full rounded-md border px-3 text-sm"
          value={design.qrPlacement}
          onChange={(e) => onChange({ ...design, qrPlacement: e.target.value as CardDesign["qrPlacement"] })}
        >
          <option value="center">QR centered</option>
          <option value="bottom">QR at bottom</option>
        </select>
        {onSave && <Button onClick={onSave}>Save card design</Button>}
      </div>
      <div className="space-y-4">
        <div className="flex justify-center rounded-[28px] bg-[#F7F8FC] py-8">
          <FlipNfcCard
            title={design.logoSource === "brand" ? brandName : profile.name}
            subtitle={design.frontText || "Digital Business Card"}
            qrValue={url}
            logoUrl={design.showLogo ? logo || undefined : undefined}
            design={design}
          />
        </div>
        <p className="text-center text-xs text-muted-foreground">Click the card to flip. Company logo and customer logo stay separate.</p>
        <div className="grid gap-6 md:grid-cols-2">
        <CardFace label="Front" design={design}>
          {design.showLogo && logo && (
            <img src={logo} alt="" className="h-12 w-auto max-w-16 object-contain" />
          )}
          <p className="mt-auto text-xl font-semibold leading-tight">{design.logoSource === "brand" ? brandName : profile.name || "Brand name"}</p>
          <p className="text-xs uppercase tracking-[0.2em] opacity-70">{design.frontText}</p>
          <span className="mt-3 inline-block h-1 w-10 rounded-full" style={{ background: design.accentColor }} />
        </CardFace>
        <CardFace label="Back" design={design}>
          <p className="text-sm font-semibold">{design.logoSource === "brand" ? brandName : profile.name}</p>
          <div className={design.qrPlacement === "bottom" ? "mt-auto flex flex-col items-center" : "flex flex-1 flex-col items-center justify-center"}>
            <div className="rounded-lg bg-white p-2">
              <QRCodeCanvas value={url} size={92} includeMargin={false} />
            </div>
            <p className="mt-2 text-[11px] opacity-70">{design.backText}</p>
          </div>
          <p className="mt-2 text-[10px] uppercase tracking-[0.18em] opacity-60">NFC · Tap to open</p>
        </CardFace>
        </div>
      </div>
    </div>
  );
}

function CardFace({
  label,
  design,
  children,
}: {
  label: string;
  design: CardDesign;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <div
        className="flex aspect-[1.586/1] w-full flex-col rounded-2xl p-5 shadow-xl transition duration-300 hover:-translate-y-1 hover:rotate-[-2deg]"
        style={{ background: design.backgroundColor, color: design.primaryColor }}
      >
        {children}
      </div>
    </div>
  );
}
