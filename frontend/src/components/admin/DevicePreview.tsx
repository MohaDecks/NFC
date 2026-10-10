import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Columns2, ExternalLink, Monitor, Smartphone, Tablet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PreviewMode = "mobile" | "tablet" | "desktop" | "both";

const PHONE_W = 390;
const PHONE_H = 780;
const DESKTOP_W = 1280;
const DESKTOP_H = 820;

function copyStyles(from: Document, to: Document) {
  to.head.querySelectorAll("[data-admin-preview]").forEach((node) => node.remove());
  const viewport = to.createElement("meta");
  viewport.name = "viewport";
  viewport.content = "width=device-width, initial-scale=1";
  viewport.setAttribute("data-admin-preview", "1");
  to.head.appendChild(viewport);
  from.querySelectorAll("link[rel='stylesheet'], style").forEach((node) => {
    const clone = node.cloneNode(true) as HTMLElement;
    clone.setAttribute("data-admin-preview", "1");
    to.head.appendChild(clone);
  });
  try {
    to.adoptedStyleSheets = [...from.adoptedStyleSheets];
  } catch {
    /* some browsers block transferring constructed sheets */
  }
}

function PreviewIframe({
  width,
  height,
  title,
  children,
}: {
  width: number;
  height: number;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [mount, setMount] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const iframe = ref.current;
    if (!iframe) return;
    let obs: MutationObserver | undefined;
    let cancelled = false;

    function attach() {
      const doc = iframe?.contentDocument;
      if (!iframe || !doc || cancelled) return;
      doc.documentElement.style.height = "100%";
      doc.documentElement.style.overflow = "auto";
      doc.body.style.margin = "0";
      doc.body.style.minHeight = "100%";
      doc.body.style.background = "#f7f6f3";
      copyStyles(document, doc);

      let root = doc.getElementById("preview-root");
      if (!root) {
        root = doc.createElement("div");
        root.id = "preview-root";
        doc.body.appendChild(root);
      }

      obs?.disconnect();
      obs = new MutationObserver(() => copyStyles(document, doc));
      obs.observe(document.head, { childList: true, subtree: true });
      setMount(root);
    }

    iframe.addEventListener("load", attach);
    attach();
    return () => {
      cancelled = true;
      iframe.removeEventListener("load", attach);
      obs?.disconnect();
      setMount(null);
    };
  }, []);

  return (
    <>
      <iframe
        ref={ref}
        title={title}
        srcDoc="<!DOCTYPE html><html><head></head><body></body></html>"
        className="block border-0 bg-[#f7f6f3]"
        style={{ width, height }}
      />
      {mount ? createPortal(children, mount) : null}
    </>
  );
}

function FitScale({ width, height, label, children }: { width: number; height: number; label: string; children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [avail, setAvail] = useState(width);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const sync = () => setAvail(el.clientWidth);
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scale = Math.min(1, avail / width) || 1;
  return (
    <div ref={box} className="w-full min-w-0">
      <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <div className="mx-auto" style={{ width: width * scale, height: height * scale }}>
        <div style={{ width, height, transform: `scale(${scale})`, transformOrigin: "top left" }}>{children}</div>
      </div>
    </div>
  );
}

function PhoneFrame({ children }: { children: ReactNode }) {
  const frameW = PHONE_W + 20;
  const frameH = PHONE_H + 48;
  return (
    <FitScale width={frameW} height={frameH} label={`Phone · ${PHONE_W}px`}>
      <div className="overflow-hidden rounded-[2rem] border-[10px] border-zinc-900 bg-zinc-900 shadow-[0_24px_60px_rgba(15,23,42,0.25)]">
        <div className="flex h-7 items-center justify-center bg-zinc-900">
          <div className="h-1.5 w-16 rounded-full bg-zinc-600" />
        </div>
        <PreviewIframe width={PHONE_W} height={PHONE_H} title="Phone preview">
          {children}
        </PreviewIframe>
      </div>
    </FitScale>
  );
}

function DesktopFrame({ children }: { children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [avail, setAvail] = useState(DESKTOP_W);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const sync = () => setAvail(el.clientWidth);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = Math.min(1, avail / DESKTOP_W) || 1;

  return (
    <div ref={box} className="min-w-0 flex-1">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Desktop · {DESKTOP_W}px{scale < 1 ? ` · ${Math.round(scale * 100)}%` : ""}
      </p>
      <div
        className="overflow-hidden rounded-xl border bg-white shadow-[0_24px_60px_rgba(15,23,42,0.12)]"
        style={{ height: DESKTOP_H * scale + 40 }}
      >
        <div className="flex h-10 items-center gap-2 border-b bg-slate-50 px-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-2 truncate rounded-md bg-white px-2 py-0.5 text-[11px] text-slate-500 ring-1 ring-slate-200">
            Full desktop layout
          </span>
        </div>
        <div
          style={{
            width: DESKTOP_W,
            height: DESKTOP_H,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <PreviewIframe width={DESKTOP_W} height={DESKTOP_H} title="Desktop preview">
            {children}
          </PreviewIframe>
        </div>
      </div>
    </div>
  );
}

function TabletFrame({ children }: { children: ReactNode }) {
  const width = 834;
  const height = 640;
  return (
    <FitScale width={width} height={height} label={`Tablet · ${width}px`}>
      <div className="overflow-hidden rounded-xl border bg-[#f7f6f3]">
        <PreviewIframe width={width} height={height} title="Tablet preview">
          {children}
        </PreviewIframe>
      </div>
    </FitScale>
  );
}

export function DevicePreview({
  render,
  liveUrl,
  defaultMode = "both",
}: {
  render: () => ReactNode;
  liveUrl?: string;
  defaultMode?: PreviewMode;
}) {
  const [mode, setMode] = useState<PreviewMode>(defaultMode);

  return (
    <div className="min-w-0">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1">
          <Button size="sm" variant={mode === "mobile" ? "default" : "outline"} onClick={() => setMode("mobile")}>
            <Smartphone className="h-3.5 w-3.5" /> Phone
          </Button>
          <Button size="sm" variant={mode === "tablet" ? "default" : "outline"} onClick={() => setMode("tablet")}>
            <Tablet className="h-3.5 w-3.5" /> Tablet
          </Button>
          <Button size="sm" variant={mode === "desktop" ? "default" : "outline"} onClick={() => setMode("desktop")}>
            <Monitor className="h-3.5 w-3.5" /> Desktop
          </Button>
          <Button size="sm" variant={mode === "both" ? "default" : "outline"} onClick={() => setMode("both")}>
            <Columns2 className="h-3.5 w-3.5" /> Both
          </Button>
        </div>
        {liveUrl ? (
          <a
            href={liveUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Open live page <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : null}
      </div>
      <div className={cn("flex items-start gap-6", mode === "both" ? "flex-col 2xl:flex-row" : "justify-center")}>
        {(mode === "mobile" || mode === "both") && <PhoneFrame>{render()}</PhoneFrame>}
        {mode === "tablet" && <TabletFrame>{render()}</TabletFrame>}
        {(mode === "desktop" || mode === "both") && <DesktopFrame>{render()}</DesktopFrame>}
      </div>
    </div>
  );
}
