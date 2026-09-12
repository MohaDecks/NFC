import { Router } from "express";
import rateLimit from "express-rate-limit";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middleware/validate";
import { requireAdmin, requirePermission } from "../middleware/auth";
import { upload } from "../middleware/upload";
import {
  adminAccountSchema,
  categorySchema,
  citySchema,
  countySchema,
  createAdminSchema,
  createItemSchema,
  createProfileSchema,
  createRoomSchema,
  createServiceSchema,
  designSchema,
  itemSchema,
  loginSchema,
  passwordSchema,
  reorderSchema,
  roleSchema,
  roomSchema,
  sectionSchema,
  serviceSchema,
  updateAdminSchema,
  updateProfileSchema,
  profileTypeSchema,
  cardDesignSchema,
  nfcCardSchema,
} from "../validators/schemas";
import { login, logout, me } from "../controllers/adminAuthController";
import { getAnalytics, getAuditLogs, getDashboard } from "../controllers/adminDashboardController";
import {
  activateProfile,
  blockProfile,
  createProfile,
  deactivateProfile,
  deleteProfile,
  getProfile,
  listProfiles,
  publishProfile,
  unblockProfile,
  unpublishProfile,
  unverifyProfile,
  updateDesign,
  updateProfile,
  verifyProfile,
} from "../controllers/adminProfileController";
import {
  createCategory,
  createItem,
  deleteCategory,
  deleteItem,
  getMenu,
  listAllMenus,
  reorderCategories,
  reorderItems,
  updateCategory,
  updateItem,
} from "../controllers/menuController";
import {
  createService,
  deleteService,
  listAllServices,
  listServices,
  reorderServices,
  updateService,
} from "../controllers/serviceController";
import { deleteMedia, listMedia, uploadMedia } from "../controllers/mediaController";
import { changePassword, createAdmin, deleteAdmin, getAdmin, listAdmins, updateAdmin, updateMe } from "../controllers/adminUsersController";
import { getOwnedAnalytics } from "../controllers/analyticsController";
import { createSection, deleteSection, listAllSections, listSections, reorderSections, updateSection } from "../controllers/sectionController";
import { createRoom, deleteRoom, listAllRooms, listRooms, updateRoom } from "../controllers/roomController";
import { getBranding, removeBrandingLogo, updateBranding, uploadBrandingLogo } from "../controllers/brandingController";
import { createRole, deleteRole, getRole, listRoles, updateRole } from "../controllers/roleController";
import {
  createCity,
  createCounty,
  deleteCity,
  deleteCounty,
  listCities,
  listCounties,
  updateCity,
  updateCounty,
} from "../controllers/locationController";
import { createProfileType, deleteProfileType, listProfileTypes, updateProfileType } from "../controllers/profileTypeController";
import { createCardDesign, deleteCardDesign, listCardDesigns, updateCardDesign } from "../controllers/cardDesignController";
import { createCard, deleteCard, getCard, listCards, updateCard } from "../controllers/nfcCardController";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts. Try again shortly.", code: "RATE_LIMITED" },
});

export const adminAuthRouter = Router();
adminAuthRouter.post("/login", authLimiter, validate(loginSchema), asyncHandler(login));
adminAuthRouter.post("/logout", asyncHandler(logout));
adminAuthRouter.get("/me", requireAdmin, asyncHandler(me));

export const adminRouter = Router();
adminRouter.use(requireAdmin);

adminRouter.get("/branding", requirePermission("settings.view"), asyncHandler(getBranding));
adminRouter.patch("/branding", requirePermission("settings.edit"), asyncHandler(updateBranding));
adminRouter.post("/branding/logo", requirePermission("settings.edit"), upload.single("file"), asyncHandler(uploadBrandingLogo));
adminRouter.delete("/branding/logo", requirePermission("settings.edit"), asyncHandler(removeBrandingLogo));

adminRouter.get("/dashboard", requirePermission("profiles.view", "analytics.view"), asyncHandler(getDashboard));
adminRouter.get("/analytics", requirePermission("analytics.view"), asyncHandler(getAnalytics));
adminRouter.get("/audit-logs", requirePermission("audit.view"), asyncHandler(getAuditLogs));

