import type { Request, Response } from "express";
import { PERMISSIONS, type Permission } from "../../../shared/permissions";
import { Role } from "../models/Role";
import { Admin } from "../models/Admin";
import { AppError } from "../utils/AppError";
import { created, ok } from "../utils/response";
import { routeParam } from "../utils/params";
import type { AuthedRequest } from "../middleware/auth";
import { writeAudit } from "../services/audit";

function serializeRole(role: InstanceType<typeof Role>, users = 0) {
  return {
    id: role.id,
    name: role.name,
    slug: role.slug,
    description: role.description,
    permissions: role.permissions,
    status: role.status,
    system: role.system,
    users,
    createdAt: role.createdAt,
  };
}

export async function getRole(req: Request, res: Response) {
  const role = await Role.findById(routeParam(req, "id"));
  if (!role) throw new AppError(404, "Role not found", "ROLE_NOT_FOUND");
  const users = await Admin.countDocuments({ roleId: role._id });
  return ok(res, { role: serializeRole(role, users) });
}

export async function listRoles(_req: Request, res: Response) {
  const roles = await Role.find().sort({ name: 1 });
  const counts = await Admin.aggregate([{ $group: { _id: "$roleId", users: { $sum: 1 } } }]);
  const map = new Map(counts.map((item) => [String(item._id), item.users as number]));
  return ok(res, { roles: roles.map((role) => serializeRole(role, map.get(role.id) ?? 0)) });
}

export async function createRole(req: Request, res: Response) {
  const admin = (req as AuthedRequest).user;
  const slug = String(req.body.slug || req.body.name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
  const existing = await Role.findOne({ slug });
  if (existing) throw new AppError(409, "A role with that name already exists", "ROLE_EXISTS");
  const permissions = ((req.body.permissions as string[]) ?? []).filter((item): item is Permission =>
    (PERMISSIONS as readonly string[]).includes(item),
  );
  const role = await Role.create({
    name: req.body.name,
    slug,
    description: req.body.description ?? "",
    permissions,
    status: "ACTIVE",
  });
  await writeAudit(admin, "ROLE_CREATED", { id: role.id, name: role.name, type: "Role" });
  return created(res, { role: serializeRole(role) });
}

export async function updateRole(req: Request, res: Response) {
  const admin = (req as AuthedRequest).user;
  const role = await Role.findById(routeParam(req, "id"));
  if (!role) throw new AppError(404, "Role not found", "ROLE_NOT_FOUND");
  if (typeof req.body.name === "string") role.name = req.body.name;
  if (typeof req.body.description === "string") role.description = req.body.description;
  if (typeof req.body.status === "string") role.status = req.body.status;
  if (Array.isArray(req.body.permissions) && !role.system) {
    role.permissions = req.body.permissions.filter((item: string): item is Permission =>
      (PERMISSIONS as readonly string[]).includes(item),
    );
  }
  if (Array.isArray(req.body.permissions) && role.system && role.slug !== "super_admin") {
    role.permissions = req.body.permissions.filter((item: string): item is Permission =>
      (PERMISSIONS as readonly string[]).includes(item),
    );
  }
  await role.save();
  await writeAudit(admin, "ROLE_UPDATED", { id: role.id, name: role.name, type: "Role" });
  return ok(res, { role: serializeRole(role) });
}

export async function deleteRole(req: Request, res: Response) {
  const admin = (req as AuthedRequest).user;
  const role = await Role.findById(routeParam(req, "id"));
  if (!role) throw new AppError(404, "Role not found", "ROLE_NOT_FOUND");
  if (role.system) throw new AppError(400, "System roles cannot be deleted", "SYSTEM_ROLE");
  const used = await Admin.countDocuments({ roleId: role._id });
  if (used) throw new AppError(400, "Reassign users before deleting this role", "ROLE_IN_USE");
  await writeAudit(admin, "ROLE_DELETED", { id: role.id, name: role.name, type: "Role" });
  await role.deleteOne();
  return ok(res, { deleted: true });
}
