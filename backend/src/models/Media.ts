import { Schema, model } from "mongoose";

const mediaSchema = new Schema(
  {
    uploadedBy: { type: Schema.Types.ObjectId, ref: "Admin", required: true, index: true },
    profile: { type: Schema.Types.ObjectId, ref: "Profile", default: null, index: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, default: "" },
    size: { type: Number, default: 0 },
    url: { type: String, required: true },
    secureUrl: { type: String, default: "" },
    publicId: { type: String, default: "" },
    resourceType: { type: String, default: "image" },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    provider: { type: String, enum: ["cloudinary", "local"], default: "local" },
    filename: { type: String, default: "" },
    kind: {
      type: String,
      enum: ["avatar", "logo", "cover", "gallery", "menu", "service", "profile", "room"],
      default: "gallery",
      index: true,
    },
  },
  { timestamps: true },
);

export const Media = model("Media", mediaSchema);
