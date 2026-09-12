import { useEffect, useState, type ReactNode } from "react";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { friendlyError } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ImageUpload } from "@/components/profile/ImageUpload";
import { TagInput } from "@/components/profile/FieldEditors";
import { MenuItemRow } from "@/components/admin/MenuItemRow";
import type { AdminProfile, MenuCategory, MenuItem } from "@/types";

export function AdminMenuBuilder({ profile }: { profile: AdminProfile }) {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [itemOpen, setItemOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  async function load() {
    const data = await api.get<{ categories: MenuCategory[] }>(`/api/admin/profiles/${profile.id}/menu`);
    setCategories(data.categories);
    setActiveId((current) => current ?? data.categories[0]?.id ?? null);
  }

  useEffect(() => {
    void load().catch((err) => toast.error(friendlyError(err)));
  }, [profile.id]);

  const active = categories.find((c) => c.id === activeId) ?? categories[0];

  async function addCategory() {
    if (!newCategory.trim()) return;
    try {
      const data = await api.post<{ category: MenuCategory }>(`/api/admin/profiles/${profile.id}/menu/categories`, {
        name: newCategory.trim(),
      });
      setCategories((prev) => [...prev, { ...data.category, items: data.category.items ?? [] }]);
      setActiveId(data.category.id);
      setNewCategory("");
    } catch (err) {
      toast.error(friendlyError(err));
    }
  }

  async function renameCategory(category: MenuCategory) {
    const name = window.prompt("Category name", category.name);
    if (!name?.trim()) return;
    try {
      await api.patch(`/api/admin/menu/categories/${category.id}`, { name: name.trim() });
      setCategories((prev) => prev.map((c) => (c.id === category.id ? { ...c, name: name.trim() } : c)));
    } catch (err) {
      toast.error(friendlyError(err));
    }
  }

  async function onCategoryDrag(event: DragEndEvent) {
    const { active: drag, over } = event;
    if (!over || drag.id === over.id) return;
    const oldIndex = categories.findIndex((c) => c.id === drag.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    const next = arrayMove(categories, oldIndex, newIndex);
    setCategories(next);
    await api.patch(`/api/admin/profiles/${profile.id}/menu/categories/reorder`, {
      orderedIds: next.map((c) => c.id),
    });
  }

  async function onItemDrag(event: DragEndEvent) {
    if (!active) return;
    const { active: drag, over } = event;
    if (!over || drag.id === over.id) return;
    const oldIndex = active.items.findIndex((i) => i.id === drag.id);
    const newIndex = active.items.findIndex((i) => i.id === over.id);
    const items = arrayMove(active.items, oldIndex, newIndex);
    setCategories((prev) => prev.map((c) => (c.id === active.id ? { ...c, items } : c)));
    await api.patch("/api/admin/menu/items/reorder", { orderedIds: items.map((i) => i.id) });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Menu</h2>
          <p className="text-xs text-muted-foreground">Photo, name, and price. Compact list — same as the public page.</p>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Breakfast, Lunch..."
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="w-48"
          />
          <Button onClick={() => void addCategory()}>
            <Plus className="h-4 w-4" /> Add category
          </Button>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-2xl border bg-white p-10 text-center">
          <p className="font-medium">No categories yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Start with Breakfast, Lunch, Drinks, or anything they serve.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[180px_1fr]">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => void onCategoryDrag(e)}>
            <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {categories.map((category) => (
                  <SortableRow key={category.id} id={category.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(category.id)}
                      className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm ${
                        category.id === active?.id ? "border-primary bg-white" : "bg-white/70"
                      }`}
                    >
                      <span>{category.name}</span>
                      <span className="text-xs text-muted-foreground">{category.items.length}</span>
                    </button>
                  </SortableRow>
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {active && (
            <div className="rounded-xl border bg-white p-3">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold">{active.name}</h3>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => void renameCategory(active)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setDeleteCategoryId(active.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditing(null);
                      setItemOpen(true);
                    }}
                  >
                    <Plus className="h-3.5 w-3.5" /> Item
                  </Button>
                </div>
              </div>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => void onItemDrag(e)}>
                <SortableContext items={active.items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                  <div className="divide-y divide-black/5">
                    {active.items.map((item) => (
                      <SortableRow key={item.id} id={item.id}>
                        <MenuItemRow
                          item={item}
                          onEdit={() => {
                            setEditing(item);
                            setItemOpen(true);
                          }}
                        />
                      </SortableRow>
                    ))}
                    {active.items.length === 0 && (
                      <p className="py-6 text-center text-sm text-muted-foreground">No items in this category yet.</p>
                    )}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}
        </div>
      )}

      {itemOpen && active && (
        <ItemDialog
          profileId={profile.id}
          categoryId={active.id}
          item={editing}
          simple={profile.type === "CAFETERIA"}
          onClose={() => setItemOpen(false)}
          onSaved={async () => {
            setItemOpen(false);
            await load();
          }}
        />
      )}

      <AlertDialog open={Boolean(deleteCategoryId)} onOpenChange={() => setDeleteCategoryId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this category?</AlertDialogTitle>
            <AlertDialogDescription>All items inside it will be removed from the public menu.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!deleteCategoryId) return;
                await api.delete(`/api/admin/menu/categories/${deleteCategoryId}`);
                setCategories((prev) => prev.filter((c) => c.id !== deleteCategoryId));
                setDeleteCategoryId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SortableRow({ id, children }: { id: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className="flex items-center gap-1">
      <button type="button" className="text-muted-foreground" {...attributes} {...listeners}>
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function ItemDialog({
  profileId,
  categoryId,
  item,
  simple,
  onClose,
  onSaved,
}: {
  profileId: string;
  categoryId: string;
  item: MenuItem | null;
  simple: boolean;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [name, setName] = useState(item?.name ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [price, setPrice] = useState(String(item?.price ?? ""));
  const [currency, setCurrency] = useState(item?.currency ?? "ETB");
  const [available, setAvailable] = useState(item?.available ?? true);
  const [featured, setFeatured] = useState(item?.featured ?? false);
  const [tags, setTags] = useState<string[]>(item?.tags ?? []);
  const [image, setImage] = useState<string | null>(item?.image ?? null);
  const [imageUrl, setImageUrl] = useState<string | null>(item?.imageUrl ?? null);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      const payload = {
        categoryId,
        name,
        description,
        price: Number(price),
        currency,
        available,
        featured: simple ? false : featured,
        tags: simple ? [] : tags,
        image,
      };
      if (item) await api.patch(`/api/admin/menu/items/${item.id}`, payload);
      else await api.post("/api/admin/menu/items", payload);
      toast.success("Item saved");
      await onSaved();
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? "Edit item" : "Add item"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <ImageUpload
            label="Photo"
            kind="menu"
            profileId={profileId}
            previewUrl={imageUrl}
            onChange={(media) => {
              setImage(media?.id ?? null);
              setImageUrl(media?.url ?? null);
            }}
          />
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Price</Label>
              <Input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Input value={currency} onChange={(e) => setCurrency(e.target.value)} />
            </div>
          </div>
          <label className="flex items-center justify-between text-sm">
            Available
            <Switch checked={available} onCheckedChange={setAvailable} />
          </label>
          {!simple && (
            <>
              <label className="flex items-center justify-between text-sm">
                Featured
                <Switch checked={featured} onCheckedChange={setFeatured} />
              </label>
              <div className="space-y-2">
                <Label>Tags</Label>
                <TagInput value={tags} onChange={setTags} placeholder="Spicy, Vegan..." />
              </div>
            </>
          )}
          <div className="flex justify-end gap-2">
            {item && (
              <Button
                variant="outline"
                onClick={async () => {
                  await api.delete(`/api/admin/menu/items/${item.id}`);
                  await onSaved();
                }}
              >
                Delete
              </Button>
            )}
            <Button disabled={busy} onClick={() => void save()}>
              Save item
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
