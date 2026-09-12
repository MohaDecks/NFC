import type { ProfileSectionItem, PublicProfile } from "@/types";
import type { SectionType } from "@shared/sections";

export type ContentItem = {
  title?: string;
  text?: string;
  url?: string;
  image?: string;
  company?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  category?: string;
  technologies?: string;
  github?: string;
  featured?: boolean;
};

export function sectionOf(profile: PublicProfile, type: SectionType) {
  return (profile.sections ?? []).find((section) => section.type === type && section.visible !== false) ?? null;
}

export function itemsOf(section: ProfileSectionItem | null): ContentItem[] {
  if (!section) return [];
  const items = Array.isArray(section.content?.items) ? (section.content.items as ContentItem[]) : [];
  return items.filter((item) => item.title || item.text || item.url || item.image);
}

export function techList(value?: string) {
  return (value || "")
    .split(/[,•|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}
