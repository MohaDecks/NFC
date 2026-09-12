import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import { Admin } from "../models/Admin";
import { clearAuthCookie, setAuthCookie, signToken, type AuthedRequest } from "../middleware/auth";
import { AppError } from "../utils/AppError";
import { ok } from "../utils/response";
import { serializeAdmin } from "../services/adminUser";

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as { email: string; password: string };
  const admin = await Admin.findOne({ email }).select("+passwordHash");
  if (!admin) throw new AppError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  if (admin.status === "INACTIVE") throw new AppError(403, "This account is inactive", "INACTIVE");

  const match = await bcrypt.compare(password, admin.passwordHash);
  if (!match) throw new AppError(401, "Invalid email or password", "INVALID_CREDENTIALS");

  admin.lastLoginAt = new Date();
  admin.status = admin.status || "ACTIVE";
  await admin.save();
  await admin.populate("roleId");
  setAuthCookie(res, signToken(admin.id), req);
  return ok(res, { admin: serializeAdmin(admin) });
}

export async function logout(_req: Request, res: Response) {
  clearAuthCookie(res);
  return ok(res, { loggedOut: true });
}

export async function me(req: Request, res: Response) {
  return ok(res, { admin: (req as AuthedRequest).user });
}
