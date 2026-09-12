import type { ReactNode } from "react";
import type { Permission } from "@shared/permissions";
import { useAdmin } from "@/hooks/useAdmin";

export function RequirePermission({
  permission,
  children,
}: {
  permission: Permission | Permission[];
  children: ReactNode;
}) {
  const { can } = useAdmin();
  const needed = Array.isArray(permission) ? permission : [permission];
  if (!needed.some((item) => can(item))) {
    return (
      <div className="rounded-2xl border bg-white p-8 text-sm text-muted-foreground">
        You do not have permission to view this page.
      </div>
    );
  }
  return children;
}
