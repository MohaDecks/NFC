import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import { Admin } from "../models/Admin";
import { Role } from "../models/Role";
import { AppError } from "../utils/AppError";
import { created, ok } from "../utils/response";
import type { AuthedRequest } from "../middleware/auth";
import { serializeAdmin } from "../services/adminUser";
import { writeAudit } from "../services/audit";
import { routeParam } from "../utils/params";

export async function listAdmins(_req: Request, res: Response) {
  const admins = await Admin.find().sort({ createdAt: 1 }).populate(["roleId", "countyId", "cityId"]);
  return ok(res, { admins: admins.map((admin) => serializeAdmin(admin)) });
}

export async function getAdmin(req: Request, res: Response) {
  const admin = await Admin.findById(routeParam(req, "id")).populate(["roleId", "countyId", "cityId"]);
  if (!admin) throw new AppError(404, "Admin not found", "NOT_FOUND");
  return ok(res, { admin: serializeAdmin(admin) });
}

export async function createAdmin(req: Request, res: Response) {
  const actor = (req as AuthedRequest).user;
  const existing = await Admin.findOne({ email: req.body.email });
  if (existing) throw new AppError(409, "That email is already in use", "EMAIL_TAKEN");
  const role = req.body.roleId ? await Role.findById(req.body.roleId) : await Role.findOne({ slug: "editor" });
  const passwordHash = await bcrypt.hash(req.body.password, 12);
  const admin = await Admin.create({
    name: req.body.name,
    email: req.body.email,
    passwordHash,
    roleId: role?._id,
    countyId: req.body.countyId || null,
    cityId: req.body.cityId || null,
    status: "ACTIVE",
  });
  await admin.populate(["roleId", "countyId", "cityId"]);
  await writeAudit(actor, "USER_CREATED", { id: admin.id, name: admin.name, type: "Admin" });
  return created(res, { admin: serializeAdmin(admin) });
}

export async function updateAdmin(req: Request, res: Response) {
  const actor = (req as AuthedRequest).user;
  const admin = await Admin.findById(routeParam(req, "id"));
  if (!admin) throw new AppError(404, "Admin not found", "NOT_FOUND");
  if (typeof req.body.name === "string") admin.name = req.body.name;
  if (typeof req.body.email === "string" && req.body.email !== admin.email) {
    const taken = await Admin.findOne({ email: req.body.email });
    if (taken) throw new AppError(409, "That email is already in use", "EMAIL_TAKEN");
    admin.email = req.body.email;
  }
  if (req.body.roleId) admin.roleId = req.body.roleId;
  if (req.body.countyId === null || req.body.countyId === "") admin.countyId = null;
  else if (req.body.countyId) admin.countyId = req.body.countyId;
  if (req.body.cityId === null || req.body.cityId === "") admin.cityId = null;
  else if (req.body.cityId) admin.cityId = req.body.cityId;
  if (req.body.status === "ACTIVE" || req.body.status === "INACTIVE") admin.status = req.body.status;
  if (typeof req.body.password === "string" && req.body.password.length >= 8) {
    admin.passwordHash = await bcrypt.hash(req.body.password, 12);
  }
  await admin.save();
  await admin.populate(["roleId", "countyId", "cityId"]);
  await writeAudit(actor, "USER_UPDATED", { id: admin.id, name: admin.name, type: "Admin" });
  return ok(res, { admin: serializeAdmin(admin) });
}

export async function deleteAdmin(req: Request, res: Response) {
  const actor = (req as AuthedRequest).user;
  const id = routeParam(req, "id");
  if (actor.id === id) throw new AppError(400, "You cannot delete your own account", "SELF_DELETE");
  const admin = await Admin.findById(id);
  if (!admin) throw new AppError(404, "Admin not found", "NOT_FOUND");
  await writeAudit(actor, "USER_DELETED", { id: admin.id, name: admin.name, type: "Admin" });
  await admin.deleteOne();
  return ok(res, { deleted: true });
}

export async function updateMe(req: Request, res: Response) {
  const { user } = req as AuthedRequest;
  const admin = await Admin.findById(user.id);
  if (!admin) throw new AppError(404, "Admin not found", "NOT_FOUND");
  if (req.body.name) admin.name = req.body.name;
  if (req.body.email && req.body.email !== admin.email) {
    const taken = await Admin.findOne({ email: req.body.email });
    if (taken) throw new AppError(409, "That email is already in use", "EMAIL_TAKEN");
    admin.email = req.body.email;
  }
  await admin.save();
  await admin.populate("roleId");
  return ok(res, { admin: serializeAdmin(admin) });
}

export async function changePassword(req: Request, res: Response) {
  const { user } = req as AuthedRequest;
  const admin = await Admin.findById(user.id).select("+passwordHash");
  if (!admin) throw new AppError(404, "Admin not found", "NOT_FOUND");
  const match = await bcrypt.compare(req.body.currentPassword, admin.passwordHash);
  if (!match) throw new AppError(400, "Current password is incorrect", "INVALID_PASSWORD");
  admin.passwordHash = await bcrypt.hash(req.body.newPassword, 12);
  await admin.save();
  return ok(res, { updated: true });
}
