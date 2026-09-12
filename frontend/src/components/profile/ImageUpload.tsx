import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { cn, friendlyError } from "@/lib/utils";
import type { AdminProfile, MediaItem } from "@/types";

type ImageUploadProps = {
  value?: string | null;
  previewUrl?: string | null;
  kind: string;
  profileId?: string;
  label: string;
  hint?: string;
  aspect?: "square" | "wide" | "circle";
  onChange: (media: MediaItem | null) => void | Promise<void>;
  onProfile?: (profile: AdminProfile) => void;
};

export function ImageUpload({
  previewUrl,
  kind,
  profileId,
  label,
  hint,
  aspect = "wide",
  onChange,
  onProfile,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const shown = localPreview || previewUrl || null;

  useEffect(() => {
    if (!localPreview) return;
    return () => URL.revokeObjectURL(localPreview);
  }, [localPreview]);

  useEffect(() => {
    if (previewUrl) setLocalPreview(null);
  }, [previewUrl]);

  async function onFile(file?: File) {
    if (!file) return;
    setUploading(true);
    const preview = URL.createObjectURL(file);
    setLocalPreview(preview);
    try {
      const data = await api.upload<{ media: MediaItem; profile?: AdminProfile | null }>(
        "/api/admin/media/upload",
        file,
        {
          kind,
          ...(profileId ? { profileId } : {}),
        },
      );
      if (data.profile && onProfile) {
        onProfile(data.profile);
      } else {
        await onChange(data.media);
      }
      toast.success("Image saved");
    } catch (err) {
      setLocalPreview(null);
      toast.error(friendlyError(err, "Could not save this image"));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{label}</p>
        {shown && (
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => {
              setLocalPreview(null);
              void onChange(null);
            }}
          >
            Remove
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={cn(
          "relative flex w-full items-center justify-center overflow-hidden border border-dashed border-border bg-muted/40 text-muted-foreground transition hover:border-primary/40 hover:bg-muted",
          aspect === "wide" && "h-44 rounded-xl",
          aspect === "square" && "h-40 w-full max-w-56 rounded-xl",
          aspect === "circle" && "h-36 w-full max-w-56 rounded-[28px]",
        )}
      >
        {shown ? (
          <img src={shown} alt={label} className="h-full w-full object-contain" />
        ) : (
          <span className="flex flex-col items-center gap-2 text-xs">
            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
            {hint ?? "Upload image"}
          </span>
        )}
        {uploading && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/60">
            <Loader2 className="h-6 w-6 animate-spin" />
          </span>
        )}
        {shown && !uploading && (
          <span className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white">
            <X className="h-3 w-3" />
          </span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,image/*"
        className="hidden"
        onChange={(e) => void onFile(e.target.files?.[0])}
      />
    </div>
  );
}
