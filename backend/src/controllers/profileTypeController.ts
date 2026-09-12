import type { Request, Response } from "express";
import { defaultUsageForType, PROFILE_TYPE_REGISTRY, type ProfileType as BuiltInType, type TypeUsage } from "../../../shared/profileTypes";
import { TYPE_SECTION_PRESETS } from "../../../shared/sections";
import { ProfileType } from "../models/ProfileType";
import { Profile } from "../models/Profile";
import { AppError } from "../utils/AppError";
import { created, ok } from "../utils/response";
import { routeParam } from "../utils/params";
import type { AuthedRequest } from "../middleware/auth";
import { writeAudit } from "../services/audit";

function serialize(doc: InstanceType<typeof ProfileType>) {
  return {
    id: doc.id,
    name: doc.name,
    slug: doc.slug,
    description: doc.description,
    icon: doc.icon,
    usage: doc.usage || "BOTH",
    status: doc.status,
    defaultSections: doc.defaultSections,
    allowedSections: doc.allowedSections,
    compatibleTemplates: doc.compatibleTemplates,
    isSystem: doc.isSystem,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function seedProfileTypes() {
  for (const config of Object.values(PROFILE_TYPE_REGISTRY)) {
    await ProfileType.findOneAndUpdate(
      { slug: config.id },
      {
        name: config.label,
        slug: config.id,
        description: config.description,
        icon: config.icon,
        usage: defaultUsageForType(config.id),
        status: "ACTIVE",
        defaultSections: TYPE_SECTION_PRESETS[config.id as BuiltInType] ?? [],
        allowedSections: TYPE_SECTION_PRESETS[config.id as BuiltInType] ?? [],
        compatibleTemplates: config.templates,
        isSystem: true,
      },
      { upsert: true },
    );
  }
}

export async function listProfileTypes(req: Request, res: Response) {
  await seedProfileTypes();
  const activeOnly = String(req.query.active ?? "") === "true";
  const usage = String(req.query.usage ?? "").toUpperCase();
  const filter: Record<string, unknown> = {};
  if (activeOnly) filter.status = "ACTIVE";
  if (usage === "CARD") {
    filter.usage = { $in: ["CARD", "BOTH"] };
    filter.slug = { $ne: "PROFESSIONAL" };
  }
  if (usage === "PLACE") {
    filter.usage = { $in: ["PLACE", "BOTH"] };
    filter.slug = { $ne: "PROFESSIONAL" };
  }
  const types = await ProfileType.find(filter).sort({ isSystem: -1, name: 1 });
  return ok(res, { profileTypes: types.map(serialize) });
}

export async function createProfileType(req: Request, res: Response) {
  const actor = (req as AuthedRequest).user;
  const name = String(req.body.name ?? "").trim();
  const slug = String(req.body.slug ?? name)
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
  if (!name || !slug) throw new AppError(400, "Name is required", "INVALID");
  const existing = await ProfileType.findOne({ slug });
  if (existing) throw new AppError(409, "That profile type already exists", "TYPE_EXISTS");
  const doc = await ProfileType.create({
    name,
    slug,
    description: String(req.body.description ?? "").trim(),
    icon: String(req.body.icon ?? "badge"),
    usage: (["PLACE", "CARD", "BOTH"].includes(String(req.body.usage)) ? req.body.usage : "BOTH") as TypeUsage,
    status: req.body.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
    defaultSections: Array.isArray(req.body.defaultSections) ? req.body.defaultSections : ["hero", "about", "contact", "location", "social", "footer"],
    allowedSections: Array.isArray(req.body.allowedSections) ? req.body.allowedSections : [],
    compatibleTemplates: Array.isArray(req.body.compatibleTemplates) ? req.body.compatibleTemplates : ["modern", "business"],
    isSystem: false,
  });
  await writeAudit(actor, "PROFILE_TYPE_CREATED", { id: doc.id, name: doc.name, type: "ProfileType" });
  return created(res, { profileType: serialize(doc) });
}

export async function updateProfileType(req: Request, res: Response) {
  const actor = (req as AuthedRequest).user;
  const doc = await ProfileType.findById(routeParam(req, "id"));
  if (!doc) throw new AppError(404, "Profile type not found", "NOT_FOUND");
  if (typeof req.body.name === "string") doc.name = req.body.name.trim();
  if (typeof req.body.description === "string") doc.description = req.body.description.trim();
  if (typeof req.body.icon === "string") doc.icon = req.body.icon;
  if (req.body.usage === "PLACE" || req.body.usage === "CARD" || req.body.usage === "BOTH") doc.usage = req.body.usage;
  if (req.body.status === "ACTIVE" || req.body.status === "INACTIVE") doc.status = req.body.status;
  if (Array.isArray(req.body.defaultSections)) doc.defaultSections = req.body.defaultSections;
  if (Array.isArray(req.body.allowedSections)) doc.allowedSections = req.body.allowedSections;
  if (Array.isArray(req.body.compatibleTemplates)) doc.compatibleTemplates = req.body.compatibleTemplates;
  await doc.save();
  await writeAudit(actor, "PROFILE_TYPE_UPDATED", { id: doc.id, name: doc.name, type: "ProfileType" });
  return ok(res, { profileType: serialize(doc) });
}

export async function deleteProfileType(req: Request, res: Response) {
  const actor = (req as AuthedRequest).user;
  const doc = await ProfileType.findById(routeParam(req, "id"));
  if (!doc) throw new AppError(404, "Profile type not found", "NOT_FOUND");
  if (doc.isSystem) throw new AppError(400, "System profile types cannot be deleted", "PROTECTED");
  const used = await Profile.countDocuments({ type: doc.slug });
  if (used) throw new AppError(400, "Reassign profiles before deleting this type", "TYPE_IN_USE");
  await writeAudit(actor, "PROFILE_TYPE_DELETED", { id: doc.id, name: doc.name, type: "ProfileType" });
  await doc.deleteOne();
  return ok(res, { deleted: true });
}