adminRouter.get("/profiles", requirePermission("profiles.view"), asyncHandler(listProfiles));
adminRouter.post("/profiles", requirePermission("profiles.create"), validate(createProfileSchema), asyncHandler(createProfile));
adminRouter.get("/profiles/:id", requirePermission("profiles.view"), asyncHandler(getProfile));
adminRouter.patch("/profiles/:id", requirePermission("profiles.edit"), validate(updateProfileSchema), asyncHandler(updateProfile));
adminRouter.delete("/profiles/:id", requirePermission("profiles.delete"), asyncHandler(deleteProfile));
adminRouter.post("/profiles/:id/verify", requirePermission("profiles.verify"), asyncHandler(verifyProfile));
adminRouter.post("/profiles/:id/unverify", requirePermission("profiles.verify"), asyncHandler(unverifyProfile));
adminRouter.post("/profiles/:id/activate", requirePermission("profiles.publish"), asyncHandler(activateProfile));
adminRouter.post("/profiles/:id/deactivate", requirePermission("profiles.publish"), asyncHandler(deactivateProfile));
adminRouter.post("/profiles/:id/publish", requirePermission("profiles.publish"), asyncHandler(publishProfile));
adminRouter.post("/profiles/:id/unpublish", requirePermission("profiles.publish"), asyncHandler(unpublishProfile));
adminRouter.post("/profiles/:id/block", requirePermission("profiles.publish"), asyncHandler(blockProfile));
adminRouter.post("/profiles/:id/unblock", requirePermission("profiles.publish"), asyncHandler(unblockProfile));
adminRouter.patch("/profiles/:id/design", requirePermission("design.edit"), validate(designSchema), asyncHandler(updateDesign));
adminRouter.get("/profiles/:id/analytics", requirePermission("analytics.view"), asyncHandler(getOwnedAnalytics));

adminRouter.get("/sections", requirePermission("content.view"), asyncHandler(listAllSections));
adminRouter.get("/profiles/:id/sections", requirePermission("content.view"), asyncHandler(listSections));
adminRouter.post("/profiles/:id/sections", requirePermission("content.create"), validate(sectionSchema), asyncHandler(createSection));
adminRouter.patch("/profiles/:id/sections/reorder", requirePermission("content.edit"), validate(reorderSchema), asyncHandler(reorderSections));
adminRouter.patch("/sections/:id", requirePermission("content.edit"), asyncHandler(updateSection));
adminRouter.delete("/sections/:id", requirePermission("content.delete"), asyncHandler(deleteSection));

adminRouter.get("/rooms", requirePermission("content.view"), asyncHandler(listAllRooms));
adminRouter.get("/profiles/:id/rooms", requirePermission("content.view"), asyncHandler(listRooms));
adminRouter.post("/profiles/:id/rooms", requirePermission("content.create"), validate(createRoomSchema), asyncHandler(createRoom));
adminRouter.patch("/rooms/:id", requirePermission("content.edit"), validate(roomSchema), asyncHandler(updateRoom));
adminRouter.delete("/rooms/:id", requirePermission("content.delete"), asyncHandler(deleteRoom));

adminRouter.get("/profiles/:id/menu", requirePermission("content.view"), asyncHandler(getMenu));
adminRouter.post("/profiles/:id/menu/categories", requirePermission("content.create"), validate(categorySchema), asyncHandler(createCategory));
adminRouter.patch("/profiles/:id/menu/categories/reorder", requirePermission("content.edit"), validate(reorderSchema), asyncHandler(reorderCategories));
adminRouter.get("/menus", requirePermission("content.view"), asyncHandler(listAllMenus));
adminRouter.patch("/menu/categories/:id", requirePermission("content.edit"), validate(categorySchema.partial()), asyncHandler(updateCategory));
adminRouter.delete("/menu/categories/:id", requirePermission("content.delete"), asyncHandler(deleteCategory));
adminRouter.post("/menu/items", requirePermission("content.create"), validate(createItemSchema), asyncHandler(createItem));
adminRouter.patch("/menu/items/reorder", requirePermission("content.edit"), validate(reorderSchema), asyncHandler(reorderItems));
adminRouter.patch("/menu/items/:id", requirePermission("content.edit"), validate(itemSchema), asyncHandler(updateItem));
adminRouter.delete("/menu/items/:id", requirePermission("content.delete"), asyncHandler(deleteItem));

adminRouter.get("/profiles/:id/services", requirePermission("content.view"), asyncHandler(listServices));
adminRouter.post("/profiles/:id/services", requirePermission("content.create"), validate(createServiceSchema), asyncHandler(createService));
adminRouter.patch("/profiles/:id/services/reorder", requirePermission("content.edit"), validate(reorderSchema), asyncHandler(reorderServices));
adminRouter.get("/services", requirePermission("content.view"), asyncHandler(listAllServices));
adminRouter.patch("/services/:id", requirePermission("content.edit"), validate(serviceSchema), asyncHandler(updateService));
adminRouter.delete("/services/:id", requirePermission("content.delete"), asyncHandler(deleteService));

