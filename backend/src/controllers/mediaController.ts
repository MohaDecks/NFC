import path from "node:path";
import { nanoid } from "nanoid";
import type { Request, Response } from "express";
import { Media } from "../models/Media";
import { Profile } from "../models/Profile";
import { AppError } from "../utils/AppError";
import { created, ok } from "../utils/response";
import type { AuthedRequest } from "../middleware/auth";
import { storage } from "../services/storage";
import { routeParam } from "../utils/params";

const kinds = new Set(["avatar", "logo", "cover", "gallery", "menu", "service", "profile", "room"]);

function serializeMedia(media: InstanceType<typeof Media>) {
  return {
    id: media.id,
    url: media.secureUrl || media.url,
    secureUrl: media.secureUrl || media.url,
    publicId: media.publicId,
    resourceType: media.resourceType,
    width: media.width,
    height: media.height,
    provider: media.provider,
    kind: media.kind,
    originalName: media.originalName,
    mimeType: media.mimeType,
    size: media.size,
    profileId:
      media.profile && typeof media.profile === "object" && "_id" in media.profile
        ? String((media.profile as { _id: unknown })._id)
        : media.profile
          ? String(media.profile)
          : null,
    createdAt: media.createdAt,
  };
}

export async function uploadMedia(req: Request, res: Response) {
  const { user } = req as AuthedRequest;
  const file = req.file;
  if (!file) throw new AppError(400, "Choose an image to upload", "NO_FILE");

  const kind = kinds.has(String(req.body.kind))
    ? (String(req.body.kind) as "avatar" | "logo" | "cover" | "gallery" | "menu" | "service" | "profile" | "room")
    : "gallery";
  const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
  const safeExt = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".heic", ".heif", ".avif"].includes(ext)
    ? ext
    : ".jpg";
  const filename = `${nanoid(16)}${safeExt}`;
  const stored = await storage.save(filename, file.buffer);

  const media = await Media.create({
    uploadedBy: user.id,
    profile: req.body.profileId || null,
    filename: stored.filename,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    url: stored.url,
    secureUrl: stored.secureUrl,
    publicId: stored.publicId,
    resourceType: stored.resourceType,
    width: stored.width,
    height: stored.height,
    provider: stored.provider,
    kind,
  });

  return created(res, { media: serializeMedia(media) });
}

export async function listMedia(req: Request, res: Response) {
  const query: Record<string, unknown> = {};
  const kind = String(req.query.kind ?? "");
  if (kind === "profile") query.kind = { $in: ["avatar", "logo", "cover", "profile"] };
  else if (kind) query.kind = kind;
  if (req.query.profileId) query.profile = req.query.profileId;
  const media = await Media.find(query).sort({ createdAt: -1 }).limit(80).populate("profile", "name");
  return ok(res, {
    media: media.map((item) => ({
      ...serializeMedia(item),
      profileName:
        item.profile && typeof item.profile === "object" && "name" in item.profile
          ? String((item.profile as { name?: string }).name ?? "")
          : "",
    })),
  });
}

export async function deleteMedia(req: Request, res: Response) {
  const media = await Media.findById(routeParam(req, "id"));
  if (!media) throw new AppError(404, "Image not found", "MEDIA_NOT_FOUND");

  await Profile.updateMany({}, { $pull: { gallery: media._id } });
  await Profile.updateMany({ avatar: media._id }, { $set: { avatar: null } });
  await Profile.updateMany({ logo: media._id }, { $set: { logo: null } });
  await Profile.updateMany({ cover: media._id }, { $set: { cover: null } });
  await storage.delete(media);
  await media.deleteOne();
  return ok(res, { deleted: true });
}
