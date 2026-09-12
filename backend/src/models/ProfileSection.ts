import { Schema, model } from "mongoose";
import { SECTION_TYPES } from "../../../shared/sections";

const profileSectionSchema = new Schema(
  {
    profile: { type: Schema.Types.ObjectId, ref: "Profile", required: true, index: true },
    type: { type: String, enum: SECTION_TYPES, required: true },
    title: { type: String, default: "" },
    visible: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    content: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

profileSectionSchema.index({ profile: 1, sortOrder: 1 });

export const ProfileSection = model("ProfileSection", profileSectionSchema);
