import { SECTION_REGISTRY, TYPE_SECTION_PRESETS, type SectionType } from "../../../shared/sections";
import { ProfileSection } from "../models/ProfileSection";
import type { Profile } from "../models/Profile";

export function serializeSection(section: InstanceType<typeof ProfileSection>) {
  return {
    id: section.id,
    type: section.type as SectionType,
    title: section.title || SECTION_REGISTRY[section.type as SectionType]?.label || section.type,
    visible: section.visible,
    sortOrder: section.sortOrder,
    content: (section.content ?? {}) as Record<string, unknown>,
  };
}

export async function ensureSections(profile: InstanceType<typeof Profile>) {
  const count = await ProfileSection.countDocuments({ profile: profile._id });
  if (count > 0) {
    const sections = await ProfileSection.find({ profile: profile._id }).sort({ sortOrder: 1, createdAt: 1 });
    return sections.map(serializeSection);
  }

  const { ProfileType } = await import("../models/ProfileType");
  const stored = await ProfileType.findOne({ slug: profile.type, status: "ACTIVE" });
  const preset = (stored?.defaultSections?.length ? stored.defaultSections : TYPE_SECTION_PRESETS[profile.type as keyof typeof TYPE_SECTION_PRESETS]) ?? TYPE_SECTION_PRESETS.PERSONAL;
  const created = await ProfileSection.insertMany(
    preset.map((type, index) => ({
      profile: profile._id,
      type,
      title: SECTION_REGISTRY[type as SectionType]?.label || type,
      visible: true,
      sortOrder: index,
      content: {},
    })),
  );
  return created.map((section) => serializeSection(section as InstanceType<typeof ProfileSection>));
}
