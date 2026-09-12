import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { AppError } from "../utils/AppError";

export function validate(schema: ZodType, source: "body" | "query" = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? "Invalid request";
      return next(new AppError(400, message, "VALIDATION_ERROR"));
    }
    req[source] = result.data as typeof req.body;
    next();
  };
}
