import type { Types } from "mongoose";
import { Profile } from "../models/Profile";
import { Media } from "../models/Media";
import { MenuCategory } from "../models/MenuCategory";
import { MenuItem } from "../models/MenuItem";
import { HotelService } from "../models/HotelService";
import { HotelRoom } from "../models/HotelRoom";
import { ensureSections } from "./sectionService";
import { AppError } from "../utils/AppError";
import {
  defaultTemplateForType,
  isProfileType,
  TEMPLATE_REGISTRY,
  type ProfileType,
  type TemplateId,
} from "../../../shared/profileTypes";
import { DEFAULT_CARD_DESIGN, type CardDesign } from "../../../shared/cardDesign";

type MediaLike = { _id: Types.ObjectId; url?: string; secureUrl?: string };

function mediaUrl(doc: unknown): string | null {
  if (!doc || typeof doc !== "object") return null;
  const item = doc as MediaLike;
  return item.secureUrl || item.url || null;
}

function mediaId(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "object" && "_id" in value) {
    return String((value as { _id: Types.ObjectId })._id);
  }
  return String(value);
}

export async function getProfileOrThrow(profileId: string) {
  if (!profileId.match(/^[a-f0-9]{24}$/i)) {
    throw new AppError(404, "Profile not found", "PROFILE_NOT_FOUND");
  }
  const profile = await Profile.findById(profileId);
  if (!profile) throw new AppError(404, "Profile not found", "PROFILE_NOT_FOUND");
  return profile;
}

export function resolveTemplate(type: string, template?: string): TemplateId {
  const requested = (template ?? defaultTemplateForType(type)) as TemplateId;
  const meta = TEMPLATE_REGISTRY[requested];
  if (meta && (!isProfileType(type) || meta.compatibleTypes.includes(type as ProfileType))) return requested;
  return defaultTemplateForType(type);
}

function serializeLocation(location: InstanceType<typeof Profile>["location"]) {
  return {
    address: location?.address ?? "",
    city: location?.city ?? "",
    country: location?.country ?? "",
    countryId: location?.countryId ? String(location.countryId) : null,
    cityId: location?.cityId ? String(location.cityId) : null,
    mapsUrl: location?.mapsUrl ?? "",
    latitude: typeof location?.latitude === "number" ? location.latitude : null,
    longitude: typeof location?.longitude === "number" ? location.longitude : null,
  };
}

function serializeCardDesign(design: InstanceType<typeof Profile>["cardDesign"] | undefined): CardDesign {
  return {
    preset: design?.preset ?? DEFAULT_CARD_DESIGN.preset,
    backgroundColor: design?.backgroundColor ?? DEFAULT_CARD_DESIGN.backgroundColor,
    primaryColor: design?.primaryColor ?? DEFAULT_CARD_DESIGN.primaryColor,
    accentColor: design?.accentColor ?? DEFAULT_CARD_DESIGN.accentColor,
    frontText: design?.frontText ?? DEFAULT_CARD_DESIGN.frontText,
    backText: design?.backText ?? DEFAULT_CARD_DESIGN.backText,
    showLogo: design?.showLogo !== false,
    logoSource: design?.logoSource ?? DEFAULT_CARD_DESIGN.logoSource,
    qrPlacement: design?.qrPlacement ?? DEFAULT_CARD_DESIGN.qrPlacement,
  };
}

function serializeDesign(
  design: InstanceType<typeof Profile>["design"],
  type?: InstanceType<typeof Profile>["type"],
) {
  return {
    template: type ? resolveTemplate(type, design.template) : design.template,
    primaryColor: design.primaryColor,
    secondaryColor: design.secondaryColor,
    accentColor: design.accentColor || "#C9A227",
    font: design.font,
    buttonStyle: design.buttonStyle,
    borderRadius: design.borderRadius,
    coverStyle: design.coverStyle,
  };
}

