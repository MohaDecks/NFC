import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "@/lib/api";

export type Branding = {
  name: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  secondaryColor: string;
};

const FALLBACK: Branding = {
  name: "MUBAREK TECHNOLOGY SOLUTION",
  tagline: "Your All-In-One Technology",
  logoUrl: "/branding/mubarek-logo-source.png",
  faviconUrl: "/branding/mubarek-mark.svg",
  primaryColor: "#1565C0",
  secondaryColor: "#0D47A1",
};

const BrandingContext = createContext<{
  branding: Branding;
  brandName: string;
  logoUrl: string;
  faviconUrl: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  refresh: () => Promise<void>;
}>({
  branding: FALLBACK,
  brandName: FALLBACK.name,
  logoUrl: FALLBACK.logoUrl,
  faviconUrl: FALLBACK.faviconUrl,
  tagline: FALLBACK.tagline,
  primaryColor: FALLBACK.primaryColor,
  secondaryColor: FALLBACK.secondaryColor,
  refresh: async () => undefined,
});

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<Branding>(FALLBACK);

  async function refresh() {
    try {
      const data = await api.get<{ branding: Branding }>("/api/public/branding");
      setBranding({ ...FALLBACK, ...data.branding });
    } catch {
      setBranding(FALLBACK);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    document.title = branding.name;
    document.documentElement.style.setProperty("--brand-from", branding.primaryColor);
    document.documentElement.style.setProperty("--brand-to", branding.secondaryColor);
    document.documentElement.style.setProperty("--primary", branding.primaryColor);
    const icon = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
    if (icon) icon.href = branding.faviconUrl;
    const desc = document.querySelector("meta[name='description']") as HTMLMetaElement | null;
    if (desc) desc.content = `${branding.name} — ${branding.tagline}`;
  }, [branding]);

  const value = useMemo(
    () => ({
      branding,
      brandName: branding.name,
      logoUrl: branding.logoUrl,
      faviconUrl: branding.faviconUrl,
      tagline: branding.tagline,
      primaryColor: branding.primaryColor,
      secondaryColor: branding.secondaryColor,
      refresh,
    }),
    [branding],
  );

  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
}

export function useBranding() {
  return useContext(BrandingContext);
}
