import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Request, Response } from "express";
import { ApplicationBranding } from "../models/ApplicationBranding";
import { storage } from "../services/storage";
import { ok } from "../utils/response";
import type { AuthedRequest } from "../middleware/auth";
import { writeAudit } from "../services/audit";
import { AppError } from "../utils/AppError";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE_LOGO = path.resolve(__dirname, "../../assets/branding/mubarek-logo-source.png");
const FALLBACK_LOGO = "/branding/mubarek-logo-source.png";
const FALLBACK_MARK = "/branding/mubarek-mark.svg";

function serializeBranding(doc: InstanceType<typeof ApplicationBranding>) {
  const logoUrl = doc.logo?.secureUrl || FALLBACK_LOGO;
  const faviconUrl = doc.favicon?.secureUrl || FALLBACK_MARK;
  return {
    id: doc.id,
    name: doc.name,
    tagline: doc.tagline,
    primaryColor: doc.primaryColor,
    secondaryColor: doc.secondaryColor,
    isActive: doc.isActive,
    logo: doc.logo,
    favicon: doc.favicon,
    logoUrl,
    faviconUrl,
    updatedAt: doc.updatedAt,
  };
}

export async function getOrCreateBranding() {
  let branding = await ApplicationBranding.findOne({ isActive: true });
  if (!branding) branding = await ApplicationBranding.create({});
  if (!branding.logo?.secureUrl) {
    try {
      const buffer = await fs.readFile(SOURCE_LOGO);
      const stored = await storage.save("mubarek-logo-source.png", buffer);
      branding.logo = {
        publicId: stored.publicId,
        secureUrl: stored.secureUrl,
        width: stored.width,
        height: stored.height,
        resourceType: stored.resourceType,
        provider: stored.provider,
        filename: stored.filename,
      };
      branding.favicon = {
        publicId: "",
        secureUrl: FALLBACK_MARK,
        width: 80,
        height: 80,
        resourceType: "image",
        provider: "local",
        filename: "mubarek-mark.svg",
      };
      await branding.save();
    } catch {
      branding.logo = {
        publicId: "mubarek-logo-source",
        secureUrl: FALLBACK_LOGO,
        width: 0,
        height: 0,
        resourceType: "image",
        provider: "local",
        filename: "mubarek-logo-source.png",
      };
      await branding.save();
    }
  }
  return branding;
}

export async function getPublicBranding(_req: Request, res: Response) {
  const branding = await getOrCreateBranding();
  return ok(res, { branding: serializeBranding(branding) });
}

export async function getBranding(_req: Request, res: Response) {
  const branding = await getOrCreateBranding();
  return ok(res, { branding: serializeBranding(branding) });
}

export async function updateBranding(req: Request, res: Response) {
  const actor = (req as AuthedRequest).user;
  const branding = await getOrCreateBranding();
  if (typeof req.body.name === "string") branding.name = req.body.name.trim() || branding.name;
  if (typeof req.body.tagline === "string") branding.tagline = req.body.tagline;
  if (typeof req.body.primaryColor === "string") branding.primaryColor = req.body.primaryColor;
  if (typeof req.body.secondaryColor === "string") branding.secondaryColor = req.body.secondaryColor;
  await branding.save();
  await writeAudit(actor, "BRANDING_UPDATED", { id: branding.id, name: branding.name, type: "ApplicationBranding" });
  return ok(res, { branding: serializeBranding(branding) });
}

export async function uploadBrandingLogo(req: Request, res: Response) {
  const actor = (req as AuthedRequest).user;
  const file = req.file;
  if (!file) throw new AppError(400, "Choose a logo image", "NO_FILE");
  const branding = await getOrCreateBranding();
  if (branding.logo?.publicId) await storage.delete(branding.logo);
  const stored = await storage.save(`brand-logo-${Date.now()}-${file.originalname}`, file.buffer);
  branding.logo = {
    publicId: stored.publicId,
    secureUrl: stored.secureUrl,
    width: stored.width,
    height: stored.height,
    resourceType: stored.resourceType,
    provider: stored.provider,
    filename: stored.filename,
  };
  await branding.save();
  await writeAudit(actor, "LOGO_UPDATED", { id: branding.id, name: branding.name, type: "ApplicationBranding" });
  return ok(res, { branding: serializeBranding(branding) });
}

export async function removeBrandingLogo(req: Request, res: Response) {
  const actor = (req as AuthedRequest).user;
  const branding = await getOrCreateBranding();
  if (branding.logo?.publicId) await storage.delete(branding.logo);
  branding.logo = {
    publicId: "mubarek-logo-source",
    secureUrl: FALLBACK_LOGO,
    width: 0,
    height: 0,
    resourceType: "image",
    provider: "local",
    filename: "mubarek-logo-source.png",
  };
  await branding.save();
  await writeAudit(actor, "LOGO_REMOVED", { id: branding.id, name: branding.name, type: "ApplicationBranding" });
  return ok(res, { branding: serializeBranding(branding) });
}
