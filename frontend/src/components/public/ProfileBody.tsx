import type { ProfileSectionItem, PublicProfile } from "@/types";
import { AboutSection } from "./AboutSection";
import { ActionButtons } from "./ActionButtons";
import { ContactSection } from "./ContactSection";
import { ContentBlock } from "./ContentBlock";
import { GallerySection } from "./GallerySection";
import { LocationSection } from "./LocationSection";
import { MenuSection } from "./MenuSection";
import { OpeningHours } from "./OpeningHours";
import { ProfileFooter } from "./ProfileFooter";
import { ProfileHeader } from "./ProfileHeader";
import { RoomsSection } from "./RoomsSection";
import { AmenitiesSection, ServicesSection } from "./ServicesSection";
import { SocialLinks } from "./SocialLinks";
import { siteMaxClass, type PublicTone } from "./tone";

export function ProfileBody({
  profile,
  tone,
  hideName = false,
  compact = false,
}: {
  profile: PublicProfile;
  tone: PublicTone;
  hideName?: boolean;
  compact?: boolean;
}) {
  const sections = (profile.sections ?? []).filter((section) => section.visible !== false);

  return (
    <div className={compact ? "space-y-5 pb-24 pt-5" : `${siteMaxClass()} space-y-10 pb-16 pt-8 md:space-y-14 md:pb-24`}>
      {!hideName && <ProfileHeader profile={profile} tone={tone} />}
      {!compact && <ActionButtons profile={profile} />}
      {sections.length > 0
        ? sections.map((section) => (
            <div key={section.id} id={section.type}>
              <SectionView section={section} profile={profile} tone={tone} />
            </div>
          ))
        : <LegacyBody profile={profile} tone={tone} />}
    </div>
  );
}

function SectionView({
  section,
  profile,
  tone,
}: {
  section: ProfileSectionItem;
  profile: PublicProfile;
  tone: PublicTone;
}) {
  switch (section.type) {
    case "hero":
      return null;
    case "about":
      return <AboutSection profile={profile} tone={tone} />;
    case "hours":
      return profile.openingHours.length > 0 ? <OpeningHours profile={profile} tone={tone} /> : null;
    case "services":
      return <ServicesSection profile={profile} tone={tone} />;
    case "rooms":
      return <RoomsSection profile={profile} tone={tone} />;
    case "amenities":
      return <AmenitiesSection profile={profile} tone={tone} />;
    case "menu":
      return <MenuSection profile={profile} tone={tone} />;
    case "gallery":
      return <GallerySection images={profile.media.gallery} tone={tone} />;
    case "contact":
      return <ContactSection profile={profile} tone={tone} />;
    case "social":
      return <SocialLinks profile={profile} tone={tone} />;
    case "location":
      return <LocationSection profile={profile} tone={tone} />;
    case "footer":
      return <ProfileFooter profile={profile} tone={tone} />;
    default:
      return <ContentBlock section={section} tone={tone} />;
  }
}

function LegacyBody({ profile, tone }: { profile: PublicProfile; tone: PublicTone }) {
  const hasMenu = profile.type === "RESTAURANT" || profile.type === "CAFETERIA";
  const isHotel = profile.type === "HOTEL";
  const isBusiness = profile.type === "BUSINESS" || profile.type === "INDIVIDUAL_BUSINESS" || profile.type === "ORGANIZATION";
  return (
    <>
      <div id="about"><AboutSection profile={profile} tone={tone} /></div>
      {profile.openingHours.length > 0 && <div id="hours"><OpeningHours profile={profile} tone={tone} /></div>}
      {isHotel && <div id="rooms"><RoomsSection profile={profile} tone={tone} /></div>}
      {(isHotel || isBusiness) && <div id="services"><ServicesSection profile={profile} tone={tone} /></div>}
      {isHotel && <div id="amenities"><AmenitiesSection profile={profile} tone={tone} /></div>}
      {hasMenu && <div id="menu"><MenuSection profile={profile} tone={tone} /></div>}
      <div id="contact"><ContactSection profile={profile} tone={tone} /></div>
      <div id="gallery"><GallerySection images={profile.media.gallery} tone={tone} /></div>
      <div id="social"><SocialLinks profile={profile} tone={tone} /></div>
      <div id="location"><LocationSection profile={profile} tone={tone} /></div>
      <ProfileFooter profile={profile} tone={tone} />
    </>
  );
}