export function serializeProfile(profile: InstanceType<typeof Profile>) {
  const verifiedByDoc = profile.verifiedBy as unknown as { id?: string; _id?: Types.ObjectId; name?: string } | null;
  const verifiedBy = verifiedByDoc
    ? {
        id: String(verifiedByDoc.id ?? verifiedByDoc._id ?? profile.verifiedBy),
        name: verifiedByDoc.name ?? "",
      }
    : null;

  return {
    id: profile.id,
    type: profile.type,
    publicId: profile.publicId,
    status: profile.status,
    publishState: profile.publishState || (profile.status === "ACTIVE" ? "PUBLISHED" : "DRAFT"),
    isVerified: profile.isVerified,
    verifiedAt: profile.verifiedAt,
    verifiedBy,
    name: profile.name,
    tagline: profile.tagline,
    description: profile.description,
    owner: {
      name: profile.ownerName,
      email: profile.ownerEmail,
      phone: profile.ownerPhone,
    },
    contact: profile.contact,
    location: serializeLocation(profile.location),
    cardDesign: serializeCardDesign(profile.cardDesign),
    openingHours: profile.openingHours,
    amenities: profile.amenities,
    socialLinks: profile.socialLinks,
    design: serializeDesign(profile.design),
    avatar: mediaId(profile.avatar),
    logo: mediaId(profile.logo),
    cover: mediaId(profile.cover),
    gallery: (profile.gallery ?? []).map((item) => mediaId(item)).filter(Boolean),
    avatarUrl: mediaUrl(profile.avatar),
    logoUrl: mediaUrl(profile.logo),
    coverUrl: mediaUrl(profile.cover),
    galleryUrls: (profile.gallery ?? [])
      .map((item) => mediaUrl(item))
      .filter((url): url is string => Boolean(url)),
    publishedAt: profile.publishedAt,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

export async function loadAdminProfile(profileId: string) {
  const profile = await getProfileOrThrow(profileId);
  await profile.populate(["avatar", "logo", "cover", "gallery", "verifiedBy"]);
  return serializeProfile(profile);
}

export async function buildPublicProfile(profile: InstanceType<typeof Profile>) {
  await profile.populate(["avatar", "logo", "cover", "gallery"]);

  const [categories, services, rooms, sections] = await Promise.all([
    MenuCategory.find({ profile: profile._id }).sort({ sortOrder: 1, createdAt: 1 }),
    HotelService.find({ profile: profile._id }).sort({ sortOrder: 1, createdAt: 1 }).populate("image"),
    HotelRoom.find({ profile: profile._id }).sort({ sortOrder: 1, createdAt: 1 }).populate("images"),
    ensureSections(profile),
  ]);

  const items = await MenuItem.find({
    profile: profile._id,
    category: { $in: categories.map((c) => c._id) },
  })
    .sort({ sortOrder: 1, createdAt: 1 })
    .populate("image");

  const menu = categories.map((category) => ({
    id: category.id,
    name: category.name,
    description: category.description,
    items: items
      .filter((item) => item.category.toString() === category.id)
      .map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        currency: item.currency,
        imageUrl: mediaUrl(item.image),
        available: item.available,
        featured: item.featured,
        tags: item.tags,
      })),
  }));

  return {
    publicId: profile.publicId,
    type: profile.type,
    name: profile.name,
    tagline: profile.tagline,
    description: profile.description,
    isVerified: profile.isVerified,
    contact: profile.contact,
    location: serializeLocation(profile.location),
    openingHours: profile.openingHours,
    amenities: profile.amenities,
    socialLinks: profile.socialLinks,
    design: serializeDesign(profile.design, profile.type),
    media: {
      avatarUrl: mediaUrl(profile.avatar),
      logoUrl: mediaUrl(profile.logo),
      coverUrl: mediaUrl(profile.cover),
      gallery: (profile.gallery ?? [])
        .map((item) => mediaUrl(item))
        .filter((url): url is string => Boolean(url)),
    },
    menu,
    services: services.map((service) => ({
      id: service.id,
      name: service.name,
      description: service.description,
      icon: service.icon,
      imageUrl: mediaUrl(service.image),
    })),
    rooms: rooms.map((room) => ({
      id: room.id,
      name: room.name,
      roomType: room.roomType || "double",
      description: room.description,
      price: room.price,
      currency: room.currency,
      capacity: room.capacity,
      beds: room.beds || 1,
      amenities: room.amenities,
      available: room.available,
      imageUrls: (room.images ?? []).map((item) => mediaUrl(item)).filter((url): url is string => Boolean(url)),
    })),
    sections: sections.filter((section) => section.visible),
  };
}

export async function assertMedia(mediaIdValue: string | null | undefined) {
  if (!mediaIdValue) return null;
  const media = await Media.findById(mediaIdValue);
  if (!media) throw new AppError(404, "Image not found", "MEDIA_NOT_FOUND");
  return media;
}
