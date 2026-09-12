import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import multer from "multer";
import { AppError } from "../utils/AppError";
import { env } from "../config/env";

export function notFound(_req: Request, res: Response) {
  res.status(404).json({
    success: false,
    message: "Route not found",
    code: "NOT_FOUND",
  });
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof multer.MulterError) {
    const tooBig = err.code === "LIMIT_FILE_SIZE";
    return res.status(400).json({
      success: false,
      message: tooBig ? "Image is too large. Use a photo under 15MB." : "Could not upload this image.",
      code: tooBig ? "FILE_TOO_LARGE" : "UPLOAD_ERROR",
    });
  }

  if (err instanceof AppError) {
    return res.status(err.status).json({
      success: false,
      message: err.message,
      code: err.code,
    });
  }

  if (err instanceof mongoose.Error.ValidationError || err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      success: false,
      message: "Invalid data",
      code: "VALIDATION_ERROR",
    });
  }

  if (typeof err === "object" && err && "code" in err && (err as { code?: number }).code === 11000) {
    return res.status(409).json({
      success: false,
      message: "That value is already in use",
      code: "DUPLICATE",
    });
  }

  console.error(err);
  const raw = err instanceof Error ? err.message : "";
  const uploadRoute = req.originalUrl?.includes("/media/upload") || req.originalUrl?.includes("/branding/logo");
  const storeFailed = /EACCES|EPERM|ENOENT|ENOSPC|save this image|Cloudinary/i.test(raw);
  if (uploadRoute || storeFailed) {
    return res.status(400).json({
      success: false,
      message: raw && raw.length < 180 ? raw : "Could not save this image. Try a JPG or PNG under 15MB.",
      code: "STORE_FAILED",
    });
  }
  return res.status(500).json({
    success: false,
    message: "Something went wrong",
    code: "INTERNAL_ERROR",
    ...(env.NODE_ENV !== "production" && raw ? { debug: raw } : {}),
  });
}
