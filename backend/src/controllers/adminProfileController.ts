import type { Request, Response } from "express";
import {
  BUSINESS_KIND_TYPES,
  defaultDesignForType,
  defaultOpeningHours,
  isProfileType,
  PROFILE_STATUS,
  TEMPLATE_REGISTRY,
} from "../../../shared/profileTypes";
import { defaultCardDesignForType } from "../../../shared/cardDesign";
import { Profile } from "../models/Profile";
import { MenuCategory } from "../models/MenuCategory";
import { MenuItem } from "../models/MenuItem";
import { HotelService } from "../models/HotelService";
import { HotelRoom } from "../models/HotelRoom";
import { ProfileSection } from "../models/ProfileSection";
import { createPublicId } from "../utils/publicId";
import { AppError } from "../utils/AppError";
import { created, ok } from "../utils/response";
import type { AuthedRequest } from "../middleware/auth";
import {
  assertMedia,
  getProfileOrThrow,
  loadAdminProfile,
  resolveTemplate,
  serializeProfile,
} from "../services/profileService";
import { writeAudit } from "../services/audit";
import { routeParam } from "../utils/params";

export async function listProfiles(req: Request, res: Response) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
  const search = String(req.query.search ?? "").trim();
  const type = String(req.query.type ?? "");
  const status = String(req.query.status ?? "");
  const verified = String(req.query.verified ?? "");
  const from = String(req.query.from ?? "");
  const to = String(req.query.to ?? "");
  const kind = String(req.query.kind ?? "");

  const filter: Record<string, unknown> = {};
  if (type) filter.type = type;
  if (PROFILE_STATUS.includes(status as (typeof PROFILE_STATUS)[number])) filter.status = status;
  if (verified === "true") filter.isVerified = true;
  if (verified === "false") filter.isVerified = false;
  if (kind === "customer") filter.type = "PERSONAL";
  if (kind === "business") filter.type = { $in: BUSINESS_KIND_TYPES };
  if (from || to) {
    filter.createdAt = {
      ...(from ? { $gte: new Date(from) } : {}),
      ...(to ? { $lte: new Date(`${to}T23:59:59`) } : {}),
    };
  }
  if (search) {
    const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ name: rx }, { ownerName: rx }, { publicId: rx }, { "contact.phone": rx }, { ownerPhone: rx }];
  }

  const [profiles, total] = await Promise.all([
    Profile.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate(["avatar", "logo", "cover", "verifiedBy"]),
    Profile.countDocuments(filter),
  ]);

  return ok(res, {
    profiles: profiles.map(serializeProfile),
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  });
}

export async function createProfile(req: Request, res: Response) {
  const admin = (req as AuthedRequest).user;
  const body = req.body as {
    type: string;
    name: string;
    ownerName?: string;
    ownerEmail?: string;
    ownerPhone?: string;
  };

  const profile = await Profile.create({
    createdBy: admin.id,
    type: body.type,
    name: body.name,
    ownerName: body.ownerName || body.name,
    ownerEmail: body.ownerEmail || "",
    ownerPhone: body.ownerPhone || "",
    publicId: createPublicId(),
    status: "INACTIVE",
    publishState: "DRAFT",
    openingHours: defaultOpeningHours(),
    design: defaultDesignForType(body.type),
    cardDesign: defaultCardDesignForType(body.type),
  });

  const { ensureSections } = await import("../services/sectionService");
  const { ensurePrimaryCard } = await import("./nfcCardController");
  const sections = await ensureSections(profile);
  await ensurePrimaryCard({ id: profile.id, publicId: profile.publicId });
  await writeAudit(admin, "PROFILE_CREATED", { id: profile.id, name: profile.name });
  return created(res, { profile: { ...serializeProfile(profile), sections } });
}

