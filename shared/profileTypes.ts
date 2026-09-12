export const PROFILE_TYPES = [
  "BUSINESS",
  "INDIVIDUAL_BUSINESS",
  "PERSONAL",
  "ORGANIZATION",
  "HOTEL",
  "RESTAURANT",
  "CAFETERIA",
  "DOCTOR",
  "ENGINEER",
  "PROFESSIONAL",
  "PORTFOLIO",
] as const;

export type ProfileType = (typeof PROFILE_TYPES)[number];

export const PROFILE_STATUS = ["ACTIVE", "INACTIVE", "BLOCKED"] as const;
export type ProfileStatus = (typeof PROFILE_STATUS)[number];

export const PUBLISH_STATES = ["DRAFT", "PUBLISHED"] as const;
export type PublishState = (typeof PUBLISH_STATES)[number];

export const TEMPLATE_IDS = ["modern", "luxury", "business", "food", "hotel", "personal", "doctor", "engineer", "cafeteria", "portfolio"] as const;
export type TemplateId = (typeof TEMPLATE_IDS)[number];

export const FONTS = [
  "Inter",
  "Playfair Display",
  "DM Sans",
  "Outfit",
  "Lora",
  "Poppins",
] as const;
export type FontId = (typeof FONTS)[number];

export const BUTTON_STYLES = ["rounded", "pill", "square"] as const;
export type ButtonStyle = (typeof BUTTON_STYLES)[number];

export const RADIUS_OPTIONS = ["none", "sm", "md", "lg", "full"] as const;
export type RadiusOption = (typeof RADIUS_OPTIONS)[number];

export const COVER_STYLES = ["full", "banner", "minimal"] as const;
export type CoverStyle = (typeof COVER_STYLES)[number];

export const ROOM_TYPES = ["single", "double", "twin", "deluxe", "suite", "family"] as const;
export type RoomType = (typeof ROOM_TYPES)[number];

export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  single: "Single",
  double: "Double",
  twin: "Twin",
  deluxe: "Deluxe",
  suite: "Suite",
  family: "Family",
};

export const NAV_ITEMS = [
  "dashboard",
  "profile",
  "design",
  "menu",
  "services",
  "media",
  "nfc",
  "analytics",
  "settings",
] as const;
export type NavItem = (typeof NAV_ITEMS)[number];

export type ProfileTypeConfig = {
  id: ProfileType;
  label: string;
  shortLabel: string;
  description: string;
  icon: "user" | "briefcase" | "building" | "users" | "hotel" | "utensils" | "coffee" | "stethoscope" | "wrench" | "badge" | "camera";
  highlights: string[];
  features: {
    menu: boolean;
    services: boolean;
    amenities: boolean;
    gallery: boolean;
    openingHours: boolean;
    socialLinks: boolean;
    jobTitle: boolean;
    logo: boolean;
    avatar: boolean;
  };
  templates: TemplateId[];
  nav: NavItem[];
};