adminRouter.get("/media", requirePermission("media.view"), asyncHandler(listMedia));
adminRouter.post("/media/upload", requirePermission("media.upload"), upload.single("file"), asyncHandler(uploadMedia));
adminRouter.delete("/media/:id", requirePermission("media.delete"), asyncHandler(deleteMedia));

adminRouter.get("/users", requirePermission("users.view"), asyncHandler(listAdmins));
adminRouter.post("/users", requirePermission("users.create"), validate(createAdminSchema), asyncHandler(createAdmin));
adminRouter.get("/users/:id", requirePermission("users.view"), asyncHandler(getAdmin));
adminRouter.patch("/users/:id", requirePermission("users.edit"), validate(updateAdminSchema), asyncHandler(updateAdmin));
adminRouter.delete("/users/:id", requirePermission("users.delete"), asyncHandler(deleteAdmin));
adminRouter.patch("/account", requirePermission("settings.edit"), validate(adminAccountSchema), asyncHandler(updateMe));
adminRouter.post("/account/password", validate(passwordSchema), asyncHandler(changePassword));

adminRouter.get("/roles", requirePermission("roles.view"), asyncHandler(listRoles));
adminRouter.post("/roles", requirePermission("roles.create"), validate(roleSchema), asyncHandler(createRole));
adminRouter.get("/roles/:id", requirePermission("roles.view"), asyncHandler(getRole));
adminRouter.patch("/roles/:id", requirePermission("roles.edit"), validate(roleSchema.partial()), asyncHandler(updateRole));
adminRouter.delete("/roles/:id", requirePermission("roles.delete"), asyncHandler(deleteRole));

adminRouter.get("/counties", requirePermission("locations.view", "users.view", "users.create"), asyncHandler(listCounties));
adminRouter.post("/counties", requirePermission("locations.create"), validate(countySchema), asyncHandler(createCounty));
adminRouter.patch("/counties/:id", requirePermission("locations.edit"), validate(countySchema.partial()), asyncHandler(updateCounty));
adminRouter.delete("/counties/:id", requirePermission("locations.delete"), asyncHandler(deleteCounty));

adminRouter.get("/cities", requirePermission("locations.view", "users.view", "users.create"), asyncHandler(listCities));
adminRouter.post("/cities", requirePermission("locations.create"), validate(citySchema), asyncHandler(createCity));
adminRouter.patch("/cities/:id", requirePermission("locations.edit"), validate(citySchema.partial()), asyncHandler(updateCity));
adminRouter.delete("/cities/:id", requirePermission("locations.delete"), asyncHandler(deleteCity));

adminRouter.get("/countries", requirePermission("locations.view", "users.view", "users.create"), asyncHandler(listCounties));
adminRouter.post("/countries", requirePermission("locations.create"), validate(countySchema), asyncHandler(createCounty));
adminRouter.patch("/countries/:id", requirePermission("locations.edit"), validate(countySchema.partial()), asyncHandler(updateCounty));
adminRouter.delete("/countries/:id", requirePermission("locations.delete"), asyncHandler(deleteCounty));
adminRouter.get("/countries/:countryId/cities", requirePermission("locations.view", "users.view", "users.create"), asyncHandler(listCities));

adminRouter.get("/profile-types", requirePermission("types.view", "profiles.view", "profiles.create"), asyncHandler(listProfileTypes));
adminRouter.post("/profile-types", requirePermission("types.create"), validate(profileTypeSchema), asyncHandler(createProfileType));
adminRouter.patch("/profile-types/:id", requirePermission("types.edit"), validate(profileTypeSchema.partial()), asyncHandler(updateProfileType));
adminRouter.delete("/profile-types/:id", requirePermission("types.delete"), asyncHandler(deleteProfileType));

adminRouter.get("/card-designs", requirePermission("design.view"), asyncHandler(listCardDesigns));
adminRouter.post("/card-designs", requirePermission("design.edit"), validate(cardDesignSchema), asyncHandler(createCardDesign));
adminRouter.patch("/card-designs/:id", requirePermission("design.edit"), validate(cardDesignSchema), asyncHandler(updateCardDesign));
adminRouter.delete("/card-designs/:id", requirePermission("design.edit"), asyncHandler(deleteCardDesign));

adminRouter.get("/cards", requirePermission("nfc.view"), asyncHandler(listCards));
adminRouter.post("/cards", requirePermission("nfc.manage"), validate(nfcCardSchema), asyncHandler(createCard));
adminRouter.get("/cards/:id", requirePermission("nfc.view"), asyncHandler(getCard));
adminRouter.patch("/cards/:id", requirePermission("nfc.manage"), validate(nfcCardSchema.partial()), asyncHandler(updateCard));
adminRouter.delete("/cards/:id", requirePermission("nfc.manage"), asyncHandler(deleteCard));
