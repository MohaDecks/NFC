import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { z } from "zod";

const here = path.dirname(fileURLToPath(import.meta.url));
const rootEnv = path.resolve(here, "../../../.env");
const backendEnv = path.resolve(here, "../../.env");

dotenv.config({ path: rootEnv });
dotenv.config({ path: backendEnv });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(4000),
  MONGO_URI: z.string().default("mongodb://127.0.0.1:27017/bravio"),
  JWT_SECRET: z.string().min(16).default("bravio-dev-secret-change-me"),
  APP_URL: z.string().optional(),
  CLIENT_URL: z.string().optional(),
  COOKIE_NAME: z.string().default("bravio_admin"),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  ADMIN_NAME: z.string().default("Mubarek Admin"),
  ADMIN_EMAIL: z.string().default("admin@bravio.local"),
  ADMIN_PASSWORD: z.string().default("admin12345"),
});

const parsed = envSchema.parse(process.env);

const appUrl = parsed.APP_URL || parsed.CLIENT_URL || `http://localhost:${parsed.PORT}`;

function originList(...raw: Array<string | undefined>) {
  const urls = new Set<string>();
  for (const value of raw) {
    if (!value) continue;
    for (const part of value.split(",")) {
      const trimmed = part.trim().replace(/\/$/, "");
      if (!trimmed) continue;
      urls.add(trimmed);
      try {
        const parsedUrl = new URL(trimmed);
        urls.add(`https://${parsedUrl.host}`);
        urls.add(`http://${parsedUrl.host}`);
      } catch {
        // keep the raw value only
      }
    }
  }
  return [...urls];
}

export const env = {
  ...parsed,
  APP_URL: appUrl,
  CORS_ORIGINS: originList(
    appUrl,
    parsed.CLIENT_URL,
    "https://mubarektech.deknest.com",
    "http://mubarektech.deknest.com",
    "http://localhost:4001",
    "http://127.0.0.1:4001",
  ),
};

export const isProd = env.NODE_ENV === "production";