export async function getProfile(req: Request, res: Response) {
  const profile = await loadAdminProfile(routeParam(req, "id"));
  const { ensureSections } = await import("../services/sectionService");
  const doc = await getProfileOrThrow(routeParam(req, "id"));
  const sections = await ensureSections(doc);
  return ok(res, { profile: { ...profile, sections } });
}

export async function updateProfile(req: Request, res: Response) {
  const admin = (req as AuthedRequest).user;
  const profile = await getProfileOrThrow(routeParam(req, "id"));
  const body = req.body as Record<string, unknown>;

  if (typeof body.name === "string") profile.name = body.name;
  if (typeof body.tagline === "string") profile.tagline = body.tagline;
  if (typeof body.description === "string") profile.description = body.description;
  if (typeof body.ownerName === "string") profile.ownerName = body.ownerName;
  if (typeof body.ownerEmail === "string") profile.ownerEmail = body.ownerEmail;
  if (typeof body.ownerPhone === "string") profile.ownerPhone = body.ownerPhone;
  if (body.contact && typeof body.contact === "object") {
    profile.set("contact", { ...profile.contact, ...(body.contact as object) });
  }
  if (body.location && typeof body.location === "object") {
    profile.set("location", { ...profile.location, ...(body.location as object) });
  }
  if (body.cardDesign && typeof body.cardDesign === "object") {
    profile.set("cardDesign", { ...profile.cardDesign, ...(body.cardDesign as object) });
  }
  if (Array.isArray(body.openingHours)) profile.set("openingHours", body.openingHours);
  if (Array.isArray(body.amenities)) profile.amenities = body.amenities as string[];
  if (Array.isArray(body.socialLinks)) profile.set("socialLinks", body.socialLinks);
  if ("avatar" in body) profile.avatar = (await assertMedia(body.avatar as string | null))?._id ?? null;
  if ("logo" in body) profile.logo = (await assertMedia(body.logo as string | null))?._id ?? null;
  if ("cover" in body) profile.cover = (await assertMedia(body.cover as string | null))?._id ?? null;
  if (Array.isArray(body.gallery)) {
    const ids = [];
    for (const id of body.gallery as string[]) {
      const media = await assertMedia(id);
      if (media) ids.push(media._id);
    }
    profile.gallery = ids;
  }

  await profile.save();
  await profile.populate(["avatar", "logo", "cover", "gallery", "verifiedBy"]);
  await writeAudit(admin, "PROFILE_UPDATED", { id: profile.id, name: profile.name });
  return ok(res, { profile: serializeProfile(profile) });
}

export async function deleteProfile(req: Request, res: Response) {
  const admin = (req as AuthedRequest).user;
  const profile = await getProfileOrThrow(routeParam(req, "id"));
  await Promise.all([
    MenuItem.deleteMany({ profile: profile._id }),
    MenuCategory.deleteMany({ profile: profile._id }),
    HotelService.deleteMany({ profile: profile._id }),
    HotelRoom.deleteMany({ profile: profile._id }),
    ProfileSection.deleteMany({ profile: profile._id }),
  ]);
  await writeAudit(admin, "PROFILE_DELETED", { id: profile.id, name: profile.name });
  await profile.deleteOne();
  return ok(res, { deleted: true });
}

async function setStatus(req: Request, res: Response, status: "ACTIVE" | "INACTIVE" | "BLOCKED", action: string) {
  const admin = (req as AuthedRequest).user;
  const profile = await getProfileOrThrow(routeParam(req, "id"));
  profile.status = status;
  if (status === "ACTIVE") profile.publishedAt = new Date();
  await profile.save();
  await profile.populate(["avatar", "logo", "cover", "gallery", "verifiedBy"]);
  await writeAudit(admin, action, { id: profile.id, name: profile.name });
  return ok(res, { profile: serializeProfile(profile) });
}

