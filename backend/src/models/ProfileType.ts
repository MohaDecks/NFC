import { Schema, model } from "mongoose";

const profileTypeSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, trim: true, uppercase: true, unique: true, index: true },
    description: { type: String, default: "", trim: true, maxlength: 240 },
    icon: { type: String, default: "badge" },
    usage: { type: String, enum: ["PLACE", "CARD", "BOTH"], default: "BOTH", index: true },
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE", index: true },
    defaultSections: { type: [String], default: [] },
    allowedSections: { type: [String], default: [] },
    compatibleTemplates: { type: [String], default: ["modern"] },
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const ProfileType = model("ProfileType", profileTypeSchema);
