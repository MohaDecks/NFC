import { Schema, model } from "mongoose";

const assetSchema = new Schema(
  {
    publicId: { type: String, default: "" },
    secureUrl: { type: String, default: "" },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    resourceType: { type: String, default: "image" },
    provider: { type: String, default: "local" },
    filename: { type: String, default: "" },
  },
  { _id: false },
);

const brandingSchema = new Schema(
  {
    name: { type: String, required: true, default: "MUBAREK TECHNOLOGY SOLUTION" },
    tagline: { type: String, default: "Your All-In-One Technology" },
    logo: { type: assetSchema, default: () => ({}) },
    favicon: { type: assetSchema, default: () => ({}) },
    primaryColor: { type: String, default: "#1565C0" },
    secondaryColor: { type: String, default: "#0D47A1" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const ApplicationBranding = model("ApplicationBranding", brandingSchema);