export const PROFILE_TYPE_REGISTRY: Record<ProfileType, ProfileTypeConfig> = {
  PERSONAL: {
    id: "PERSONAL",
    label: "Individual (Personal)",
    shortLabel: "Personal",
    description: "A personal profile for professional or social use.",
    icon: "user",
    highlights: ["Digital business card", "Social media links", "Portfolio & more"],
    features: {
      menu: false,
      services: false,
      amenities: false,
      gallery: true,
      openingHours: false,
      socialLinks: true,
      jobTitle: true,
      logo: false,
      avatar: true,
    },
    templates: ["personal", "modern", "business"],
    nav: [
      "dashboard",
      "profile",
      "design",
      "media",
      "nfc",
      "analytics",
      "settings",
    ],
  },
  INDIVIDUAL_BUSINESS: {
    id: "INDIVIDUAL_BUSINESS",
    label: "Individual with business purpose",
    shortLabel: "Professional",
    description: "You are a sole proprietor applying for business use.",
    icon: "user",
    highlights: ["Personal + business tools", "Custom profile page", "NFC & QR support"],
    features: {
      menu: false,
      services: true,
      amenities: false,
      gallery: true,
      openingHours: true,
      socialLinks: true,
      jobTitle: true,
      logo: true,
      avatar: true,
    },
    templates: ["business", "personal", "modern"],
    nav: [
      "dashboard",
      "profile",
      "design",
      "services",
      "media",
      "nfc",
      "analytics",
      "settings",
    ],
  },
  BUSINESS: {
    id: "BUSINESS",
    label: "Business / Company",
    shortLabel: "Business",
    description: "A registered business or organization.",
    icon: "briefcase",
    highlights: ["Full business features", "Advanced customization", "Analytics & more"],
    features: {
      menu: false,
      services: true,
      amenities: false,
      gallery: true,
      openingHours: true,
      socialLinks: true,
      jobTitle: false,
      logo: true,
      avatar: false,
    },
    templates: ["business", "modern", "luxury"],
    nav: [
      "dashboard",
      "profile",
      "design",
      "services",
      "media",
      "nfc",
      "analytics",
      "settings",
    ],
  },
  ORGANIZATION: {
    id: "ORGANIZATION",
    label: "Organization / NGO",
    shortLabel: "Organization",
    description: "A non-profit, government or social organization.",
    icon: "users",
    highlights: ["Organizational profile", "Team members", "Events & donations"],
    features: {
      menu: false,
      services: true,
      amenities: false,
      gallery: true,
      openingHours: true,
      socialLinks: true,
      jobTitle: false,
      logo: true,
      avatar: false,
    },
    templates: ["business", "modern"],
    nav: [
      "dashboard",
      "profile",
      "design",
      "services",
      "media",
      "nfc",
      "analytics",
      "settings",
    ],
  },
  HOTEL: {
    id: "HOTEL",
    label: "Hotel",
    shortLabel: "Hotel",
    description: "Showcase rooms, amenities, and guest services in one tap.",
    icon: "hotel",
    highlights: ["Rooms & amenities", "Guest services", "Luxury presentation"],
    features: {
      menu: false,
      services: true,
      amenities: true,
      gallery: true,
      openingHours: true,
      socialLinks: true,
      jobTitle: false,
      logo: true,
      avatar: false,
    },
    templates: ["hotel", "luxury", "modern", "business"],
    nav: [
      "dashboard",
      "profile",
      "design",
      "services",
      "media",
      "nfc",
      "analytics",
      "settings",
    ],
  },
  RESTAURANT: {
    id: "RESTAURANT",
    label: "Restaurant",
    shortLabel: "Restaurant",
    description: "A living digital menu and restaurant website.",
    icon: "utensils",
    highlights: ["Digital menu", "Food gallery", "Opening hours"],
    features: {
      menu: true,
      services: false,
      amenities: false,
      gallery: true,
      openingHours: true,
      socialLinks: true,
      jobTitle: false,
      logo: true,
      avatar: false,
    },
    templates: ["food", "modern", "luxury"],
    nav: [
      "dashboard",
      "profile",
      "design",
      "menu",
      "media",
      "nfc",
      "analytics",
      "settings",
    ],
  },
  CAFETERIA: {
    id: "CAFETERIA",
    label: "Cafeteria",
    shortLabel: "Cafeteria",
    description: "A food-focused café website with a digital menu.",
    icon: "coffee",
    highlights: ["Food-focused menu", "Cafe branding", "Quick contact"],
    features: {
      menu: true,
      services: false,
      amenities: false,
      gallery: true,
      openingHours: true,
      socialLinks: true,
      jobTitle: false,
      logo: true,
      avatar: false,
    },
    templates: ["cafeteria", "food", "modern"],
    nav: [
      "dashboard",
      "profile",
      "design",
      "menu",
      "media",
      "nfc",
      "analytics",
      "settings",
    ],
  },
  DOCTOR: {
    id: "DOCTOR",
    label: "Doctor",
    shortLabel: "Doctor",
    description: "A public professional profile for a doctor or clinic.",
    icon: "stethoscope",
    highlights: ["Specialization", "Services & experience", "Booking CTA"],
    features: {
      menu: false,
      services: true,
      amenities: false,
      gallery: true,
      openingHours: true,
      socialLinks: true,
      jobTitle: true,
      logo: true,
      avatar: true,
    },
    templates: ["doctor", "personal", "business"],
    nav: ["dashboard", "profile", "design", "services", "media", "nfc", "analytics", "settings"],
  },
  ENGINEER: {
    id: "ENGINEER",
    label: "Engineer",
    shortLabel: "Engineer",
    description: "A portfolio-style profile for engineers and technical work.",
    icon: "wrench",
    highlights: ["Projects", "Skills", "Professional contact"],
    features: {
      menu: false,
      services: true,
      amenities: false,
      gallery: true,
      openingHours: false,
      socialLinks: true,
      jobTitle: true,
      logo: true,
      avatar: true,
    },
    templates: ["engineer", "personal", "business"],
    nav: ["dashboard", "profile", "design", "services", "media", "nfc", "analytics", "settings"],
  },
  PROFESSIONAL: {
    id: "PROFESSIONAL",
    label: "Professional",
    shortLabel: "Professional",
    description: "A clean digital presence for any independent professional.",
    icon: "badge",
    highlights: ["About & services", "Portfolio", "Social & location"],
    features: {
      menu: false,
      services: true,
      amenities: false,
      gallery: true,
      openingHours: false,
      socialLinks: true,
      jobTitle: true,
      logo: true,
      avatar: true,
    },
    templates: ["personal", "business", "modern"],
    nav: ["dashboard", "profile", "design", "services", "media", "nfc", "analytics", "settings"],
  },
  PORTFOLIO: {
    id: "PORTFOLIO",
    label: "Portfolio",
    shortLabel: "Portfolio",
    description: "A visual place to show work, photos, and projects.",
    icon: "camera",
    highlights: ["Gallery first", "Projects", "Personal brand"],
    features: {
      menu: false,
      services: true,
      amenities: false,
      gallery: true,
      openingHours: false,
      socialLinks: true,
      jobTitle: true,
      logo: true,
      avatar: true,
    },
    templates: ["portfolio", "personal", "modern"],
    nav: ["dashboard", "profile", "design", "services", "media", "nfc", "analytics", "settings"],
  },
};

