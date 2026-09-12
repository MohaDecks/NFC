import { AuditLog } from "../models/AuditLog";
import type { AuthUser } from "../middleware/auth";

export async function writeAudit(
  admin: AuthUser,
  action: string,
  target: { id?: string; name?: string; type?: string } = {},
) {
  await AuditLog.create({
    admin: admin.id,
    adminName: admin.name,
    action,
    targetType: target.type ?? "Profile",
    targetId: target.id ?? "",
    targetName: target.name ?? "",
  });
}
