import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Permission } from "@shared/permissions";
import { api } from "@/lib/api";
import type { Admin } from "@/types";

type AdminContextValue = {
  admin: Admin | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setAdmin: (admin: Admin | null) => void;
  can: (permission: Permission) => boolean;
};

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ admin: Admin }>("/api/admin/auth/me")
      .then((data) => setAdmin(data.admin))
      .catch(() => setAdmin(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.post<{ admin: Admin }>("/api/admin/auth/login", { email, password });
    setAdmin(data.admin);
  }, []);

  const logout = useCallback(async () => {
    await api.post("/api/admin/auth/logout");
    setAdmin(null);
  }, []);

  const can = useCallback(
    (permission: Permission) => Boolean(admin?.permissions?.includes(permission)),
    [admin],
  );

  const value = useMemo(
    () => ({ admin, loading, login, logout, setAdmin, can }),
    [admin, loading, login, logout, can],
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
