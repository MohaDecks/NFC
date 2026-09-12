import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useBranding } from "@/hooks/useBranding";
import { cn } from "@/lib/utils";

function NfcWaves({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M7.5 9.5c2.8-2.8 6.2-2.8 9 0" strokeLinecap="round" />
      <path d="M5.2 6.8c4.2-4.2 9.4-4.2 13.6 0" strokeLinecap="round" />
      <path d="M9.8 12.4c1.4-1.4 3-1.4 4.4 0" strokeLinecap="round" />
      <circle cx="12" cy="16.2" r="1.15" fill="currentColor" stroke="none" />
    </svg>
  );
}

export type ShowcaseDesign = {
  name?: string;
  backgroundColor: string;
  primaryColor: string;
  accentColor: string;
  frontText?: string;
  backText?: string;
};

export function FlipNfcCard({
  design,
  title,
  subtitle = "Digital Business Card",
  qrValue,
  logoUrl,
  className,
  width = 268,
}: {
  design: ShowcaseDesign;
  title?: string;
  subtitle?: string;
  qrValue?: string;
  logoUrl?: string;
  className?: string;
  width?: number;
}) {
  const { brandName, logoUrl: brandLogo, tagline } = useBranding();
  const [flipped, setFlipped] = useState(false);
  const heading = title || brandName;
  const qr = qrValue || (typeof window !== "undefined" ? window.location.origin : "https://mubarek.tech");
  const mark = logoUrl || brandLogo;

  return (
    <button
      type="button"
      onClick={() => setFlipped((value) => !value)}
      className={cn("group relative text-left [perspective:1200px]", className)}
      style={{ width, aspectRatio: "1.586 / 1" }}
      aria-label="Flip NFC card"
    >
      <div
        className="relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:-translate-y-2"
        style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        <div
          className="absolute inset-0 overflow-hidden rounded-[18px] [backface-visibility:hidden]"
          style={{
            background: `linear-gradient(155deg, ${design.backgroundColor} 0%, color-mix(in srgb, ${design.backgroundColor} 72%, black) 100%)`,
            color: design.primaryColor,
            boxShadow: "0 22px 40px rgba(15,23,42,0.28), inset 0 1px 0 rgba(255,255,255,0.14)",
          }}
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/14 via-transparent to-transparent" />
          <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full opacity-40 blur-2xl" style={{ background: design.accentColor }} />
          <div className="relative flex h-full flex-col p-5">
            <div className="flex items-start justify-between">
              {mark ? (
                <img src={mark} alt="" className="h-9 w-auto max-w-16 object-contain" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-xs font-bold text-slate-900">M</div>
              )}
              <NfcWaves className="h-6 w-6 opacity-75" />
            </div>
            <div className="mt-auto">
              <p className="text-[15px] font-semibold leading-tight tracking-tight">{heading}</p>
              <p className="mt-1 text-[11px] opacity-70">{subtitle}</p>
              <p className="mt-2 text-[10px] uppercase tracking-[0.16em] opacity-55">{design.frontText || tagline}</p>
            </div>
          </div>
        </div>
        <div
          className="absolute inset-0 overflow-hidden rounded-[18px] bg-white [backface-visibility:hidden] [transform:rotateY(180deg)]"
          style={{ boxShadow: "0 18px 36px rgba(15,23,42,0.12), inset 0 1px 0 rgba(255,255,255,1)" }}
        >
          <div className="flex h-full flex-col items-center justify-between p-5 text-center">
            <p className="text-[11px] font-medium text-slate-400">{design.backText || "Scan or Tap"}</p>
            <div className="rounded-xl bg-white p-1.5 shadow-sm">
              <QRCodeSVG value={qr} size={88} level="M" />
            </div>
            <div>
              <p className="text-[12px] font-semibold text-slate-800">{heading}</p>
              <p className="text-[10px] text-slate-400">NFC · QR</p>
            </div>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-8 -bottom-3 h-6 rounded-full bg-black/20 blur-md" />
    </button>
  );
}
