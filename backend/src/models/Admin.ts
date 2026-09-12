import { Schema, model } from "mongoose";

const adminSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },
    roleId: { type: Schema.Types.ObjectId, ref: "Role", default: null },
    countyId: { type: Schema.Types.ObjectId, ref: "County", default: null },
    cityId: { type: Schema.Types.ObjectId, ref: "City", default: null },
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE", index: true },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const Admin = model("Admin", adminSchema);
