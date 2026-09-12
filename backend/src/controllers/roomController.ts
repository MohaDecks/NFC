import type { Request, Response } from "express";
import { HotelRoom } from "../models/HotelRoom";
import { AppError } from "../utils/AppError";
import { created, ok } from "../utils/response";
import { routeParam } from "../utils/params";
import type { AuthedRequest } from "../middleware/auth";
import { assertMedia, getProfileOrThrow } from "../services/profileService";
import { writeAudit } from "../services/audit";

function imageUrl(image: unknown) {
  if (image && typeof image === "object") {
    const doc = image as { secureUrl?: string; url?: string };
    return doc.secureUrl || doc.url || null;
  }
  return null;
}

function serializeRoom(room: InstanceType<typeof HotelRoom>) {
  return {
    id: room.id,
    name: room.name,
    roomType: room.roomType || "double",
    description: room.description,
    price: room.price,
    currency: room.currency,
    capacity: room.capacity,
    beds: room.beds || 1,
    amenities: room.amenities,
    available: room.available,
    sortOrder: room.sortOrder,
    images: (room.images ?? []).map((item) => String((item as { _id?: unknown })._id ?? item)),
    imageUrls: (room.images ?? []).map((item) => imageUrl(item)).filter((url): url is string => Boolean(url)),
  };
}

export async function listAllRooms(_req: Request, res: Response) {
  const rooms = await HotelRoom.find().sort({ createdAt: -1 }).limit(80).populate(["profile", "images"]);
  return ok(res, {
    rooms: rooms.map((room) => ({
      ...serializeRoom(room),
      profileId:
        room.profile && typeof room.profile === "object" && "_id" in room.profile
          ? String((room.profile as { _id: unknown })._id)
          : String(room.profile ?? ""),
      profileName:
        room.profile && typeof room.profile === "object" && "name" in room.profile
          ? String((room.profile as { name: string }).name)
          : "",
    })),
  });
}

export async function listRooms(req: Request, res: Response) {
  const profile = await getProfileOrThrow(routeParam(req, "id"));
  const rooms = await HotelRoom.find({ profile: profile._id }).sort({ sortOrder: 1, createdAt: 1 }).populate("images");
  return ok(res, { rooms: rooms.map(serializeRoom) });
}

export async function createRoom(req: Request, res: Response) {
  const admin = (req as AuthedRequest).user;
  const profile = await getProfileOrThrow(routeParam(req, "id"));
  const count = await HotelRoom.countDocuments({ profile: profile._id });
  const images = [];
  for (const id of (req.body.images as string[] | undefined) ?? []) {
    const media = await assertMedia(id);
    if (media) images.push(media._id);
  }
  const room = await HotelRoom.create({
    profile: profile._id,
    name: req.body.name,
    roomType: req.body.roomType ?? "double",
    description: req.body.description ?? "",
    price: req.body.price ?? 0,
    currency: req.body.currency ?? "ETB",
    capacity: req.body.capacity ?? 2,
    beds: req.body.beds ?? 1,
    amenities: req.body.amenities ?? [],
    available: req.body.available ?? true,
    images,
    sortOrder: count,
  });
  await writeAudit(admin, "ROOM_CREATED", { id: profile.id, name: `${profile.name} / ${room.name}` });
  return created(res, { room: serializeRoom(room) });
}

export async function updateRoom(req: Request, res: Response) {
  const admin = (req as AuthedRequest).user;
  const room = await HotelRoom.findById(routeParam(req, "id"));
  if (!room) throw new AppError(404, "Room not found", "ROOM_NOT_FOUND");
  if (typeof req.body.name === "string") room.name = req.body.name;
  if (typeof req.body.roomType === "string") room.roomType = req.body.roomType;
  if (typeof req.body.description === "string") room.description = req.body.description;
  if (typeof req.body.price === "number") room.price = req.body.price;
  if (typeof req.body.currency === "string") room.currency = req.body.currency;
  if (typeof req.body.capacity === "number") room.capacity = req.body.capacity;
  if (typeof req.body.beds === "number") room.beds = req.body.beds;
  if (typeof req.body.available === "boolean") room.available = req.body.available;
  if (Array.isArray(req.body.amenities)) room.amenities = req.body.amenities;
  if (Array.isArray(req.body.images)) {
    const images = [];
    for (const id of req.body.images as string[]) {
      const media = await assertMedia(id);
      if (media) images.push(media._id);
    }
    room.images = images;
  }
  await room.save();
  await room.populate("images");
  await writeAudit(admin, "ROOM_UPDATED", { id: String(room.profile), name: room.name });
  return ok(res, { room: serializeRoom(room) });
}

export async function deleteRoom(req: Request, res: Response) {
  const admin = (req as AuthedRequest).user;
  const room = await HotelRoom.findById(routeParam(req, "id"));
  if (!room) throw new AppError(404, "Room not found", "ROOM_NOT_FOUND");
  await writeAudit(admin, "ROOM_DELETED", { id: String(room.profile), name: room.name });
  await room.deleteOne();
  return ok(res, { deleted: true });
}
