import type { Request } from "express";
import { AppError } from "./AppError";

export function routeParam(req: Request, name: string) {
  const value = req.params[name];
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) throw new AppError(400, "Missing route parameter", "BAD_REQUEST");
  return raw;
}
