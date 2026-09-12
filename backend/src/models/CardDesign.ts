import { Schema, model } from "mongoose";
import { CARD_PRESET_IDS } from "../../../shared/cardDesign";

const cardDesignSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    description: { type: String, default: "", maxlength: 200 },
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE", index: true },
    preset: { type: String, enum: CARD_PRESET_IDS, default: "minimal" },
    backgroundColor: { type: String, default: "#0B1020" },
    primaryColor: { type: String, default: "#F8FAFC" },
    accentColor: { type: String, default: "#38BDF8" },
    frontText: { type: String, default: "Digital Business Card" },
    backText: { type: String, default: "Scan or Tap" },
    showLogo: { type: Boolean, default: true },
    logoSource: { type: String, enum: ["brand", "profile"], default: "brand" },
    qrPlacement: { type: String, enum: ["center", "bottom"], default: "center" },
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const CardDesign = model("CardDesign", cardDesignSchema);
