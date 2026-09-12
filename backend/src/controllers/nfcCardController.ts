import type { Request, Response } from "express";
import { NFCCard } from "../models/NFCCard";
import { Profile } from "../models/Profile";
import { createPublicId } from "../utils/publicId";
import { AppError } from "../utils/AppError";
import { created, ok } from "../utils/response";
import { routeParam } from "../utils/params";
import type { AuthedRequest } from "../middleware/auth";
import { writeAudit } from "../services/audit";

function serialize(card: InstanceType<typeof NFCCard>, profile?: { id: string; name: string; publicId: string } | null) {
  return {
    id: card.id,
    cardId: card.cardId,
    name: card.name,
    profileId: profile?.id ?? String(card.profileId),
    profileName: profile?.name ?? "",
    publicId: profile?.publicId ?? "",
    publicUrl: card.publicUrl,
    designId: card.designId ? String(card.designId) : null,
    status: card.status,
    nfcEnabled: card.nfcEnabled,
    qrEnabled: card.qrEnabled,
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
  };
}

export async function ensurePrimaryCard(profile: { id: string; publicId: string }) {
  const existing = await NFCCard.findOne({ profileId: profile.id });
  if (existing) return existing;
  return NFCCard.create({
    cardId: createPublicId(),
    name: "Primary Card",
    profileId: profile.id,
    publicUrl: `/p/${profile.publicId}`,
    status: "ACTIVE",
    nfcEnabled: true,
    qrEnabled: true,
  });
}

export async function listCards(req: Request, res: Response) {
  const profileId = String(req.query.profileId ?? "");
  const status = String(req.query.status ?? "");
  const filter: Record<string, unknown> = {};
  if (profileId) filter.profileId = profileId;
  if (status) filter.status = status;
  const cards = await NFCCard.find(filter).sort({ createdAt: -1 }).populate("profileId", "name publicId");
  return ok(res, {
    cards: cards.map((card) => {
      const profile = card.profileId as unknown as { id?: string; name?: string; publicId?: string } | null;
      return serialize(card, profile?.name ? { id: String(profile.id), name: profile.name, publicId: profile.publicId ?? "" } : null);
    }),
  });
}

export async function createCard(req: Request, res: Response) {
  const actor = (req as AuthedRequest).user;
  const profile = await Profile.findById(req.body.profileId);
  if (!profile) throw new AppError(404, "Profile not found", "NOT_FOUND");
  const card = await NFCCard.create({
    cardId: createPublicId(),
    name: String(req.body.name ?? "NFC Card").trim() || "NFC Card",
    profileId: profile.id,
    publicUrl: `/p/${profile.publicId}`,
    designId: req.body.designId || null,
    status: req.body.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
    nfcEnabled: req.body.nfcEnabled !== false,
    qrEnabled: req.body.qrEnabled !== false,
  });
  await writeAudit(actor, "CARD_CREATED", { id: card.id, name: card.name, type: "NFCCard" });
  return created(res, { card: serialize(card, { id: profile.id, name: profile.name, publicId: profile.publicId }) });
}

export async function getCard(req: Request, res: Response) {
  const card = await NFCCard.findById(routeParam(req, "id")).populate("profileId", "name publicId");
  if (!card) throw new AppError(404, "Card not found", "NOT_FOUND");
  const profile = card.profileId as unknown as { id?: string; name?: string; publicId?: string };
  return ok(res, { card: serialize(card, { id: String(profile.id), name: profile.name ?? "", publicId: profile.publicId ?? "" }) });
}

export async function updateCard(req: Request, res: Response) {
  const actor = (req as AuthedRequest).user;
  const card = await NFCCard.findById(routeParam(req, "id"));
  if (!card) throw new AppError(404, "Card not found", "NOT_FOUND");
  if (typeof req.body.name === "string") card.name = req.body.name.trim();
  if (req.body.status && ["ACTIVE", "INACTIVE", "LOST", "REPLACED"].includes(req.body.status)) card.status = req.body.status;
  if (typeof req.body.nfcEnabled === "boolean") card.nfcEnabled = req.body.nfcEnabled;
  if (typeof req.body.qrEnabled === "boolean") card.qrEnabled = req.body.qrEnabled;
  if (req.body.designId !== undefined) card.designId = req.body.designId || null;
  if (req.body.profileId) {
    const profile = await Profile.findById(req.body.profileId);
    if (!profile) throw new AppError(404, "Profile not found", "NOT_FOUND");
    card.profileId = profile._id;
    card.publicUrl = `/p/${profile.publicId}`;
  }
  await card.save();
  await writeAudit(actor, "CARD_UPDATED", { id: card.id, name: card.name, type: "NFCCard" });
  return ok(res, { card: serialize(card) });
}

export async function deleteCard(req: Request, res: Response) {
  const actor = (req as AuthedRequest).user;
  const card = await NFCCard.findById(routeParam(req, "id"));
  if (!card) throw new AppError(404, "Card not found", "NOT_FOUND");
  await writeAudit(actor, "CARD_DELETED", { id: card.id, name: card.name, type: "NFCCard" });
  await card.deleteOne();
  return ok(res, { deleted: true });
}
