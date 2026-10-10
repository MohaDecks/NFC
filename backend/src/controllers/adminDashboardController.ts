import type { Request, Response } from "express";
import { Profile } from "../models/Profile";
import { AuditLog } from "../models/AuditLog";
import { ProfileView } from "../models/ProfileView";
import { NFCCard } from "../models/NFCCard";
import { ProfileType } from "../models/ProfileType";
import { CardDesign } from "../models/CardDesign";
import { ok } from "../utils/response";
import { serializeProfile } from "../services/profileService";

function utcDayKeys(count: number) {
  const keys: string[] = [];
  const now = new Date();
  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const day = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - offset));
    keys.push(day.toISOString().slice(0, 10));
  }
  return keys;
}

function seriesFrom(keys: string[], rows: { _id: string; count: number }[]) {
  const map = new Map(rows.map((row) => [String(row._id), row.count]));
  return keys.map((day) => ({ day, count: map.get(day) ?? 0 }));
}

export async function getDashboard(_req: Request, res: Response) {
  const days = utcDayKeys(7);
  const since = new Date(`${days[0]}T00:00:00.000Z`);
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
    doctors,
    engineers,
    portfolios,
    recent,
    recentlyUpdated,
    activity,
    views,
    published,
    drafts,
    nfcCards,
    qrCodes,
    profileTypes,
    cardDesigns,
    createdRows,
    viewRows,
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
    Profile.countDocuments({ type: "DOCTOR" }),
    Profile.countDocuments({ type: "ENGINEER" }),
    Profile.countDocuments({ type: "PORTFOLIO" }),
    Profile.find().sort({ createdAt: -1 }).limit(6).populate(["avatar", "logo"]),
    Profile.find().sort({ updatedAt: -1 }).limit(6).populate(["avatar", "logo"]),
    AuditLog.find().sort({ createdAt: -1 }).limit(8),
    ProfileView.countDocuments(),
    Profile.countDocuments({ publishState: "PUBLISHED", status: "ACTIVE" }),
    Profile.countDocuments({ publishState: "DRAFT" }),
    NFCCard.countDocuments(),
    NFCCard.countDocuments({ qrEnabled: true }),
    ProfileType.find({ status: "ACTIVE" }).sort({ name: 1 }).limit(12),
    CardDesign.find({ status: "ACTIVE" }).sort({ name: 1 }).limit(8),
    Profile.aggregate<{ _id: string; count: number }>([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "UTC" } }, count: { $sum: 1 } } },
    ]),
    ProfileView.aggregate<{ _id: string; count: number }>([
      { $match: { viewedAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$viewedAt", timezone: "UTC" } }, count: { $sum: 1 } } },
    ]),
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
      doctors,
      engineers,
      portfolios,
      published,
      drafts,
      nfcCards,
      qrCodes,
      views,
    },
    growth: seriesFrom(days, createdRows),
    viewsByDay: seriesFrom(days, viewRows),
    recentlyUpdated: recentlyUpdated.map(serializeProfile),
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