const FALLBACK_TYPE: ProfileTypeConfig = {
  id: "PROFESSIONAL",
  label: "Custom",
  shortLabel: "Custom",
  description: "A custom digital profile.",
  icon: "badge",
  highlights: ["Custom sections", "NFC & QR", "Public website"],
  features: {
    menu: false,
    services: true,
    amenities: false,
    gallery: true,
    openingHours: true,
    socialLinks: true,
    jobTitle: true,
    logo: true,
    avatar: true,
  },
  templates: ["modern", "business", "personal"],
  nav: ["dashboard", "profile", "design", "media", "nfc", "analytics", "settings"],
};

export function resolveProfileType(type: string): ProfileTypeConfig {
  if (isProfileType(type)) return PROFILE_TYPE_REGISTRY[type];
  return {
    ...FALLBACK_TYPE,
    id: type as ProfileType,
    label: type.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase()) || "Custom",
    shortLabel: type.replaceAll("_", " ") || "Custom",
  };
}

export function typeLabel(type: string) {
  return resolveProfileType(type).label;
}

export const TYPE_USAGES = ["PLACE", "CARD", "BOTH"] as const;
export type TypeUsage = (typeof TYPE_USAGES)[number];

/** Professional is not a place profile. It is the old name for Business Card Register. */
export function isPlaceTypeSlug(slug: string) {
  return slug !== "PROFESSIONAL";
}

