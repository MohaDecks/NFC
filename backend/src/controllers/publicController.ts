import type { Request, Response } from "express";
import { Profile } from "../models/Profile";
import { ProfileView } from "../models/ProfileView";
import { AppError } from "../utils/AppError";
import { ok } from "../utils/response";
import { detectDevice } from "../utils/device";
import { buildPublicProfile } from "../services/profileService";
import { routeParam } from "../utils/params";

export async function getPublicProfile(req: Request, res: Response) {
  const profile = await Profile.findOne({ publicId: routeParam(req, "publicId") });
  const published = profile
    ? profile.publishState
      ? profile.publishState === "PUBLISHED"
      : Boolean(profile.publishedAt)
    : false;
  if (!profile || profile.status !== "ACTIVE" || !published) {
    throw new AppError(404, "Profile unavailable.", "PROFILE_UNAVAILABLE");
  }

  const viewer = (req as Request & { user?: { id: string } }).user;
  if (!viewer?.id) {
    await ProfileView.create({
      profile: profile._id,
      viewedAt: new Date(),
      deviceType: detectDevice(req.get("user-agent") ?? ""),
      referrer: req.get("referer") ?? "",
      userAgent: (req.get("user-agent") ?? "").slice(0, 240),
    });
  }

  const data = await buildPublicProfile(profile);
  return ok(res, { profile: data });
}
