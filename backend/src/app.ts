import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env, isProd } from "./config/env";
import { adminAuthRouter, adminRouter } from "./routes/admin";
import { publicRouter } from "./routes/public";
import { errorHandler, notFound } from "./middleware/errorHandler";
import { uploadsDir } from "./services/storage";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(__dirname, "../../frontend");
const frontendDist = path.join(frontendRoot, "dist");

export async function createApp() {
  const app = express();

  app.set("trust proxy", 1);
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      contentSecurityPolicy: false,
      hsts: false,
    }),
  );
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || env.CORS_ORIGINS.includes(origin.replace(/\/$/, ""))) {
          callback(null, true);
          return;
        }
        callback(null, false);
      },
      credentials: true,
    }),
  );
  app.use(cookieParser());
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan(isProd ? "combined" : "dev"));
  app.use("/uploads", express.static(uploadsDir));

  app.use(
    "/api",
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 400,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.get("/api/health", (_req, res) => {
    res.json({ success: true, data: { ok: true } });
  });

  app.use("/api/admin/auth", adminAuthRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/public", publicRouter);
  app.use("/api", notFound);

  if (isProd || fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));
    app.get("/p/:publicId", async (req, res, next) => {
      try {
        const { sendPublicHtml } = await import("./utils/og");
        await sendPublicHtml(req, res, path.join(frontendDist, "index.html"));
      } catch (err) {
        next(err);
      }
    });
    app.get(/.*/, (_req, res) => {
      res.sendFile(path.join(frontendDist, "index.html"));
    });
  } else {
    const { createServer } = await import("vite");
    const vite = await createServer({
      configFile: path.join(frontendRoot, "vite.config.ts"),
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.use(errorHandler);
  return app;
}
