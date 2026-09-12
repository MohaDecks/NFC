import { TEMPLATE_REGISTRY, defaultTemplateForType, isProfileType, type ProfileType, type TemplateId } from "@shared/profileTypes";
import type { PublicProfile } from "@/types";
import { MobileStickyActions } from "@/components/public/MobileStickyActions";
import { ThemeFrame } from "./ThemeFrame";
import { ModernTemplate } from "./ModernTemplate";
import { LuxuryTemplate } from "./LuxuryTemplate";
import { BusinessTemplate } from "./BusinessTemplate";
import { FoodTemplate } from "./FoodTemplate";
import { HotelTemplate } from "./HotelTemplate";
import { PersonalTemplate } from "./PersonalTemplate";
import { DoctorTemplate } from "./DoctorTemplate";
import { EngineerTemplate } from "./EngineerTemplate";
import { CafeteriaTemplate } from "./CafeteriaTemplate";
import { PortfolioTemplate } from "./PortfolioTemplate";

const components = {
  modern: ModernTemplate,
  luxury: LuxuryTemplate,
  business: BusinessTemplate,
  food: FoodTemplate,
  hotel: HotelTemplate,
  personal: PersonalTemplate,
  doctor: DoctorTemplate,
  engineer: EngineerTemplate,
  cafeteria: CafeteriaTemplate,
  portfolio: PortfolioTemplate,
} as const;

export function ProfileRenderer({
  profile,
  template,
  fullPage = false,
  className,
}: {
  profile: PublicProfile;
  template?: TemplateId;
  fullPage?: boolean;
  className?: string;
}) {
  const requested = template ?? profile.design.template;
  const meta = TEMPLATE_REGISTRY[requested];
  const resolved: TemplateId =
    profile.type === "HOTEL"
      ? "hotel"
      : profile.type === "RESTAURANT"
        ? "food"
        : profile.type === "DOCTOR"
          ? "doctor"
          : profile.type === "ENGINEER"
            ? "engineer"
            : profile.type === "CAFETERIA"
              ? "cafeteria"
              : meta && (!isProfileType(profile.type) || meta.compatibleTypes.includes(profile.type as ProfileType))
                ? requested
                : defaultTemplateForType(profile.type);
  const Template = components[resolved] ?? ModernTemplate;
  const hasOwnChrome = ["food", "hotel", "doctor", "personal", "engineer", "cafeteria", "portfolio", "modern", "business", "luxury"].includes(resolved);

  return (
    <ThemeFrame design={profile.design} className={className}>
      <Template profile={profile} />
      {fullPage && !hasOwnChrome && (
        <>
          <div className="h-16 md:hidden" />
          <MobileStickyActions profile={profile} />
        </>
      )}
    </ThemeFrame>
  );
}

export function getTemplateComponent(id: TemplateId) {
  return components[id] ?? ModernTemplate;
}
