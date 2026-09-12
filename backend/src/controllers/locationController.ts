import type { Request, Response } from "express";
import { County } from "../models/County";
import { City } from "../models/City";
import { Admin } from "../models/Admin";
import { AppError } from "../utils/AppError";
import { created, ok } from "../utils/response";
import { routeParam } from "../utils/params";
import type { AuthedRequest } from "../middleware/auth";
import { writeAudit } from "../services/audit";

function serializeCounty(county: InstanceType<typeof County>, cities = 0) {
  return {
    id: county.id,
    name: county.name,
    code: county.code || "",
    isoCode: county.isoCode || "",
    flag: county.flag || "",
    status: county.status,
    cities,
    createdAt: county.createdAt,
  };
}

function serializeCity(city: InstanceType<typeof City>) {
  const value = city.countyId as unknown;
  const county =
    value && typeof value === "object" && "name" in value
      ? { id: String((value as { id?: unknown; _id?: unknown }).id ?? (value as { _id?: unknown })._id), name: String((value as { name: unknown }).name) }
      : null;
  return {
    id: city.id,
    name: city.name,
    status: city.status,
    countyId: county?.id ?? String(city.countyId),
    county,
    createdAt: city.createdAt,
  };
}

export async function listCounties(_req: Request, res: Response) {
  const counties = await County.find().sort({ name: 1 });
  const counts = await City.aggregate([{ $group: { _id: "$countyId", cities: { $sum: 1 } } }]);
  const map = new Map(counts.map((item) => [String(item._id), item.cities as number]));
  const rows = counties.map((county) => serializeCounty(county, map.get(county.id) ?? 0));
  return ok(res, { counties: rows, countries: rows });
}

export async function createCounty(req: Request, res: Response) {
  const actor = (req as AuthedRequest).user;
  const name = String(req.body.name ?? "").trim();
  const existing = await County.findOne({ name: new RegExp(`^${name}$`, "i") });
  if (existing) throw new AppError(409, "That county already exists", "COUNTY_EXISTS");
  const county = await County.create({
    name,
    code: String(req.body.code ?? "").trim().toUpperCase(),
    isoCode: String(req.body.isoCode ?? "").trim().toUpperCase(),
    flag: String(req.body.flag ?? "").trim(),
    status: req.body.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
  });
  await writeAudit(actor, "COUNTY_CREATED", { id: county.id, name: county.name, type: "County" });
  return created(res, { county: serializeCounty(county) });
}

export async function updateCounty(req: Request, res: Response) {
  const actor = (req as AuthedRequest).user;
  const county = await County.findById(routeParam(req, "id"));
  if (!county) throw new AppError(404, "County not found", "NOT_FOUND");
  if (typeof req.body.name === "string") county.name = req.body.name.trim();
  if (typeof req.body.code === "string") county.code = req.body.code.trim().toUpperCase();
  if (typeof req.body.isoCode === "string") county.isoCode = req.body.isoCode.trim().toUpperCase();
  if (typeof req.body.flag === "string") county.flag = req.body.flag.trim();
  if (req.body.status === "ACTIVE" || req.body.status === "INACTIVE") county.status = req.body.status;
  await county.save();
  await writeAudit(actor, "COUNTY_UPDATED", { id: county.id, name: county.name, type: "County" });
  return ok(res, { county: serializeCounty(county) });
}

export async function deleteCounty(req: Request, res: Response) {
  const actor = (req as AuthedRequest).user;
  const county = await County.findById(routeParam(req, "id"));
  if (!county) throw new AppError(404, "County not found", "NOT_FOUND");
  const cities = await City.countDocuments({ countyId: county._id });
  if (cities) throw new AppError(400, "Remove cities in this county first", "COUNTY_IN_USE");
  const used = await Admin.countDocuments({ countyId: county._id });
  if (used) throw new AppError(400, "Reassign users before deleting this county", "COUNTY_IN_USE");
  await writeAudit(actor, "COUNTY_DELETED", { id: county.id, name: county.name, type: "County" });
  await county.deleteOne();
  return ok(res, { deleted: true });
}

export async function listCities(req: Request, res: Response) {
  const countryId = String(req.query.countyId ?? req.query.countryId ?? req.params.countryId ?? "");
  const filter = countryId ? { countyId: countryId } : {};
  const cities = await City.find(filter).sort({ name: 1 }).populate("countyId");
  return ok(res, { cities: cities.map(serializeCity) });
}

export async function createCity(req: Request, res: Response) {
  const actor = (req as AuthedRequest).user;
  const county = await County.findById(req.body.countyId);
  if (!county) throw new AppError(400, "Choose a valid county", "INVALID_COUNTY");
  const name = String(req.body.name ?? "").trim();
  const existing = await City.findOne({ countyId: county._id, name: new RegExp(`^${name}$`, "i") });
  if (existing) throw new AppError(409, "That city already exists in this county", "CITY_EXISTS");
  const city = await City.create({
    name,
    countyId: county._id,
    status: req.body.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
  });
  await city.populate("countyId");
  await writeAudit(actor, "CITY_CREATED", { id: city.id, name: city.name, type: "City" });
  return created(res, { city: serializeCity(city) });
}

export async function updateCity(req: Request, res: Response) {
  const actor = (req as AuthedRequest).user;
  const city = await City.findById(routeParam(req, "id"));
  if (!city) throw new AppError(404, "City not found", "NOT_FOUND");
  if (typeof req.body.name === "string") city.name = req.body.name.trim();
  if (req.body.countyId) {
    const county = await County.findById(req.body.countyId);
    if (!county) throw new AppError(400, "Choose a valid county", "INVALID_COUNTY");
    city.countyId = county._id;
  }
  if (req.body.status === "ACTIVE" || req.body.status === "INACTIVE") city.status = req.body.status;
  await city.save();
  await city.populate("countyId");
  await writeAudit(actor, "CITY_UPDATED", { id: city.id, name: city.name, type: "City" });
  return ok(res, { city: serializeCity(city) });
}

export async function deleteCity(req: Request, res: Response) {
  const actor = (req as AuthedRequest).user;
  const city = await City.findById(routeParam(req, "id"));
  if (!city) throw new AppError(404, "City not found", "NOT_FOUND");
  const used = await Admin.countDocuments({ cityId: city._id });
  if (used) throw new AppError(400, "Reassign users before deleting this city", "CITY_IN_USE");
  await writeAudit(actor, "CITY_DELETED", { id: city.id, name: city.name, type: "City" });
  await city.deleteOne();
  return ok(res, { deleted: true });
}
