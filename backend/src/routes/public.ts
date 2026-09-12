import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { optionalAuth } from "../middleware/auth";
import { getPublicProfile } from "../controllers/publicController";
import { getPublicBranding } from "../controllers/brandingController";

export const publicRouter = Router();
publicRouter.get("/branding", asyncHandler(getPublicBranding));
publicRouter.get("/profiles/:publicId", optionalAuth, asyncHandler(getPublicProfile));