export const CARD_TYPE_ORDER = [
  "PERSONAL",
  "HOTEL",
  "CAFETERIA",
  "ENGINEER",
  "DOCTOR",
  "RESTAURANT",
  "BUSINESS",
  "PORTFOLIO",
  "INDIVIDUAL_BUSINESS",
  "ORGANIZATION",
] as const;

export function defaultUsageForType(slug: string): TypeUsage {
  return slug === "PROFESSIONAL" ? "CARD" : "BOTH";
}

export const TEMPLATE_REGISTRY: Record<
  TemplateId,
  {
    id: TemplateId;
    name: string;
    description: string;
    compatibleTypes: ProfileType[];
  }
> = {
  modern: {
    id: "modern",
    name: "Modern",
    description: "Clean white layout, large imagery, simple cards.",
    compatibleTypes: ["PERSONAL", "INDIVIDUAL_BUSINESS", "BUSINESS", "ORGANIZATION", "HOTEL", "RESTAURANT", "CAFETERIA", "DOCTOR", "ENGINEER", "PROFESSIONAL", "PORTFOLIO"],
  },
  luxury: {
    id: "luxury",
    name: "Luxury",
    description: "Elegant dark design with premium typography.",
    compatibleTypes: ["BUSINESS", "HOTEL", "RESTAURANT"],
  },
  business: {
    id: "business",
    name: "Business",
    description: "Professional corporate layout with strong contact actions.",
    compatibleTypes: ["PERSONAL", "INDIVIDUAL_BUSINESS", "BUSINESS", "ORGANIZATION", "HOTEL", "DOCTOR", "ENGINEER", "PROFESSIONAL", "PORTFOLIO"],
  },
  food: {
    id: "food",
    name: "Food",
    description: "Image-forward menu layout for restaurants and cafeterias.",
    compatibleTypes: ["RESTAURANT", "CAFETERIA"],
  },
  cafeteria: {
    id: "cafeteria",
    name: "Cafeteria",
    description: "Warm coffee-shop layout with a simple menu.",
    compatibleTypes: ["CAFETERIA"],
  },
  doctor: {
    id: "doctor",
    name: "Doctor",
    description: "Clean medical profile with booking and services.",
    compatibleTypes: ["DOCTOR"],
  },
  engineer: {
    id: "engineer",
    name: "Engineer",
    description: "Project-first layout for technical professionals.",
    compatibleTypes: ["ENGINEER"],
  },
  portfolio: {
    id: "portfolio",
    name: "Portfolio",
    description: "Visual gallery layout for creators and photographers.",
    compatibleTypes: ["PORTFOLIO", "PERSONAL", "PROFESSIONAL"],
  },
  hotel: {
    id: "hotel",
    name: "Hotel",
    description: "Hospitality layout for rooms, amenities, and guest services.",
    compatibleTypes: ["HOTEL"],
  },
  personal: {
    id: "personal",
    name: "Personal",
    description: "A premium personal identity website for professionals.",
    compatibleTypes: ["PERSONAL", "INDIVIDUAL_BUSINESS", "DOCTOR", "ENGINEER", "PROFESSIONAL", "PORTFOLIO"],
  },
};

export const BUSINESS_KIND_TYPES: ProfileType[] = [
  "BUSINESS",
  "INDIVIDUAL_BUSINESS",
  "ORGANIZATION",
  "HOTEL",
  "RESTAURANT",
  "CAFETERIA",
];

export function isBusinessKind(type: ProfileType) {
  return BUSINESS_KIND_TYPES.includes(type);
}

export const PRESET_COLORS = [
  { name: "Teal", value: "#1B6B5A" },
  { name: "Green", value: "#15803D" },
  { name: "Blue", value: "#1D4ED8" },
  { name: "Red", value: "#B91C1C" },
  { name: "Orange", value: "#C2410C" },
  { name: "Purple", value: "#6D28D9" },
  { name: "Black", value: "#171717" },
  { name: "Gold", value: "#B45309" },
] as const;

