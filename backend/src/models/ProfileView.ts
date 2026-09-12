import { Schema, model } from "mongoose";

const profileViewSchema = new Schema(
  {
    profile: { type: Schema.Types.ObjectId, ref: "Profile", required: true, index: true },
    viewedAt: { type: Date, default: Date.now, index: true },
    deviceType: {
      type: String,
      enum: ["mobile", "tablet", "desktop"],
      default: "desktop",
    },
    referrer: { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  { timestamps: false },
);

profileViewSchema.index({ profile: 1, viewedAt: -1 });

export const ProfileView = model("ProfileView", profileViewSchema);
