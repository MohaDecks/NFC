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
  _req: Request,
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
  return res.status(500).json({
    success: false,
    message: "Something went wrong",
    code: "INTERNAL_ERROR",
    ...(env.NODE_ENV !== "production" && err instanceof Error
      ? { debug: err.message }
      : {}),
  });
}