export async function activateProfile(req: Request, res: Response) {
  return setStatus(req, res, "ACTIVE", "PROFILE_ACTIVATED");
}
export async function deactivateProfile(req: Request, res: Response) {
  return setStatus(req, res, "INACTIVE", "PROFILE_DEACTIVATED");
}
export async function blockProfile(req: Request, res: Response) {
  return setStatus(req, res, "BLOCKED", "PROFILE_BLOCKED");
}
export async function unblockProfile(req: Request, res: Response) {
  return setStatus(req, res, "INACTIVE", "PROFILE_UNBLOCKED");
}

export async function publishProfile(req: Request, res: Response) {
  const admin = (req as AuthedRequest).user;
  const profile = await getProfileOrThrow(routeParam(req, "id"));
  profile.publishState = "PUBLISHED";
  profile.status = "ACTIVE";
  profile.publishedAt = new Date();
  await profile.save();
  await profile.populate(["avatar", "logo", "cover", "gallery", "verifiedBy"]);
  await writeAudit(admin, "PROFILE_PUBLISHED", { id: profile.id, name: profile.name });
  return ok(res, { profile: serializeProfile(profile) });
}

export async function unpublishProfile(req: Request, res: Response) {
  const admin = (req as AuthedRequest).user;
  const profile = await getProfileOrThrow(routeParam(req, "id"));
  profile.publishState = "DRAFT";
  await profile.save();
  await profile.populate(["avatar", "logo", "cover", "gallery", "verifiedBy"]);
  await writeAudit(admin, "PROFILE_UNPUBLISHED", { id: profile.id, name: profile.name });
  return ok(res, { profile: serializeProfile(profile) });
}

export async function verifyProfile(req: Request, res: Response) {
  const admin = (req as AuthedRequest).user;
  const profile = await getProfileOrThrow(routeParam(req, "id"));
  profile.isVerified = true;
  profile.verifiedAt = new Date();
  profile.verifiedBy = admin.id as never;
  await profile.save();
  await profile.populate(["avatar", "logo", "cover", "gallery", "verifiedBy"]);
  await writeAudit(admin, "PROFILE_VERIFIED", { id: profile.id, name: profile.name });
  return ok(res, { profile: serializeProfile(profile) });
}

export async function unverifyProfile(req: Request, res: Response) {
  const admin = (req as AuthedRequest).user;
  const profile = await getProfileOrThrow(routeParam(req, "id"));
  profile.isVerified = false;
  profile.verifiedAt = null;
  profile.verifiedBy = null;
  await profile.save();
  await profile.populate(["avatar", "logo", "cover", "gallery"]);
  await writeAudit(admin, "PROFILE_UNVERIFIED", { id: profile.id, name: profile.name });
  return ok(res, { profile: serializeProfile(profile) });
}

export async function updateDesign(req: Request, res: Response) {
  const admin = (req as AuthedRequest).user;
  const profile = await getProfileOrThrow(routeParam(req, "id"));
  const next = {
    template: profile.design.template,
    primaryColor: profile.design.primaryColor,
    secondaryColor: profile.design.secondaryColor,
    accentColor: profile.design.accentColor,
    font: profile.design.font,
    buttonStyle: profile.design.buttonStyle,
    borderRadius: profile.design.borderRadius,
    coverStyle: profile.design.coverStyle,
    ...req.body,
  };

  if (next.template) {
    const meta = TEMPLATE_REGISTRY[next.template as keyof typeof TEMPLATE_REGISTRY];
    if (isProfileType(profile.type) && !meta?.compatibleTypes.includes(profile.type)) {
      throw new AppError(400, "This template is not available for this profile type", "TEMPLATE_INCOMPATIBLE");
    }
    next.template = resolveTemplate(profile.type, next.template);
  }

  profile.set("design", next);
  await profile.save();
  await profile.populate(["avatar", "logo", "cover", "gallery", "verifiedBy"]);
  await writeAudit(admin, "DESIGN_UPDATED", { id: profile.id, name: profile.name });
  return ok(res, { profile: serializeProfile(profile) });
}