export const DEFAULT_DESIGN = {
  template: "modern" as TemplateId,
  primaryColor: "#1B6B5A",
  secondaryColor: "#F4EFE6",
  accentColor: "#C9A227",
  font: "Inter" as FontId,
  buttonStyle: "rounded" as ButtonStyle,
  borderRadius: "lg" as RadiusOption,
  coverStyle: "banner" as CoverStyle,
};

const TYPE_DESIGNS: Partial<Record<ProfileType, Partial<typeof DEFAULT_DESIGN>>> = {
  HOTEL: { template: "hotel", primaryColor: "#C9A227", secondaryColor: "#0B1B3A", accentColor: "#F5E6C8", font: "Playfair Display", coverStyle: "full" },
  RESTAURANT: { template: "food", primaryColor: "#C2410C", secondaryColor: "#FFF7ED", accentColor: "#F59E0B", font: "Poppins", coverStyle: "full" },
  CAFETERIA: { template: "cafeteria", primaryColor: "#16A34A", secondaryColor: "#052E16", accentColor: "#86EFAC", font: "Poppins", coverStyle: "banner" },
  DOCTOR: { template: "doctor", primaryColor: "#1D4ED8", secondaryColor: "#F0F7FF", accentColor: "#38BDF8", font: "DM Sans", coverStyle: "banner" },
  PERSONAL: { template: "personal", primaryColor: "#6D28D9", secondaryColor: "#F5F3FF", accentColor: "#A78BFA", font: "Outfit", coverStyle: "banner" },
  ENGINEER: { template: "engineer", primaryColor: "#2563EB", secondaryColor: "#0B1220", accentColor: "#38BDF8", font: "Inter", coverStyle: "full" },
  BUSINESS: { template: "business", primaryColor: "#1D4ED8", secondaryColor: "#EFF6FF", accentColor: "#38BDF8", font: "Inter", coverStyle: "banner" },
  ORGANIZATION: { template: "business", primaryColor: "#0F766E", secondaryColor: "#F0FDFA", accentColor: "#14B8A6", font: "Inter", coverStyle: "banner" },
  INDIVIDUAL_BUSINESS: { template: "business", primaryColor: "#1D4ED8", secondaryColor: "#F8FAFC", accentColor: "#38BDF8", font: "Inter", coverStyle: "banner" },
  PROFESSIONAL: { template: "personal", primaryColor: "#312E81", secondaryColor: "#EEF2FF", accentColor: "#818CF8", font: "DM Sans", coverStyle: "banner" },
  PORTFOLIO: { template: "portfolio", primaryColor: "#7C3AED", secondaryColor: "#2E1065", accentColor: "#E9D5FF", font: "Playfair Display", coverStyle: "full" },
};

export function defaultDesignForType(type: string) {
  const extra = isProfileType(type) ? TYPE_DESIGNS[type] : undefined;
  return { ...DEFAULT_DESIGN, template: defaultTemplateForType(type), ...extra };
}

export const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export function defaultOpeningHours() {
  return WEEKDAYS.map((day) => ({
    day,
    open: "08:00",
    close: "22:00",
    closed: day === "Sunday",
  }));
}

export function isProfileType(value: string): value is ProfileType {
  return (PROFILE_TYPES as readonly string[]).includes(value);
}

export function templatesForType(type: string): TemplateId[] {
  return resolveProfileType(type).templates;
}

export function defaultTemplateForType(type: string): TemplateId {
  return resolveProfileType(type).templates[0] ?? "modern";
}

export function typeHasMenu(type: string) {
  return resolveProfileType(type).features.menu;
}

export function typeHasServices(type: string) {
  return resolveProfileType(type).features.services;
}
