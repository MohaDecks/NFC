import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { AppError } from "../utils/AppError";

const allowed = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
  "image/avif",
  "image/svg+xml",
]);

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const type = (file.mimetype || "").toLowerCase();
    const name = (file.originalname || "").toLowerCase();
    const looksImage = type.startsWith("image/") || /\.(jpe?g|png|webp|gif|heic|heif|avif|svg)$/.test(name);
    if (!allowed.has(type) && !looksImage) {
      cb(new AppError(400, "Use a photo: JPG, PNG, WEBP, HEIC, or GIF", "INVALID_FILE"));
      return;
    }
    cb(null, true);
  },
});

export function uploadImage(req: Request, res: Response, next: NextFunction) {
  upload.single("file")(req, res, (err: unknown) => {
    if (!err) {
      next();
      return;
    }
    if (err instanceof AppError) {
      next(err);
      return;
    }
    const tooBig = typeof err === "object" && err && "code" in err && (err as { code?: string }).code === "LIMIT_FILE_SIZE";
    next(
      new AppError(
        400,
        tooBig ? "Image is too large. Use a photo under 15MB." : "Could not upload this image. Try a JPG or PNG.",
        tooBig ? "FILE_TOO_LARGE" : "UPLOAD_ERROR",
      ),
    );
  });
}
