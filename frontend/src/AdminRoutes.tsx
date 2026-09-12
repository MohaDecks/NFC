import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProtectedAdmin } from "@/components/admin/ProtectedAdmin";
import { RequirePermission } from "@/components/admin/RequirePermission";
import { AdminLoginPage } from "@/pages/admin/LoginPage";
import { DashboardPage } from "@/pages/admin/DashboardPage";
import { ProfilesPage } from "@/pages/admin/ProfilesPage";
import { CreateProfilePage } from "@/pages/admin/CreateProfilePage";
import { ProfileDetailPage } from "@/pages/admin/ProfileDetailPage";
import {
  AnalyticsHubPage,
  AuditPage,
  CardDesignsPage,
  CardsPage,
  MediaLibraryPage,
  MenusHubPage,
  NfcHubPage,
  RoomsHubPage,
  ServicesHubPage,
  SettingsPage,
  TemplatesPage,
  ThemesPage,
} from "@/pages/admin/SimplePages";
import { PermissionsPage, RoleFormPage, RolesPage, UserFormPage, UsersPage } from "@/pages/admin/UsersRolesPages";
import { CitiesPage, CountiesPage } from "@/pages/admin/LocationPages";
import { BrandingPage } from "@/pages/admin/BrandingPage";
import { ProfileTypesPage } from "@/pages/admin/ProfileTypesPage";
import { CardsAdminPage } from "@/pages/admin/CardsAdminPage";
import { RegisterBusinessCardPage } from "@/pages/admin/RegisterBusinessCardPage";
import { CardTypesPage } from "@/pages/admin/CardTypesPage";
import {
  ComponentsPage,
  ContactHubPage,
  FontsPage,
  PagesHubPage,
  ProductsHubPage,
  SectionsHubPage,
  SocialHubPage,
} from "@/pages/admin/HubPages";

export function AdminRoutes() {
  return (
    <Routes>
      <Route path="login" element={<AdminLoginPage />} />
      <Route element={<ProtectedAdmin />}>
        <Route element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="profiles" element={<RequirePermission permission="profiles.view"><ProfilesPage /></RequirePermission>} />
          <Route path="profiles/new" element={<RequirePermission permission="profiles.create"><CreateProfilePage /></RequirePermission>} />
          <Route path="profiles/:id" element={<RequirePermission permission="profiles.view"><ProfileDetailPage /></RequirePermission>} />
          <Route path="profiles/:id/builder" element={<BuilderRedirect />} />
          <Route path="content/pages" element={<RequirePermission permission="content.view"><PagesHubPage /></RequirePermission>} />
          <Route path="content/sections" element={<RequirePermission permission="content.view"><SectionsHubPage /></RequirePermission>} />
          <Route path="content/products" element={<RequirePermission permission="content.view"><ProductsHubPage /></RequirePermission>} />
          <Route path="content/menus" element={<RequirePermission permission="content.view"><MenusHubPage /></RequirePermission>} />
          <Route path="content/rooms" element={<RequirePermission permission="content.view"><RoomsHubPage /></RequirePermission>} />
          <Route path="content/services" element={<RequirePermission permission="content.view"><ServicesHubPage /></RequirePermission>} />
          <Route path="content/gallery" element={<RequirePermission permission="media.view"><MediaLibraryPage /></RequirePermission>} />
          <Route path="content/media" element={<RequirePermission permission="media.view"><MediaLibraryPage /></RequirePermission>} />
          <Route path="design/templates" element={<RequirePermission permission="design.view"><TemplatesPage /></RequirePermission>} />
          <Route path="design/themes" element={<RequirePermission permission="design.view"><ThemesPage /></RequirePermission>} />
          <Route path="design/cards" element={<RequirePermission permission="design.view"><CardDesignsPage /></RequirePermission>} />
          <Route path="design/card-designs" element={<RequirePermission permission="design.view"><CardDesignsPage /></RequirePermission>} />
          <Route path="design/fonts" element={<RequirePermission permission="design.view"><FontsPage /></RequirePermission>} />
          <Route path="design/components" element={<RequirePermission permission="design.view"><ComponentsPage /></RequirePermission>} />
          <Route path="connections/nfc" element={<RequirePermission permission="nfc.view"><NfcHubPage /></RequirePermission>} />
          <Route path="connections/qr" element={<RequirePermission permission="nfc.view"><CardsPage /></RequirePermission>} />
          <Route path="connections/social" element={<RequirePermission permission="content.view"><SocialHubPage /></RequirePermission>} />
          <Route path="connections/contacts" element={<RequirePermission permission="content.view"><ContactHubPage /></RequirePermission>} />
          <Route path="analytics" element={<RequirePermission permission="analytics.view"><AnalyticsHubPage /></RequirePermission>} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="settings/branding" element={<RequirePermission permission="settings.view"><BrandingPage /></RequirePermission>} />
          <Route path="profile-types" element={<RequirePermission permission="types.view"><ProfileTypesPage /></RequirePermission>} />
          <Route path="users" element={<RequirePermission permission="users.view"><UsersPage /></RequirePermission>} />
          <Route path="users/new" element={<RequirePermission permission="users.create"><UserFormPage /></RequirePermission>} />
          <Route path="users/:id/edit" element={<RequirePermission permission="users.edit"><UserFormPage /></RequirePermission>} />
          <Route path="roles" element={<RequirePermission permission="roles.view"><RolesPage /></RequirePermission>} />
          <Route path="roles/new" element={<RequirePermission permission="roles.create"><RoleFormPage /></RequirePermission>} />
          <Route path="roles/:id/edit" element={<RequirePermission permission="roles.edit"><RoleFormPage /></RequirePermission>} />
          <Route path="permissions" element={<RequirePermission permission="roles.view"><PermissionsPage /></RequirePermission>} />
          <Route path="counties" element={<RequirePermission permission="locations.view"><CountiesPage /></RequirePermission>} />
          <Route path="cities" element={<RequirePermission permission="locations.view"><CitiesPage /></RequirePermission>} />
          <Route path="locations/countries" element={<RequirePermission permission="locations.view"><CountiesPage /></RequirePermission>} />
          <Route path="locations/cities" element={<RequirePermission permission="locations.view"><CitiesPage /></RequirePermission>} />
          <Route path="audit" element={<RequirePermission permission="audit.view"><AuditPage /></RequirePermission>} />
          <Route path="businesses" element={<Navigate to="/admin/profiles?kind=business" replace />} />
          <Route path="customers" element={<Navigate to="/admin/profiles?kind=customer" replace />} />
          <Route path="cards" element={<RequirePermission permission="nfc.view"><CardsAdminPage /></RequirePermission>} />
          <Route path="business-cards/register" element={<RequirePermission permission="profiles.create"><RegisterBusinessCardPage /></RequirePermission>} />
          <Route path="business-cards/types" element={<RequirePermission permission="types.view"><CardTypesPage /></RequirePermission>} />
          <Route path="menus" element={<Navigate to="/admin/content/menus" replace />} />
          <Route path="services" element={<Navigate to="/admin/content/services" replace />} />
          <Route path="media" element={<Navigate to="/admin/content/media" replace />} />
          <Route path="templates" element={<Navigate to="/admin/design/templates" replace />} />
          <Route path="nfc" element={<Navigate to="/admin/connections/nfc" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}

function BuilderRedirect() {
  const { id } = useParams();
  return <Navigate to={`/admin/profiles/${id}?tab=website`} replace />;
}
