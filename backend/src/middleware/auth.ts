import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { Admin } from "../models/Admin";
import { Role } from "../models/Role";
import { ALL_PERMISSIONS, type Permission } from "../../../shared/permissions";
import { AppError } from "../utils/AppError";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  status: "ACTIVE" | "INACTIVE";
  role: { id: string; name: string; slug: string } | null;
  permissions: Permission[];
};

export type AuthedRequest = Request & { user: AuthUser };

export function signToken(adminId: string) {
  return jwt.sign({ sub: adminId, role: "admin" }, env.JWT_SECRET, { expiresIn: "7d" });
}

export function setAuthCookie(res: Response, token: string, req?: Request) {
  const proto = req?.get("x-forwarded-proto") || req?.protocol || "";
  res.cookie(env.COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: proto === "https",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(env.COOKIE_NAME, { path: "/" });
}

export function hasPermission(user: AuthUser, permission: Permission) {
  return user.permissions.includes(permission);
}

export async function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[env.COOKIE_NAME] as string | undefined;
    if (!token) throw new AppError(401, "Please sign in", "UNAUTHORIZED");

    const payload = jwt.verify(token, env.JWT_SECRET) as { sub?: string; role?: string };
    if (!payload.sub || payload.role !== "admin") {
      throw new AppError(401, "Please sign in", "UNAUTHORIZED");
    }

    const admin = await Admin.findById(payload.sub).populate("roleId");
    if (!admin) throw new AppError(401, "Please sign in", "UNAUTHORIZED");
    if (admin.status === "INACTIVE") throw new AppError(403, "This account is inactive", "INACTIVE");

    const role = admin.roleId && typeof admin.roleId === "object" && "slug" in admin.roleId
      ? (admin.roleId as unknown as InstanceType<typeof Role>)
      : null;
    const permissions = (role?.slug === "super_admin" ? ALL_PERMISSIONS : (role?.permissions ?? [])) as Permission[];

    (req as AuthedRequest).user = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      status: admin.status,
      role: role ? { id: role.id, name: role.name, slug: role.slug } : null,
      permissions,
    };
    next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    next(new AppError(401, "Please sign in", "UNAUTHORIZED"));
  }
}

export function requirePermission(...needed: Permission[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as AuthedRequest).user;
    if (!user) return next(new AppError(401, "Please sign in", "UNAUTHORIZED"));
    if (needed.some((item) => hasPermission(user, item))) return next();
    next(new AppError(403, "You do not have permission for this action", "FORBIDDEN"));
  };
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[env.COOKIE_NAME] as string | undefined;
  if (!token) return next();
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { sub?: string };
    if (payload.sub) {
      (req as Request & { user?: AuthUser }).user = {
        id: payload.sub,
        name: "",
        email: "",
        status: "ACTIVE",
        role: null,
        permissions: [],
      };
    }
  } catch {
    // ignore
  }
  next();
}
