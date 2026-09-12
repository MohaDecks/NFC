import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadsDir = path.resolve(__dirname, "../../uploads");

export type StoredFile = {
  filename: string;
  url: string;
  secureUrl: string;
  publicId: string;
  resourceType: string;
  width: number;
  height: number;
  provider: "cloudinary" | "local";
};

const cloudReady = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET,
);

if (cloudReady) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
} else if (process.env.CLOUDINARY_URL) {
  cloudinary.config({ secure: true });
}

async function ensureUploadsDir() {
  await fs.mkdir(uploadsDir, { recursive: true });
}

function publicFileUrl(filename: string) {
  const base = (env.APP_URL || "").replace(/\/$/, "");
  const pathName = `/uploads/${filename}`;
  if (base && !base.includes("localhost") && !base.includes("127.0.0.1")) {
    return `${base}${pathName}`;
  }
  return pathName;
}

async function saveLocal(filename: string, buffer: Buffer): Promise<StoredFile> {
  try {
    await ensureUploadsDir();
    await fs.writeFile(path.join(uploadsDir, filename), buffer);
  } catch (err) {
    console.error("Local image save failed", err);
    throw new Error("Could not save this image on the server");
  }
  const url = publicFileUrl(filename);
  return {
    filename,
    url,
    secureUrl: url,
    publicId: filename,
    resourceType: "image",
    width: 0,
    height: 0,
    provider: "local",
  };
}

async function saveCloudinary(filename: string, buffer: Buffer): Promise<StoredFile> {
  const result = await new Promise<{
    public_id: string;
    secure_url: string;
    resource_type: string;
    width: number;
    height: number;
  }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "mubarek", public_id: filename.replace(path.extname(filename), ""), resource_type: "image" },
      (error, upload) => {
        if (error || !upload) reject(error ?? new Error("Cloudinary upload failed"));
        else resolve(upload as never);
      },
    );
    stream.end(buffer);
  });

  return {
    filename,
    url: result.secure_url,
    secureUrl: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type,
    width: result.width,
    height: result.height,
    provider: "cloudinary",
  };
}

export async function saveFile(filename: string, buffer: Buffer): Promise<StoredFile> {
  if (cloudReady || process.env.CLOUDINARY_URL) {
    try {
      return await saveCloudinary(filename, buffer);
    } catch (err) {
      console.error("Cloudinary upload failed, saving locally", err);
    }
  }
  return saveLocal(filename, buffer);
}

export async function deleteFile(stored: { provider?: string; filename?: string; publicId?: string }) {
  if (stored.provider === "cloudinary" && stored.publicId) {
    await cloudinary.uploader.destroy(stored.publicId).catch(() => undefined);
    return;
  }
  if (stored.filename) {
    await fs.unlink(path.join(uploadsDir, stored.filename)).catch(() => undefined);
  }
}

export const storage = {
  save: saveFile,
  delete: deleteFile,
  cloudReady: cloudReady || Boolean(process.env.CLOUDINARY_URL),
};
