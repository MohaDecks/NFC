import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { friendlyError } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBranding } from "@/hooks/useBranding";
import { useAdmin } from "@/hooks/useAdmin";

export function BrandingPage() {
  const { branding, refresh } = useBranding();
  const { can } = useAdmin();
  const [name, setName] = useState(branding.name);
  const [tagline, setTagline] = useState(branding.tagline);
  const [primaryColor, setPrimaryColor] = useState(branding.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(branding.secondaryColor);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setName(branding.name);
    setTagline(branding.tagline);
    setPrimaryColor(branding.primaryColor);
    setSecondaryColor(branding.secondaryColor);
  }, [branding]);

  async function save() {
    setBusy(true);
    try {
      await api.patch("/api/admin/branding", { name, tagline, primaryColor, secondaryColor });
      await refresh();
      toast.success("Branding saved");
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  async function uploadLogo(file: File) {
    setBusy(true);
    try {
      await api.upload("/api/admin/branding/logo", file);
      await refresh();
      toast.success("Logo updated");
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Branding</h1>
        <p className="mt-1 text-sm text-muted-foreground">Company identity used across the admin portal, cards, and public pages.</p>
      </div>
      <div className="rounded-[22px] border border-[#EEEFF3] bg-white p-6">
        <p className="text-sm font-medium">Current Logo</p>
        <div className="mt-4 flex justify-center rounded-2xl bg-[#F7F8FC] p-6">
          <img src={branding.logoUrl} alt={branding.name} className="max-h-40 w-auto object-contain" />
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">Source asset is kept at /branding/mubarek-logo-source.png</p>
        {can("settings.edit") && (
          <div className="mt-4 flex flex-wrap gap-2">
            <label className="inline-flex h-10 cursor-pointer items-center rounded-full bg-[#1565C0] px-4 text-sm text-white">
              Upload / Replace Logo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadLogo(file);
                }}
              />
            </label>
            <Button
              variant="outline"
              className="rounded-full"
              disabled={busy}
              onClick={async () => {
                await api.delete("/api/admin/branding/logo");
                await refresh();
                toast.success("Logo reset to official source");
              }}
            >
              Remove Logo
            </Button>
          </div>
        )}
      </div>
      <div className="space-y-4 rounded-[22px] border border-[#EEEFF3] bg-white p-6">
        <div className="space-y-2">
          <Label>Company Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Tagline</Label>
          <Input value={tagline} onChange={(e) => setTagline(e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Primary Color</Label>
            <Input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Secondary Color</Label>
            <Input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} />
          </div>
        </div>
        {can("settings.edit") && (
          <Button className="rounded-full bg-[#1565C0] hover:bg-[#0D47A1]" disabled={busy} onClick={() => void save()}>
            Save Changes
          </Button>
        )}
      </div>
    </div>
  );
}
