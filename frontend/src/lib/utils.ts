import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency = "ETB") {
  return `${price.toLocaleString()} ${currency}`;
}

export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function whatsappLink(phone: string) {
  const digits = digitsOnly(phone);
  return digits ? `https://wa.me/${digits}` : undefined;
}

export function mapsLink(
  address: string,
  mapsUrl?: string,
  latitude?: number | null,
  longitude?: number | null,
) {
  if (mapsUrl) return mapsUrl;
  if (typeof latitude === "number" && typeof longitude === "number") {
    return `https://maps.google.com/?q=${latitude},${longitude}`;
  }
  if (!address) return undefined;
  return `https://maps.google.com/?q=${encodeURIComponent(address)}`;
}

export function mapsEmbedSrc(
  address: string,
  mapsUrl?: string,
  latitude?: number | null,
  longitude?: number | null,
) {
  if (typeof latitude === "number" && typeof longitude === "number") {
    return `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;
  }
  if (address) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed`;
  }
  if (mapsUrl) {
    const query = mapsUrl.includes("query=")
      ? mapsUrl.split("query=")[1]
      : mapsUrl.includes("q=")
        ? mapsUrl.split("q=")[1]
        : "";
    if (query) return `https://maps.google.com/maps?q=${query.split("&")[0]}&z=15&output=embed`;
  }
  return undefined;
}

export function websiteLink(url: string) {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

export function profileUrl(publicId: string) {
  return `${window.location.origin}/p/${publicId}`;
}

export function downloadTextFile(filename: string, contents: string, type = "text/plain") {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function buildVCard(profile: {
  name: string;
  tagline?: string;
  contact: { phone?: string; email?: string; website?: string };
  location?: { address?: string };
}) {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${profile.name}`,
    profile.tagline ? `TITLE:${profile.tagline}` : "",
    profile.contact.phone ? `TEL:${profile.contact.phone}` : "",
    profile.contact.email ? `EMAIL:${profile.contact.email}` : "",
    profile.contact.website ? `URL:${websiteLink(profile.contact.website)}` : "",
    profile.location?.address ? `ADR;CHARSET=UTF-8:;;${profile.location.address};;;;` : "",
    "END:VCARD",
  ];
  return lines.filter(Boolean).join("\n");
}

export function friendlyError(err: unknown, fallback = "Something went wrong") {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
