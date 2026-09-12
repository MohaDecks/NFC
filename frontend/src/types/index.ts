import type {
  ButtonStyle,
  CoverStyle,
  FontId,
  ProfileStatus,
  PublishState,
  ProfileType,
  RadiusOption,
  RoomType,
  TemplateId,
} from "@shared/profileTypes";
import type { CardDesign } from "@shared/cardDesign";
import type { Permission } from "@shared/permissions";
import type { SectionType } from "@shared/sections";

export type AdminRole = {
  id: string;
  name: string;
  slug: string;
};

export type Admin = {
  id: string;
  name: string;
  email: string;
  status?: "ACTIVE" | "INACTIVE";
  lastLoginAt?: string | null;
  createdAt?: string;
  role?: AdminRole | null;
  county?: { id: string; name: string } | null;
  city?: { id: string; name: string } | null;
  permissions?: Permission[];
};

export type Contact = {
  phone: string;
  email: string;
  whatsapp: string;
  website: string;
};

export type LocationInfo = {
  address: string;
  city: string;
  country: string;
  countryId?: string | null;
  cityId?: string | null;
  mapsUrl: string;
  latitude?: number | null;
  longitude?: number | null;
};

export type OpeningHour = {
  day: string;
  open: string;
  close: string;
  closed: boolean;
};

export type SocialLink = {
  platform: string;
  url: string;
  username?: string;
};

export type Design = {
  template: TemplateId;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  font: FontId;
  buttonStyle: ButtonStyle;
  borderRadius: RadiusOption;
  coverStyle: CoverStyle;
};

export type ProfileOwner = {
  name: string;
  email: string;
  phone: string;
};

export type AdminProfile = {
  id: string;
  type: ProfileType;
  publicId: string;
  status: ProfileStatus;
  publishState?: PublishState;
  sections?: ProfileSectionItem[];
  isVerified: boolean;
  verifiedAt: string | null;
  verifiedBy: { id: string; name: string } | null;
  name: string;
  tagline: string;
  description: string;
  owner: ProfileOwner;
  contact: Contact;
  location: LocationInfo;
  cardDesign?: CardDesign;
  openingHours: OpeningHour[];
  amenities: string[];
  socialLinks: SocialLink[];
  design: Design;
  avatar: string | null;
  logo: string | null;
  cover: string | null;
  gallery: string[];
  avatarUrl: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  galleryUrls: string[];
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PublicMenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  imageUrl: string | null;
  available: boolean;
  featured: boolean;
  tags: string[];
};

export type PublicMenuCategory = {
  id: string;
  name: string;
  description?: string;
  items: PublicMenuItem[];
};

export type PublicService = {
  id: string;
  name: string;
  description: string;
  icon: string;
  imageUrl: string | null;
};

export type ProfileSectionItem = {
  id: string;
  type: SectionType;
  title: string;
  visible: boolean;
  sortOrder: number;
  content: Record<string, unknown>;
};

export type HotelRoomItem = {
  id: string;
  name: string;
  roomType?: RoomType;
  description: string;
  price: number;
  currency: string;
  capacity: number;
  beds?: number;
  amenities: string[];
  available: boolean;
  images?: string[];
  imageUrls: string[];
};

export type PublicProfile = {
  publicId: string;
  type: ProfileType;
  name: string;
  tagline: string;
  description: string;
  isVerified?: boolean;
  contact: Contact;
  location: LocationInfo;
  openingHours: OpeningHour[];
  amenities: string[];
  socialLinks: SocialLink[];
  design: Design;
  media: {
    avatarUrl: string | null;
    logoUrl: string | null;
    coverUrl: string | null;
    gallery: string[];
  };
  menu: PublicMenuCategory[];
  services: PublicService[];
  rooms?: HotelRoomItem[];
  sections?: ProfileSectionItem[];
};

export type MenuItem = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image: string | null;
  imageUrl: string | null;
  available: boolean;
  featured: boolean;
  tags: string[];
  sortOrder: number;
};

export type MenuCategory = {
  id: string;
  name: string;
  description?: string;
  sortOrder: number;
  items: MenuItem[];
};

export type HotelServiceItem = {
  id: string;
  name: string;
  description: string;
  icon: string;
  image: string | null;
  imageUrl: string | null;
  sortOrder: number;
};

export type MediaItem = {
  id: string;
  url: string;
  secureUrl?: string;
  kind: string;
  originalName: string;
  mimeType: string;
  size: number;
  profileName?: string;
  createdAt: string;
};

export type AnalyticsSummary = {
  totalViews: number;
  viewsToday: number;
  viewsThisWeek: number;
  viewsThisMonth: number;
};

export type AuditItem = {
  id: string;
  adminName: string;
  action: string;
  targetName: string;
  targetType: string;
  createdAt: string;
};

export function ownerToPublic(profile: AdminProfile, extras?: Partial<PublicProfile>): PublicProfile {
  return {
    publicId: profile.publicId,
    type: profile.type,
    name: profile.name,
    tagline: profile.tagline,
    description: profile.description,
    isVerified: profile.isVerified,
    contact: profile.contact,
    location: profile.location,
    openingHours: profile.openingHours,
    amenities: profile.amenities,
    socialLinks: profile.socialLinks,
    design: extras?.design ?? profile.design,
    media: {
      avatarUrl: profile.avatarUrl,
      logoUrl: profile.logoUrl,
      coverUrl: profile.coverUrl,
      gallery: profile.galleryUrls,
    },
    menu: extras?.menu ?? [],
    services: extras?.services ?? [],
    rooms: extras?.rooms ?? [],
    sections: extras?.sections ?? profile.sections ?? [],
  };
}
