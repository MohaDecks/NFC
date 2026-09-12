import type { Request, Response } from "express";
import { MenuCategory } from "../models/MenuCategory";
import { MenuItem } from "../models/MenuItem";
import { AppError } from "../utils/AppError";
import { created, ok } from "../utils/response";
import { routeParam } from "../utils/params";
import type { AuthedRequest } from "../middleware/auth";
import { assertMedia, getProfileOrThrow } from "../services/profileService";
import { typeHasMenu } from "../../../shared/profileTypes";
import { writeAudit } from "../services/audit";

function refId(value: unknown) {
  if (value && typeof value === "object" && "_id" in value) {
    return String((value as { _id: unknown })._id);
  }
  return String(value);
}

function imageUrl(image: unknown) {
  if (image && typeof image === "object") {
    const doc = image as { secureUrl?: string; url?: string };
    return doc.secureUrl || doc.url || null;
  }
  return null;
}

function serializeCategory(category: InstanceType<typeof MenuCategory>, items: InstanceType<typeof MenuItem>[] = []) {
  return {
    id: category.id,
    name: category.name,
    description: category.description,
    sortOrder: category.sortOrder,
    items: items.map((item) => ({
      id: item.id,
      categoryId: item.category.toString(),
      name: item.name,
      description: item.description,
      price: item.price,
      currency: item.currency,
      image: item.image ? refId(item.image) : null,
      imageUrl: imageUrl(item.image),
      available: item.available,
      featured: item.featured,
      tags: item.tags,
      sortOrder: item.sortOrder,
    })),
  };
}

async function menuProfile(req: Request) {
  const profile = await getProfileOrThrow(routeParam(req, "id"));
  if (!typeHasMenu(profile.type)) {
    throw new AppError(400, "This profile type does not have a menu", "NO_MENU");
  }
  return profile;
}

export async function getMenu(req: Request, res: Response) {
  const profile = await menuProfile(req);
  const categories = await MenuCategory.find({ profile: profile._id }).sort({ sortOrder: 1, createdAt: 1 });
  const items = await MenuItem.find({ profile: profile._id }).sort({ sortOrder: 1, createdAt: 1 }).populate("image");
  return ok(res, {
    categories: categories.map((category) =>
      serializeCategory(category, items.filter((item) => item.category.toString() === category.id)),
    ),
  });
}

export async function createCategory(req: Request, res: Response) {
  const admin = (req as AuthedRequest).user;
  const profile = await menuProfile(req);
  const count = await MenuCategory.countDocuments({ profile: profile._id });
  const category = await MenuCategory.create({
    profile: profile._id,
    name: req.body.name,
    description: req.body.description ?? "",
    sortOrder: count,
  });
  await writeAudit(admin, "MENU_CREATED", { id: profile.id, name: `${profile.name} / ${category.name}` });
  return created(res, { category: serializeCategory(category) });
}

async function getCategory(categoryId: string) {
  const category = await MenuCategory.findById(categoryId);
  if (!category) throw new AppError(404, "Category not found", "CATEGORY_NOT_FOUND");
  return category;
}

export async function updateCategory(req: Request, res: Response) {
  const admin = (req as AuthedRequest).user;
  const category = await getCategory(routeParam(req, "id"));
  if (req.body.name) category.name = req.body.name;
  if (typeof req.body.description === "string") category.description = req.body.description;
  await category.save();
  await writeAudit(admin, "MENU_UPDATED", { id: category.id, name: category.name });
  return ok(res, { category: serializeCategory(category) });
}

export async function deleteCategory(req: Request, res: Response) {
  const admin = (req as AuthedRequest).user;
  const category = await getCategory(routeParam(req, "id"));
  await MenuItem.deleteMany({ category: category._id });
  await writeAudit(admin, "MENU_DELETED", { id: category.id, name: category.name });
  await category.deleteOne();
  return ok(res, { deleted: true });
}

