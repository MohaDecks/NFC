import type { Request, Response } from "express";
import { CARD_PRESET_REGISTRY } from "../../../shared/cardDesign";
import { CardDesign } from "../models/CardDesign";
import { AppError } from "../utils/AppError";
import { created, ok } from "../utils/response";
import { routeParam } from "../utils/params";
import type { AuthedRequest } from "../middleware/auth";
import { writeAudit } from "../services/audit";

function serialize(doc: InstanceType<typeof CardDesign>) {
  return {
    id: doc.id,
    name: doc.name,
    slug: doc.slug,
    description: doc.description,
    status: doc.status,
    preset: doc.preset,
    backgroundColor: doc.backgroundColor,
    primaryColor: doc.primaryColor,
    accentColor: doc.accentColor,
    frontText: doc.frontText,
    backText: doc.backText,
    showLogo: doc.showLogo,
    logoSource: doc.logoSource,
    qrPlacement: doc.qrPlacement,
    isSystem: doc.isSystem,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function seedCardDesigns() {
  for (const preset of Object.values(CARD_PRESET_REGISTRY)) {
    await CardDesign.findOneAndUpdate(
      { slug: preset.id },
      {
        name: preset.name,
        slug: preset.id,
        description: preset.description,
        status: "ACTIVE",
        preset: preset.id,
        ...preset.design,
        isSystem: true,
      },
      { upsert: true },
    );
  }
}

export async function listCardDesigns(_req: Request, res: Response) {
  await seedCardDesigns();
  const designs = await CardDesign.find().sort({ name: 1 });
  return ok(res, { designs: designs.map(serialize) });
}

export async function createCardDesign(req: Request, res: Response) {
  const actor = (req as AuthedRequest).user;
  const name = String(req.body.name ?? "").trim();
  const slug = String(req.body.slug ?? name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  if (!name || !slug) throw new AppError(400, "Name is required", "INVALID");
  const existing = await CardDesign.findOne({ slug });
  if (existing) throw new AppError(409, "That card design already exists", "DESIGN_EXISTS");
  const source = req.body.sourceId ? await CardDesign.findById(req.body.sourceId) : null;
  const doc = await CardDesign.create({
    name,
    slug,
    description: String(req.body.description ?? source?.description ?? ""),
    preset: req.body.preset ?? source?.preset ?? "minimal",
    backgroundColor: req.body.backgroundColor ?? source?.backgroundColor,
    primaryColor: req.body.primaryColor ?? source?.primaryColor,
    accentColor: req.body.accentColor ?? source?.accentColor,
    frontText: req.body.frontText ?? source?.frontText,
    backText: req.body.backText ?? source?.backText,
    showLogo: req.body.showLogo ?? source?.showLogo ?? true,
    logoSource: req.body.logoSource ?? source?.logoSource ?? "brand",
    qrPlacement: req.body.qrPlacement ?? source?.qrPlacement ?? "center",
    isSystem: false,
  });
  await writeAudit(actor, "CARD_DESIGN_CREATED", { id: doc.id, name: doc.name, type: "CardDesign" });
  return created(res, { design: serialize(doc) });
}

export async function updateCardDesign(req: Request, res: Response) {
  const actor = (req as AuthedRequest).user;
  const doc = await CardDesign.findById(routeParam(req, "id"));
  if (!doc) throw new AppError(404, "Card design not found", "NOT_FOUND");
  const fields = [
    "name",
    "description",
    "status",
    "preset",
    "backgroundColor",
    "primaryColor",
    "accentColor",
    "frontText",
    "backText",
    "showLogo",
    "logoSource",
    "qrPlacement",
  ] as const;
  for (const field of fields) {
    if (req.body[field] !== undefined) (doc as unknown as Record<string, unknown>)[field] = req.body[field];
  }
  await doc.save();
  await writeAudit(actor, "CARD_DESIGN_UPDATED", { id: doc.id, name: doc.name, type: "CardDesign" });
  return ok(res, { design: serialize(doc) });
}

export async function deleteCardDesign(req: Request, res: Response) {
  const actor = (req as AuthedRequest).user;
  const doc = await CardDesign.findById(routeParam(req, "id"));
  if (!doc) throw new AppError(404, "Card design not found", "NOT_FOUND");
  if (doc.isSystem) throw new AppError(400, "System card designs cannot be deleted", "PROTECTED");
  await writeAudit(actor, "CARD_DESIGN_DELETED", { id: doc.id, name: doc.name, type: "CardDesign" });
  await doc.deleteOne();
  return ok(res, { deleted: true });
}
