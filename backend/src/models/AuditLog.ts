import { Schema, model } from "mongoose";

const auditLogSchema = new Schema(
  {
    admin: { type: Schema.Types.ObjectId, ref: "Admin", required: true, index: true },
    adminName: { type: String, required: true },
    action: { type: String, required: true, index: true },
    targetType: { type: String, default: "Profile" },
    targetId: { type: String, default: "" },
    targetName: { type: String, default: "" },
  },
  { timestamps: true },
);

auditLogSchema.index({ createdAt: -1 });

export const AuditLog = model("AuditLog", auditLogSchema);
