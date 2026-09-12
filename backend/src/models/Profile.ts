import { Schema, model } from "mongoose";
import {
  BUTTON_STYLES,
  COVER_STYLES,
  FONTS,
  PROFILE_STATUS,
  RADIUS_OPTIONS,
  TEMPLATE_IDS,
} from "../../../shared/profileTypes";

const socialLinkSchema = new Schema(
  {
    platform: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    username: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const openingHourSchema = new Schema(
  {
    day: { type: String, required: true },
    open: { type: String, default: "08:00" },
    close: { type: String, default: "22:00" },
    closed: { type: Boolean, default: false },
  },
  { _id: false },
);

const designSchema = new Schema(
  {
    template: { type: String, enum: TEMPLATE_IDS, default: "modern" },
    primaryColor: { type: String, default: "#1B6B5A" },
    secondaryColor: { type: String, default: "#F4EFE6" },
    accentColor: { type: String, default: "#C9A227" },
    font: { type: String, enum: FONTS, default: "Inter" },
    buttonStyle: { type: String, enum: BUTTON_STYLES, default: "rounded" },
    borderRadius: { type: String, enum: RADIUS_OPTIONS, default: "lg" },
    coverStyle: { type: String, enum: COVER_STYLES, default: "banner" },
  },
  { _id: false },
);

const cardDesignSchema = new Schema(
  {
    preset: { type: String, enum: ["minimal", "modern", "luxury", "business", "gradient", "dark", "restaurant", "hotel", "personal", "professional"], default: "minimal" },
    backgroundColor: { type: String, default: "#F7F4EE" },
    primaryColor: { type: String, default: "#171717" },
    accentColor: { type: String, default: "#1B6B5A" },
    frontText: { type: String, default: "Tap to open" },
    backText: { type: String, default: "Scan or tap" },
    showLogo: { type: Boolean, default: true },
    logoSource: { type: String, enum: ["brand", "profile"], default: "profile" },
    qrPlacement: { type: String, enum: ["center", "bottom"], default: "center" },
  },
  { _id: false },
);

const profileSchema = new Schema(
  {
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin", required: true, index: true },
    type: { type: String, required: true, index: true },
    publicId: { type: String, required: true, unique: true, index: true },
    status: { type: String, enum: PROFILE_STATUS, default: "INACTIVE", index: true },
    publishState: { type: String, enum: ["DRAFT", "PUBLISHED"], default: "DRAFT", index: true },
    isVerified: { type: Boolean, default: false, index: true },
    verifiedAt: { type: Date, default: null },
    verifiedBy: { type: Schema.Types.ObjectId, ref: "Admin", default: null },
    name: { type: String, trim: true, default: "" },
    tagline: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    ownerName: { type: String, trim: true, default: "" },
    ownerEmail: { type: String, trim: true, default: "" },
    ownerPhone: { type: String, trim: true, default: "" },
    contact: {
      phone: { type: String, default: "" },
      email: { type: String, default: "" },
      whatsapp: { type: String, default: "" },
      website: { type: String, default: "" },
    },
    location: {
      address: { type: String, default: "" },
      city: { type: String, default: "" },
      country: { type: String, default: "" },
      countryId: { type: Schema.Types.ObjectId, ref: "County", default: null },
      cityId: { type: Schema.Types.ObjectId, ref: "City", default: null },
      mapsUrl: { type: String, default: "" },
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
    },
    cardDesign: { type: cardDesignSchema, default: () => ({}) },
    openingHours: { type: [openingHourSchema], default: [] },
    amenities: { type: [String], default: [] },
    socialLinks: { type: [socialLinkSchema], default: [] },
    design: { type: designSchema, default: () => ({}) },
    avatar: { type: Schema.Types.ObjectId, ref: "Media", default: null },
    logo: { type: Schema.Types.ObjectId, ref: "Media", default: null },
    cover: { type: Schema.Types.ObjectId, ref: "Media", default: null },
    gallery: [{ type: Schema.Types.ObjectId, ref: "Media" }],
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

profileSchema.index({ name: "text", ownerName: "text", publicId: "text" });

export const Profile = model("Profile", profileSchema);
