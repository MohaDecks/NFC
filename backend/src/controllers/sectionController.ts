import type { Request, Response } from "express";
import { SECTION_REGISTRY, SECTION_TYPES, type SectionType } from "../../../shared/sections";
import { ProfileSection } from "../models/ProfileSection";
import { AppError } from "../utils/AppError";
import { created, ok } from "../utils/response";
import { routeParam } from "../utils/params";
import type { AuthedRequest } from "../middleware/auth";
import { getProfileOrThrow } from "../services/profileService";
import { ensureSections, serializeSection } from "../services/sectionService";
import { writeAudit } from "../services/audit";

export async function listAllSections(_req: Request, res: Response) {
  const sections = await ProfileSection.find().sort({ sortOrder: 1, createdAt: -1 }).limit(300).populate("profile", "name publicId type");
  return ok(res, {
    sections: sections.map((section) => {
      const profile = section.profile && typeof section.profile === "object" && "name" in section.profile
        ? (section.profile as unknown as { id?: string; _id?: unknown; name?: string; publicId?: string; type?: string })
        : null;
      return {
        ...serializeSection(section),
        profileId: profile ? String(profile.id ?? profile._id ?? section.profile) : String(section.profile),
        profileName: profile?.name ?? "Profile",
        publicId: profile?.publicId ?? "",
        profileType: profile?.type ?? "",
      };
    }),
  });
}

export async function listSections(req: Request, res: Response) {
  const profile = await getProfileOrThrow(routeParam(req, "id"));
  const sections = await ensureSections(profile);
  return ok(res, { sections });
}

export async function createSection(req: Request, res: Response) {
  const admin = (req as AuthedRequest).user;
  const profile = await getProfileOrThrow(routeParam(req, "id"));
  const type = req.body.type as SectionType;
  if (!SECTION_TYPES.includes(type)) throw new AppError(400, "Unknown section type", "INVALID_SECTION");
  const count = await ProfileSection.countDocuments({ profile: profile._id });
  const section = await ProfileSection.create({
    profile: profile._id,
    type,
    title: req.body.title || SECTION_REGISTRY[type].label,
    visible: req.body.visible ?? true,
    sortOrder: count,
    content: req.body.content ?? {},
  });
  await writeAudit(admin, "SECTION_CREATED", { id: profile.id, name: `${profile.name} / ${section.title}` });
  return created(res, { section: serializeSection(section) });
}

export async function updateSection(req: Request, res: Response) {
  const admin = (req as AuthedRequest).user;
  const section = await ProfileSection.findById(routeParam(req, "id"));
  if (!section) throw new AppError(404, "Section not found", "SECTION_NOT_FOUND");
  if (typeof req.body.title === "string") section.title = req.body.title;
  if (typeof req.body.visible === "boolean") section.visible = req.body.visible;
  if (req.body.content && typeof req.body.content === "object") section.content = req.body.content;
  await section.save();
  await writeAudit(admin, "SECTION_UPDATED", { id: String(section.profile), name: section.title });
  return ok(res, { section: serializeSection(section) });
}

export async function deleteSection(req: Request, res: Response) {
  const admin = (req as AuthedRequest).user;
  const section = await ProfileSection.findById(routeParam(req, "id"));
  if (!section) throw new AppError(404, "Section not found", "SECTION_NOT_FOUND");
  await writeAudit(admin, "SECTION_DELETED", { id: String(section.profile), name: section.title });
  await section.deleteOne();
  return ok(res, { deleted: true });
}

export async function reorderSections(req: Request, res: Response) {
  const ids = req.body.orderedIds as string[];
  await Promise.all(ids.map((id, index) => ProfileSection.findByIdAndUpdate(id, { sortOrder: index })));
  return ok(res, { reordered: true });
}
