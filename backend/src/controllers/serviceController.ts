import type { Request, Response } from "express";
import { HotelService } from "../models/HotelService";
import { AppError } from "../utils/AppError";
import { created, ok } from "../utils/response";
import { routeParam } from "../utils/params";
import { assertMedia, getProfileOrThrow } from "../services/profileService";
import { typeHasServices } from "../../../shared/profileTypes";

function refId(value: unknown) {
  if (value && typeof value === "object" && "_id" in value) {
    return String((value as { _id: unknown })._id);
  }
  return String(value);
}

function serializeService(service: InstanceType<typeof HotelService>) {
  return {
    id: service.id,
    name: service.name,
    description: service.description,
    icon: service.icon,
    image: service.image ? refId(service.image) : null,
    imageUrl:
      service.image && typeof service.image === "object"
        ? (service.image as { secureUrl?: string; url?: string }).secureUrl ||
          (service.image as { url?: string }).url ||
          null
        : null,
    sortOrder: service.sortOrder,
  };
}

async function hotelProfile(req: Request) {
  const profile = await getProfileOrThrow(routeParam(req, "id"));
  if (!typeHasServices(profile.type)) {
    throw new AppError(400, "This profile type does not have services", "NO_SERVICES");
  }
  return profile;
}

export async function listServices(req: Request, res: Response) {
  const profile = await hotelProfile(req);
  const services = await HotelService.find({ profile: profile._id }).sort({ sortOrder: 1, createdAt: 1 }).populate("image");
  return ok(res, { services: services.map(serializeService) });
}

export async function createService(req: Request, res: Response) {
  const profile = await hotelProfile(req);
  const count = await HotelService.countDocuments({ profile: profile._id });
  const image = await assertMedia(req.body.image);
  const service = await HotelService.create({
    profile: profile._id,
    name: req.body.name,
    description: req.body.description ?? "",
    icon: req.body.icon ?? "sparkles",
    image: image?._id ?? null,
    sortOrder: count,
  });
  await service.populate("image");
  return created(res, { service: serializeService(service) });
}

async function getService(id: string) {
  const service = await HotelService.findById(id);
  if (!service) throw new AppError(404, "Service not found", "SERVICE_NOT_FOUND");
  return service;
}

export async function updateService(req: Request, res: Response) {
  const service = await getService(routeParam(req, "id"));
  const body = req.body as Record<string, unknown>;
  if (typeof body.name === "string") service.name = body.name;
  if (typeof body.description === "string") service.description = body.description;
  if (typeof body.icon === "string") service.icon = body.icon;
  if ("image" in body) service.image = (await assertMedia(body.image as string | null))?._id ?? null;
  await service.save();
  await service.populate("image");
  return ok(res, { service: serializeService(service) });
}

export async function deleteService(req: Request, res: Response) {
  const service = await getService(routeParam(req, "id"));
  await service.deleteOne();
  return ok(res, { deleted: true });
}

export async function reorderServices(req: Request, res: Response) {
  const profile = await hotelProfile(req);
  const ids = req.body.orderedIds as string[];
  await Promise.all(ids.map((id, index) => HotelService.updateOne({ _id: id, profile: profile._id }, { sortOrder: index })));
  return ok(res, { reordered: true });
}

export async function listAllServices(_req: Request, res: Response) {
  const services = await HotelService.find().sort({ createdAt: -1 }).limit(40).populate("profile");
  return ok(res, {
    services: services.map((service) => ({
      ...serializeService(service),
      profileName:
        service.profile && typeof service.profile === "object" && "name" in service.profile
          ? String((service.profile as { name: string }).name)
          : "",
    })),
  });
}
