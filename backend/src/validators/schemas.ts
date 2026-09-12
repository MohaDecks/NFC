import { z } from "zod";
import {
  BUTTON_STYLES,
  COVER_STYLES,
  FONTS,
  PROFILE_STATUS,
  RADIUS_OPTIONS,
  TEMPLATE_IDS,
} from "../../../shared/profileTypes";

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const createProfileSchema = z.object({
  type: z.string().trim().min(2).max(40).regex(/^[A-Z][A-Z0-9_]*$/, "Use an uppercase type slug"),
  name: z.string().trim().min(1, "Name is required").max(120),
  ownerName: z.string().trim().max(120).optional(),
  ownerEmail: z.string().trim().max(120).optional(),
  ownerPhone: z.string().trim().max(40).optional(),
});

const socialLinkSchema = z.object({
  platform: z.string().trim().min(1).max(40),
  url: z.string().trim().min(1).max(300),
  username: z.string().trim().max(80).optional(),
});

const openingHourSchema = z.object({
  day: z.string(),
  open: z.string().optional(),
  close: z.string().optional(),
  closed: z.boolean().optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().max(120).optional(),
  tagline: z.string().trim().max(160).optional(),
  description: z.string().trim().max(2000).optional(),
  ownerName: z.string().trim().max(120).optional(),
  ownerEmail: z.string().trim().max(120).optional(),
  ownerPhone: z.string().trim().max(40).optional(),
  status: z.enum(PROFILE_STATUS).optional(),
  contact: z
    .object({
      phone: z.string().max(40).optional(),
      email: z.string().max(120).optional(),
      whatsapp: z.string().max(40).optional(),
      website: z.string().max(300).optional(),
    })
    .optional(),
  location: z
    .object({
      address: z.string().max(200).optional(),
      city: z.string().max(80).optional(),
      country: z.string().max(80).optional(),
      countryId: z.string().nullable().optional(),
      cityId: z.string().nullable().optional(),
      mapsUrl: z.string().max(400).optional(),
      latitude: z.number().min(-90).max(90).nullable().optional(),
      longitude: z.number().min(-180).max(180).nullable().optional(),
    })
    .optional(),
  cardDesign: z
    .object({
      preset: z.enum(["minimal", "modern", "luxury", "business", "gradient", "dark", "restaurant", "hotel", "personal", "professional"]).optional(),
      backgroundColor: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/).optional(),
      primaryColor: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/).optional(),
      accentColor: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/).optional(),
      frontText: z.string().max(80).optional(),
      backText: z.string().max(80).optional(),
      showLogo: z.boolean().optional(),
      logoSource: z.enum(["brand", "profile"]).optional(),
      qrPlacement: z.enum(["center", "bottom"]).optional(),
    })
    .optional(),
  openingHours: z.array(openingHourSchema).optional(),
  amenities: z.array(z.string().trim().max(60)).max(40).optional(),
  socialLinks: z.array(socialLinkSchema).max(12).optional(),
  avatar: z.string().nullable().optional(),
  logo: z.string().nullable().optional(),
  cover: z.string().nullable().optional(),
  gallery: z.array(z.string()).max(24).optional(),
});

export const designSchema = z.object({
  template: z.enum(TEMPLATE_IDS).optional(),
  primaryColor: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/).optional(),
  secondaryColor: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/).optional(),
  accentColor: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/).optional(),
  font: z.enum(FONTS).optional(),
  buttonStyle: z.enum(BUTTON_STYLES).optional(),
  borderRadius: z.enum(RADIUS_OPTIONS).optional(),
  coverStyle: z.enum(COVER_STYLES).optional(),
});

export const categorySchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().max(200).optional(),
});

export const itemSchema = z.object({
  categoryId: z.string().optional(),
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().max(500).optional(),
  price: z.number().min(0).optional(),
  currency: z.string().max(8).optional(),
  image: z.string().nullable().optional(),
  available: z.boolean().optional(),
  featured: z.boolean().optional(),
  tags: z.array(z.string().max(30)).max(8).optional(),
});

export const createItemSchema = itemSchema.extend({
  categoryId: z.string().min(1),
  name: z.string().trim().min(1).max(120),
  price: z.number().min(0),
});

export const serviceSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  description: z.string().max(400).optional(),
  icon: z.string().max(40).optional(),
  image: z.string().nullable().optional(),
});

export const createServiceSchema = serviceSchema.extend({
  name: z.string().trim().min(1).max(80),
});

export const reorderSchema = z.object({
  orderedIds: z.array(z.string()).min(1),
});

export const adminAccountSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  email: z.string().trim().email().max(120).optional(),
});

export const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(80),
});

export const createAdminSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  password: z.string().min(8).max(80),
  roleId: z.string().optional(),
  countyId: z.string().optional().nullable(),
  cityId: z.string().optional().nullable(),
});

export const updateAdminSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  email: z.string().trim().email().max(120).optional(),
  password: z.string().min(8).max(80).optional(),
  roleId: z.string().optional(),
  countyId: z.string().optional().nullable(),
  cityId: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const countySchema = z.object({
  name: z.string().trim().min(2).max(80),
  code: z.string().trim().max(8).optional(),
  isoCode: z.string().trim().max(8).optional(),
  flag: z.string().trim().max(16).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const profileTypeSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().max(40).optional(),
  description: z.string().max(240).optional(),
  icon: z.string().max(40).optional(),
  usage: z.enum(["PLACE", "CARD", "BOTH"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  defaultSections: z.array(z.string()).optional(),
  allowedSections: z.array(z.string()).optional(),
  compatibleTemplates: z.array(z.string()).optional(),
});

export const cardDesignSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  slug: z.string().trim().max(40).optional(),
  description: z.string().max(200).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  sourceId: z.string().optional(),
  preset: z.string().optional(),
  backgroundColor: z.string().optional(),
  primaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  frontText: z.string().max(80).optional(),
  backText: z.string().max(80).optional(),
  showLogo: z.boolean().optional(),
  logoSource: z.enum(["brand", "profile"]).optional(),
  qrPlacement: z.enum(["center", "bottom"]).optional(),
});

export const nfcCardSchema = z.object({
  profileId: z.string().min(1),
  name: z.string().trim().max(80).optional(),
  designId: z.string().nullable().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "LOST", "REPLACED"]).optional(),
  nfcEnabled: z.boolean().optional(),
  qrEnabled: z.boolean().optional(),
});

export const citySchema = z.object({
  name: z.string().trim().min(2).max(80),
  countyId: z.string().min(1),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const roleSchema = z.object({
  name: z.string().trim().min(2).max(60),
  description: z.string().max(200).optional(),
  permissions: z.array(z.string()).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const sectionSchema = z.object({
  type: z.string().min(1),
  title: z.string().max(80).optional(),
  visible: z.boolean().optional(),
  content: z.record(z.string(), z.unknown()).optional(),
});

export const roomSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  roomType: z.enum(["single", "double", "twin", "deluxe", "suite", "family"]).optional(),
  description: z.string().max(500).optional(),
  price: z.number().min(0).optional(),
  currency: z.string().max(8).optional(),
  capacity: z.number().min(1).optional(),
  beds: z.number().min(1).optional(),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  available: z.boolean().optional(),
});

export const createRoomSchema = roomSchema.extend({
  name: z.string().trim().min(1).max(80),
});
