import type { Request, Response } from "express";
import { Profile } from "../models/Profile";
import { AuditLog } from "../models/AuditLog";
import { ProfileView } from "../models/ProfileView";
import { NFCCard } from "../models/NFCCard";
import { ProfileType } from "../models/ProfileType";
import { CardDesign } from "../models/CardDesign";
import { ok } from "../utils/response";
import { serializeProfile } from "../services/profileService";

export async function getDashboard(_req: Request, res: Response) {
  const [
    total,
    active,
    inactive,
    blocked,
    verified,
    unverified,
    personal,
    businesses,
    hotels,
    restaurants,
    cafeterias,
    recent,
    activity,
    views,
    published,
    nfcCards,
    profileTypes,
    cardDesigns,
  ] = await Promise.all([
    Profile.countDocuments(),
    Profile.countDocuments({ status: "ACTIVE" }),
    Profile.countDocuments({ status: "INACTIVE" }),
    Profile.countDocuments({ status: "BLOCKED" }),
    Profile.countDocuments({ isVerified: true }),
    Profile.countDocuments({ isVerified: false }),
    Profile.countDocuments({ type: { $in: ["PERSONAL", "INDIVIDUAL_BUSINESS"] } }),
    Profile.countDocuments({ type: { $in: ["BUSINESS", "HOTEL", "RESTAURANT", "CAFETERIA"] } }),
    Profile.countDocuments({ type: "HOTEL" }),
    Profile.countDocuments({ type: "RESTAURANT" }),
    Profile.countDocuments({ type: "CAFETERIA" }),
    Profile.find().sort({ createdAt: -1 }).limit(8).populate(["avatar", "logo"]),
    AuditLog.find().sort({ createdAt: -1 }).limit(10),
    ProfileView.countDocuments(),
    Profile.countDocuments({ publishState: "PUBLISHED", status: "ACTIVE" }),
    NFCCard.countDocuments(),
    ProfileType.find({ status: "ACTIVE" }).sort({ name: 1 }).limit(12),
    CardDesign.find({ status: "ACTIVE" }).sort({ name: 1 }).limit(8),
  ]);

  return ok(res, {
    stats: {
      total,
      active,
      inactive,
      blocked,
      verified,
      unverified,
      personal,
      businesses,
      hotels,
      restaurants,
      cafeterias,
      published,
      nfcCards,
      views,
    },
    profileTypes: profileTypes.map((item) => ({ id: item.id, name: item.name, slug: item.slug })),
    cardDesigns: cardDesigns.map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      backgroundColor: item.backgroundColor,
      primaryColor: item.primaryColor,
      accentColor: item.accentColor,
      frontText: item.frontText,
      backText: item.backText,
      logoSource: item.logoSource,
    })),
    recentProfiles: recent.map(serializeProfile),
    recentActivity: activity.map((item) => ({
      id: item.id,
      adminName: item.adminName,
      action: item.action,
      targetName: item.targetName,
      targetType: item.targetType,
      createdAt: item.createdAt,
    })),
  });
}

export async function getAnalytics(_req: Request, res: Response) {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalViews, viewsToday, viewsThisWeek, viewsThisMonth, profiles] = await Promise.all([
    ProfileView.countDocuments(),
    ProfileView.countDocuments({ viewedAt: { $gte: startOfDay } }),
    ProfileView.countDocuments({ viewedAt: { $gte: startOfWeek } }),
    ProfileView.countDocuments({ viewedAt: { $gte: startOfMonth } }),
    Profile.countDocuments({ status: "ACTIVE" }),
  ]);

  return ok(res, { totalViews, viewsToday, viewsThisWeek, viewsThisMonth, activeProfiles: profiles });
}

export async function getAuditLogs(req: Request, res: Response) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  const targetId = String(req.query.targetId ?? "").trim();
  const filter = targetId ? { targetId } : {};
  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    AuditLog.countDocuments(filter),
  ]);

  return ok(res, {
    logs: logs.map((item) => ({
      id: item.id,
      adminName: item.adminName,
      action: item.action,
      targetName: item.targetName,
      targetType: item.targetType,
      createdAt: item.createdAt,
    })),
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  });
}
