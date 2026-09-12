export const CARD_PRESET_IDS = [
  "minimal",
  "modern",
  "luxury",
  "business",
  "gradient",
  "dark",
  "restaurant",
  "hotel",
  "personal",
  "professional",
] as const;

export type CardPresetId = (typeof CARD_PRESET_IDS)[number];

export const QR_PLACEMENTS = ["center", "bottom"] as const;
export type QrPlacement = (typeof QR_PLACEMENTS)[number];

export type CardDesign = {
  preset: CardPresetId;
  backgroundColor: string;
  primaryColor: string;
  accentColor: string;
  frontText: string;
  backText: string;
  showLogo: boolean;
  logoSource: "brand" | "profile";
  qrPlacement: QrPlacement;
};

export const CARD_PRESET_REGISTRY: Record<
  CardPresetId,
  { id: CardPresetId; name: string; description: string; design: Omit<CardDesign, "preset"> }
> = {
  minimal: {
    id: "minimal",
    name: "Minimal",
    description: "Clean white card with quiet typography.",
    design: {
      backgroundColor: "#F7F4EE",
      primaryColor: "#171717",
      accentColor: "#1B6B5A",
      frontText: "Tap to open",
      backText: "Scan or tap",
      showLogo: true,
      logoSource: "brand",
      qrPlacement: "center",
    },
  },
  modern: {
    id: "modern",
    name: "Modern",
    description: "Soft light card with a violet accent.",
    design: {
      backgroundColor: "#F8F5FF",
      primaryColor: "#1E1B4B",
      accentColor: "#7C3AED",
      frontText: "Tap to connect",
      backText: "Scan or tap",
      showLogo: true,
      logoSource: "profile",
      qrPlacement: "center",
    },
  },
  luxury: {
    id: "luxury",
    name: "Luxury",
    description: "Dark gold hospitality card.",
    design: {
      backgroundColor: "#12100E",
      primaryColor: "#F6F1E7",
      accentColor: "#C9A227",
      frontText: "Welcome",
      backText: "Scan to visit",
      showLogo: true,
      logoSource: "profile",
      qrPlacement: "center",
    },
  },
  business: {
    id: "business",
    name: "Business",
    description: "Corporate navy card for professionals.",
    design: {
      backgroundColor: "#0F172A",
      primaryColor: "#F8FAFC",
      accentColor: "#38BDF8",
      frontText: "Connect",
      backText: "Scan to open profile",
      showLogo: true,
      logoSource: "profile",
      qrPlacement: "bottom",
    },
  },
  gradient: {
    id: "gradient",
    name: "Gradient",
    description: "Violet-to-cyan promotional card.",
    design: {
      backgroundColor: "#2E1065",
      primaryColor: "#F5F3FF",
      accentColor: "#22D3EE",
      frontText: "One tap",
      backText: "Scan to open",
      showLogo: true,
      logoSource: "profile",
      qrPlacement: "center",
    },
  },
  dark: {
    id: "dark",
    name: "Dark",
    description: "High-contrast charcoal NFC card.",
    design: {
      backgroundColor: "#0B1020",
      primaryColor: "#F8FAFC",
      accentColor: "#A78BFA",
      frontText: "Tap to connect",
      backText: "Scan or tap",
      showLogo: true,
      logoSource: "profile",
      qrPlacement: "bottom",
    },
  },
  restaurant: {
    id: "restaurant",
    name: "Restaurant",
    description: "Warm food-service card.",
    design: {
      backgroundColor: "#3B1D0F",
      primaryColor: "#FFF7ED",
      accentColor: "#F59E0B",
      frontText: "View menu",
      backText: "Scan for the menu",
      showLogo: true,
      logoSource: "profile",
      qrPlacement: "center",
    },
  },
  hotel: {
    id: "hotel",
    name: "Hotel",
    description: "Guest card for rooms and services.",
    design: {
      backgroundColor: "#1A1612",
      primaryColor: "#F5EDE0",
      accentColor: "#D4AF37",
      frontText: "Your stay",
      backText: "Scan to explore",
      showLogo: true,
      logoSource: "profile",
      qrPlacement: "center",
    },
  },
  personal: {
    id: "personal",
    name: "Personal",
    description: "Soft identity card for people.",
    design: {
      backgroundColor: "#EEF4F1",
      primaryColor: "#16382E",
      accentColor: "#1B6B5A",
      frontText: "Let's connect",
      backText: "Scan my profile",
      showLogo: true,
      logoSource: "profile",
      qrPlacement: "bottom",
    },
  },
  professional: {
    id: "professional",
    name: "Professional",
    description: "Blue identity card for specialists.",
    design: {
      backgroundColor: "#0D47A1",
      primaryColor: "#F8FAFC",
      accentColor: "#90CAF9",
      frontText: "Tap to connect",
      backText: "Scan or tap",
      showLogo: true,
      logoSource: "profile",
      qrPlacement: "center",
    },
  },
};

export const DEFAULT_CARD_DESIGN: CardDesign = {
  preset: "minimal",
  ...CARD_PRESET_REGISTRY.minimal.design,
};

export function defaultCardDesignForType(type: string): CardDesign {
  const preset: CardPresetId =
    type === "HOTEL"
      ? "hotel"
      : type === "RESTAURANT" || type === "CAFETERIA"
        ? "restaurant"
        : type === "PERSONAL"
          ? "personal"
          : type === "PORTFOLIO"
            ? "personal"
          : type === "DOCTOR" || type === "ENGINEER" || type === "PROFESSIONAL"
            ? "professional"
          : type === "BUSINESS" || type === "INDIVIDUAL_BUSINESS" || type === "ORGANIZATION"
            ? "business"
            : "minimal";
  return { preset, ...CARD_PRESET_REGISTRY[preset].design };
}

export function applyCardPreset(preset: CardPresetId, current?: Partial<CardDesign>): CardDesign {
  return {
    preset,
    ...CARD_PRESET_REGISTRY[preset].design,
    frontText: current?.frontText ?? CARD_PRESET_REGISTRY[preset].design.frontText,
    backText: current?.backText ?? CARD_PRESET_REGISTRY[preset].design.backText,
  };
}