export async function reorderCategories(req: Request, res: Response) {
  const profile = await menuProfile(req);
  const ids = req.body.orderedIds as string[];
  await Promise.all(ids.map((id, index) => MenuCategory.updateOne({ _id: id, profile: profile._id }, { sortOrder: index })));
  return ok(res, { reordered: true });
}

export async function createItem(req: Request, res: Response) {
  const admin = (req as AuthedRequest).user;
  const category = await getCategory(req.body.categoryId);
  const count = await MenuItem.countDocuments({ category: category._id });
  const image = await assertMedia(req.body.image);
  const item = await MenuItem.create({
    profile: category.profile,
    category: category._id,
    name: req.body.name,
    description: req.body.description ?? "",
    price: req.body.price,
    currency: req.body.currency ?? "ETB",
    image: image?._id ?? null,
    available: req.body.available ?? true,
    featured: req.body.featured ?? false,
    tags: req.body.tags ?? [],
    sortOrder: count,
  });
  await item.populate("image");
  await writeAudit(admin, "MENU_CREATED", { id: item.id, name: item.name });
  return created(res, { item: serializeCategory(category, [item]).items[0] });
}

async function getItem(itemId: string) {
  const item = await MenuItem.findById(itemId);
  if (!item) throw new AppError(404, "Menu item not found", "ITEM_NOT_FOUND");
  return item;
}

export async function updateItem(req: Request, res: Response) {
  const admin = (req as AuthedRequest).user;
  const item = await getItem(routeParam(req, "id"));
  const body = req.body as Record<string, unknown>;
  if (typeof body.name === "string") item.name = body.name;
  if (typeof body.description === "string") item.description = body.description;
  if (typeof body.price === "number") item.price = body.price;
  if (typeof body.currency === "string") item.currency = body.currency;
  if (typeof body.available === "boolean") item.available = body.available;
  if (typeof body.featured === "boolean") item.featured = body.featured;
  if (Array.isArray(body.tags)) item.tags = body.tags as string[];
  if ("image" in body) item.image = (await assertMedia(body.image as string | null))?._id ?? null;
  if (typeof body.categoryId === "string") {
    const category = await getCategory(body.categoryId);
    item.category = category._id;
  }
  await item.save();
  await item.populate("image");
  await writeAudit(admin, "MENU_UPDATED", { id: item.id, name: item.name });
  return ok(res, { item: serializeCategory({ id: item.category.toString(), name: "", description: "", sortOrder: 0 } as never, [item]).items[0] });
}

export async function deleteItem(req: Request, res: Response) {
  const admin = (req as AuthedRequest).user;
  const item = await getItem(routeParam(req, "id"));
  await writeAudit(admin, "MENU_DELETED", { id: item.id, name: item.name });
  await item.deleteOne();
  return ok(res, { deleted: true });
}

export async function reorderItems(req: Request, res: Response) {
  const ids = req.body.orderedIds as string[];
  await Promise.all(ids.map((id, index) => MenuItem.updateOne({ _id: id }, { sortOrder: index })));
  return ok(res, { reordered: true });
}

export async function listAllMenus(_req: Request, res: Response) {
  const categories = await MenuCategory.find().sort({ sortOrder: 1, createdAt: 1 }).limit(80).populate("profile");
  const items = await MenuItem.find({
    category: { $in: categories.map((category) => category._id) },
  })
    .sort({ sortOrder: 1, createdAt: 1 })
    .populate("image");

  return ok(res, {
    categories: categories.map((category) => {
      const profile =
        category.profile && typeof category.profile === "object" && "name" in category.profile
          ? (category.profile as unknown as { id?: string; _id?: unknown; name?: string })
          : null;
      return {
        ...serializeCategory(
          category,
          items.filter((item) => item.category.toString() === category.id),
        ),
        profileId: profile ? String(profile.id ?? profile._id ?? category.profile) : "",
        profileName: profile?.name ?? "",
      };
    }),
  });
}
