import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AdminProvider } from "@/hooks/useAdmin";
import { BrandingProvider } from "@/hooks/useBranding";
import { PublicProfilePage } from "@/pages/public/PublicProfilePage";

const AdminRoutes = lazy(() => import("@/AdminRoutes").then((module) => ({ default: module.AdminRoutes })));

export default function App() {
  return (
    <BrandingProvider>
    <AdminProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="/p/:publicId" element={<PublicProfilePage />} />
          <Route
            path="/admin/*"
            element={
              <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading admin…</div>}>
                <AdminRoutes />
              </Suspense>
            }
          />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </BrowserRouter>
    </AdminProvider>
    </BrandingProvider>
  );
}
