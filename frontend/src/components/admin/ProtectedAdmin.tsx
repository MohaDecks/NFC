import { Navigate, Outlet } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { Skeleton } from "@/components/ui/skeleton";

export function ProtectedAdmin() {
  const { admin, loading } = useAdmin();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-10 w-40" />
      </div>
    );
  }
  if (!admin) return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}
