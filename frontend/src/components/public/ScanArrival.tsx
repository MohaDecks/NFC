import { useEffect, useState } from "react";
import { Nfc } from "lucide-react";
import type { PublicProfile } from "@/types";
import { mediaSrc } from "@/lib/media";
import { playScanChime, pulseScanHaptic } from "@/lib/scanChime";

export function ScanArrival({ profile }: { profile: PublicProfile }) {
  const [open, setOpen] = useState(true);
  const photo = profile.media.logoUrl || profile.media.avatarUrl;

  useEffect(() => {
    const announce = () => {
      try {
        playScanChime();
        pulseScanHaptic();
      } catch {
        // browsers may block audio until tap
      }
    };
    announce();
    const onFirstTap = () => {
      announce();
      window.removeEventListener("pointerdown", onFirstTap);
    };
    window.addEventListener("pointerdown", onFirstTap, { once: true });
    const hide = window.setTimeout(() => setOpen(false), 4200);
    return () => {
      window.clearTimeout(hide);
      window.removeEventListener("pointerdown", onFirstTap);
    };
  }, []);

  if (!open) return null;

  return (
    <button
      type="button"
      onClick={() => {
        try {
          playScanChime();
        } catch {
          // ignore
        }
        setOpen(false);
      }}
      className="scan-banner fixed inset-x-3 top-[max(0.75rem,env(safe-area-inset-top))] z-50 mx-auto flex max-w-md items-center gap-3 rounded-[22px] border border-black/5 bg-white/95 px-3 py-3 text-left shadow-[0_18px_50px_rgba(15,23,42,0.18)] backdrop-blur-xl"
    >
      {photo ? (
        <img src={mediaSrc(photo, 120)} alt="" className="h-12 w-12 rounded-2xl object-cover" />
      ) : (
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl text-white" style={{ background: "var(--p, #6D28D9)" }}>
          <Nfc className="h-5 w-5" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6D28D9]">Digital card received</span>
        <span className="mt-0.5 block truncate text-[15px] font-semibold text-[#111827]">{profile.name}</span>
        <span className="block truncate text-[12px] text-[#6B7280]">{profile.tagline || "Tap to view the profile"}</span>
      </span>
    </button>
  );
}
