import { Schema, model } from "mongoose";

const countySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80, unique: true },
    code: { type: String, default: "", trim: true, uppercase: true, maxlength: 8 },
    isoCode: { type: String, default: "", trim: true, uppercase: true, maxlength: 8 },
    flag: { type: String, default: "", trim: true, maxlength: 16 },
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE", index: true },
  },
  { timestamps: true },
);

export const County = model("County", countySchema);
