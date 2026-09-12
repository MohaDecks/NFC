import type { Request, Response } from "express";
import { ProfileView } from "../models/ProfileView";
import { ok } from "../utils/response";
import { getProfileOrThrow } from "../services/profileService";
import { routeParam } from "../utils/params";

export async function getOwnedAnalytics(req: Request, res: Response) {
  const profile = await getProfileOrThrow(routeParam(req, "id"));
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalViews, viewsToday, viewsThisWeek, viewsThisMonth] = await Promise.all([
    ProfileView.countDocuments({ profile: profile._id }),
    ProfileView.countDocuments({ profile: profile._id, viewedAt: { $gte: startOfDay } }),
    ProfileView.countDocuments({ profile: profile._id, viewedAt: { $gte: startOfWeek } }),
    ProfileView.countDocuments({ profile: profile._id, viewedAt: { $gte: startOfMonth } }),
  ]);

  return ok(res, { totalViews, viewsToday, viewsThisWeek, viewsThisMonth });
}
