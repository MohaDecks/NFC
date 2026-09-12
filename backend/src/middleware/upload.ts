import multer from "multer";
import { AppError } from "../utils/AppError";

const allowed = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowed.has(file.mimetype)) {
      cb(new AppError(400, "Only JPEG, PNG, WebP, and GIF images are allowed", "INVALID_FILE"));
      return;
    }
    cb(null, true);
  },
});
