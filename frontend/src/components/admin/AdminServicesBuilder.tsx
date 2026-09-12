import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { friendlyError } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageUpload } from "@/components/profile/ImageUpload";
import type { HotelServiceItem } from "@/types";

const icons = ["sparkles", "wifi", "car", "coffee", "plane", "waves", "dumbbell", "utensils"];

export function AdminServicesBuilder({ profileId }: { profileId: string }) {
  const [services, setServices] = useState<HotelServiceItem[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<HotelServiceItem | null>(null);

  async function load() {
    const data = await api.get<{ services: HotelServiceItem[] }>(`/api/admin/profiles/${profileId}/services`);
    setServices(data.services);
  }

  useEffect(() => {
    void load().catch((err) => toast.error(friendlyError(err)));
  }, [profileId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl">Hotel services</h2>
          <p className="text-sm text-muted-foreground">WiFi, breakfast, parking, airport pickup, pool, room service.</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Add service
        </Button>
      </div>
      {services.length === 0 ? (
        <div className="rounded-2xl border bg-white p-10 text-center">
          <p className="font-medium">No services yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Add the experiences guests should see on the public page.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {services.map((service) => (
            <button
              key={service.id}
              type="button"
              className="rounded-2xl border bg-white p-5 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#1b6b5a]/20 hover:shadow-lg"
              onClick={() => {
                setEditing(service);
                setOpen(true);
              }}
            >
              {service.imageUrl && <img src={service.imageUrl} alt="" className="mb-3 h-32 w-full rounded-xl object-cover" />}
              <p className="font-medium">{service.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{service.description}</p>
            </button>
          ))}
        </div>
      )}
      {open && (
        <ServiceDialog
          profileId={profileId}
          service={editing}
          onClose={() => setOpen(false)}
          onSaved={async () => {
            setOpen(false);
            await load();
          }}
        />
      )}
    </div>
  );
}

function ServiceDialog({
  profileId,
  service,
  onClose,
  onSaved,
}: {
  profileId: string;
  service: HotelServiceItem | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [name, setName] = useState(service?.name ?? "");
  const [description, setDescription] = useState(service?.description ?? "");
  const [icon, setIcon] = useState(service?.icon ?? "sparkles");
  const [image, setImage] = useState<string | null>(service?.image ?? null);
  const [imageUrl, setImageUrl] = useState<string | null>(service?.imageUrl ?? null);

  async function save() {
    try {
      const payload = { name, description, icon, image };
      if (service) await api.patch(`/api/admin/services/${service.id}`, payload);
      else await api.post(`/api/admin/profiles/${profileId}/services`, payload);
      toast.success("Service saved");
      await onSaved();
    } catch (err) {
      toast.error(friendlyError(err));
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{service ? "Edit service" : "Add service"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <ImageUpload
            label="Image"
            kind="service"
            profileId={profileId}
            previewUrl={imageUrl}
            onChange={(media) => {
              setImage(media?.id ?? null);
              setImageUrl(media?.url ?? null);
            }}
          />
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Airport pickup" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Icon</Label>
            <select className="h-10 w-full rounded-md border px-3 text-sm" value={icon} onChange={(e) => setIcon(e.target.value)}>
              {icons.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            {service && (
              <Button
                variant="outline"
                onClick={async () => {
                  await api.delete(`/api/admin/services/${service.id}`);
                  await onSaved();
                }}
              >
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            )}
            <Button onClick={() => void save()}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
