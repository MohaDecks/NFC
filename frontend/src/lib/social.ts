import { whatsappLink, websiteLink } from "./utils";

export type SocialKind =
  | "whatsapp"
  | "telegram"
  | "facebook"
  | "instagram"
  | "tiktok"
  | "youtube"
  | "linkedin"
  | "x"
  | "snapchat"
  | "website";

export const SOCIAL_PLATFORMS: { id: SocialKind; label: string }[] = [
  { id: "whatsapp", label: "WhatsApp" },
  { id: "telegram", label: "Telegram" },
  { id: "facebook", label: "Facebook" },
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "youtube", label: "YouTube" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "x", label: "X" },
  { id: "snapchat", label: "Snapchat" },
  { id: "website", label: "Website" },
];

export function detectSocialKind(platform: string, url = ""): SocialKind {
  const text = `${platform} ${url}`.toLowerCase();
  if (text.includes("whats") || text.includes("wa.me") || text.includes("api.whatsapp")) return "whatsapp";
  if (text.includes("tele") || text.includes("t.me")) return "telegram";
  if (text.includes("face") || text.includes("fb.com") || text.includes("fb.me")) return "facebook";
  if (text.includes("insta")) return "instagram";
  if (text.includes("tiktok") || text.includes("tik tok")) return "tiktok";
  if (text.includes("youtu")) return "youtube";
  if (text.includes("linked")) return "linkedin";
  if (text.includes("snap")) return "snapchat";
  if (/(^|\s)x(\s|$)/.test(text) || text.includes("twitter") || text.includes("x.com")) return "x";
  return "website";
}

function handle(value: string) {
  return value.replace(/^@/, "").replace(/^https?:\/\//i, "").replace(/\/+$/, "");
}

export function socialHref(kind: SocialKind, url: string, username?: string) {
  const raw = (url || username || "").trim();
  if (!raw) return undefined;

  if (kind === "whatsapp") {
    if (/^https?:\/\//i.test(raw) || raw.includes("wa.me")) return websiteLink(raw);
    return whatsappLink(raw);
  }

  if (kind === "telegram") {
    if (raw.includes("t.me") || /^https?:\/\//i.test(raw)) return websiteLink(raw);
    return `https://t.me/${handle(username || raw)}`;
  }

  if (kind === "instagram") {
    if (/^https?:\/\//i.test(raw) || raw.includes("instagram.com")) return websiteLink(raw);
    return `https://instagram.com/${handle(username || raw)}`;
  }

  if (kind === "facebook") {
    if (/^https?:\/\//i.test(raw) || raw.includes("facebook.com") || raw.includes("fb.com")) return websiteLink(raw);
    return `https://facebook.com/${handle(username || raw)}`;
  }

  if (kind === "tiktok") {
    if (/^https?:\/\//i.test(raw) || raw.includes("tiktok.com")) return websiteLink(raw);
    return `https://www.tiktok.com/@${handle(username || raw)}`;
  }

  if (kind === "youtube") {
    if (/^https?:\/\//i.test(raw) || raw.includes("youtu")) return websiteLink(raw);
    return `https://youtube.com/${handle(username || raw)}`;
  }

  if (kind === "linkedin") {
    if (/^https?:\/\//i.test(raw) || raw.includes("linkedin.com")) return websiteLink(raw);
    return `https://www.linkedin.com/in/${handle(username || raw)}`;
  }

  if (kind === "x") {
    if (/^https?:\/\//i.test(raw) || raw.includes("x.com") || raw.includes("twitter.com")) return websiteLink(raw);
    return `https://x.com/${handle(username || raw)}`;
  }

  if (kind === "snapchat") {
    if (/^https?:\/\//i.test(raw) || raw.includes("snapchat.com")) return websiteLink(raw);
    return `https://www.snapchat.com/add/${handle(username || raw)}`;
  }

  return websiteLink(raw);
}

export function socialLabel(kind: SocialKind, username?: string) {
  const meta = SOCIAL_PLATFORMS.find((item) => item.id === kind)?.label || "Website";
  return username ? `@${username.replace(/^@/, "")}` : meta;
}
