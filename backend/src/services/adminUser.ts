import { ALL_PERMISSIONS, type Permission } from "../../../shared/permissions";
import { Admin } from "../models/Admin";
import { Role } from "../models/Role";

function namedRef(value: unknown) {
  if (!value || typeof value !== "object" || !("name" in value)) return null;
  const doc = value as { id?: unknown; _id?: unknown; name: unknown };
  return { id: String(doc.id ?? doc._id), name: String(doc.name) };
}

export function serializeAdmin(admin: InstanceType<typeof Admin>, role?: InstanceType<typeof Role> | null) {
  const resolved =
    role ||
    (admin.roleId && typeof admin.roleId === "object" && "slug" in admin.roleId
      ? (admin.roleId as unknown as InstanceType<typeof Role>)
      : null);
  const permissions = (resolved?.slug === "super_admin" ? ALL_PERMISSIONS : (resolved?.permissions ?? [])) as Permission[];
  const county = namedRef(admin.countyId);
  const city = namedRef(admin.cityId);
  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    status: admin.status || "ACTIVE",
    lastLoginAt: admin.lastLoginAt,
    createdAt: admin.createdAt,
    role: resolved ? { id: resolved.id, name: resolved.name, slug: resolved.slug } : null,
    county,
    city,
    permissions,
  };
}
