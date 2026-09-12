import { Link } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "sonner";
import { Check, Copy, Download, ExternalLink, Nfc } from "lucide-react";
import { useState } from "react";
import { typeLabel } from "@shared/profileTypes";
import { profileUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PublishBadge, StatusBadge } from "@/components/admin/StatusBadges";
import type { AdminProfile } from "@/types";

function downloadQr(publicId: string) {
  const canvas = document.getElementById(`hub-qr-${publicId}`) as HTMLCanvasElement | null;
  if (!canvas) return;
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = `${publicId}-qr.png`;
  a.click();
}

export function ConnectionCard({ profile }: { profile: AdminProfile }) {
  const url = profileUrl(profile.publicId);
  const image = profile.avatarUrl || profile.logoUrl;
  const typeName = typeLabel(profile.type);
  const [copied, setCopied] = useState(false);
  const color = profile.design?.primaryColor || "#1b6b5a";

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("URL copied");
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_8px_24px_rgba(17,22,20,0.04)] transition duration-300 hover:-translate-y-1 hover:border-[#1b6b5a]/25 hover:shadow-[0_22px_48px_rgba(17,22,20,0.12)]">
      <div className="h-1.5 w-full" style={{ background: color }} />
      <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100" style={{ background: `linear-gradient(180deg, color-mix(in oklab, ${color} 8%, transparent), transparent 42%)` }} />

      <div className="relative p-5">
        <div className="flex items-start gap-3">
          {image ? (
            <img src={image} alt="" className="h-11 w-11 rounded-xl object-cover ring-1 ring-black/5" />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-xl text-sm font-semibold text-white" style={{ background: color }}>
              {profile.name[0]}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              <Nfc className="h-3 w-3" />
              {typeName}
            </div>
            <h2 className="truncate text-[15px] font-semibold tracking-tight">{profile.name}</h2>
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <div className="rounded-2xl border border-black/[0.05] bg-[#f7f4ee] p-3 shadow-inner transition duration-300 group-hover:scale-[1.03] group-hover:bg-white group-hover:shadow-[0_12px_30px_rgba(17,22,20,0.08)]">
            <QRCodeCanvas id={`hub-qr-${profile.publicId}`} value={url} size={148} includeMargin />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          <StatusBadge status={profile.status} />
          <PublishBadge state={profile.publishState} />
        </div>

        <button
          type="button"
          onClick={() => void copy()}
          className="mt-3 flex w-full items-center gap-2 rounded-xl border border-black/[0.05] bg-[#f7f4ee] px-3 py-2 text-left transition hover:border-[#1b6b5a]/20 hover:bg-white"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-[#1b6b5a]" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
          <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-muted-foreground">{url}</span>
        </button>

        <div className="mt-3 grid grid-cols-2 gap-2 opacity-90 transition duration-300 group-hover:opacity-100">
          <Button size="sm" variant="outline" onClick={() => downloadQr(profile.publicId)}>
            <Download className="h-3.5 w-3.5" />
            Download
          </Button>
          <Button size="sm" asChild>
            <Link to={`/admin/profiles/${profile.id}?tab=nfc`}>
              <ExternalLink className="h-3.5 w-3.5" />
              Open
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
