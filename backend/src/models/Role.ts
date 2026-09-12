import { Schema, model } from "mongoose";
import { PERMISSIONS } from "../../../shared/permissions";

const roleSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "", maxlength: 200 },
    permissions: { type: [{ type: String, enum: PERMISSIONS }], default: [] },
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
    system: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Role = model("Role", roleSchema);
