import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { cn, friendlyError } from "@/lib/utils";
import type { MediaItem } from "@/types";

type ImageUploadProps = {
  value?: string | null;
  previewUrl?: string | null;
  kind: string;
  profileId?: string;
  label: string;
  hint?: string;
  aspect?: "square" | "wide" | "circle";
  onChange: (media: MediaItem | null) => void;
};

export function ImageUpload({
  previewUrl,
  kind,
  profileId,
  label,
  hint,
  aspect = "wide",
  onChange,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function onFile(file?: File) {
    if (!file) return;
    setUploading(true);
    try {
      const data = await api.upload<{ media: MediaItem }>("/api/admin/media/upload", file, {
        kind,
        ...(profileId ? { profileId } : {}),
      });
      onChange(data.media);
    } catch (err) {
      toast.error(friendlyError(err, "Could not upload image"));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{label}</p>
        {previewUrl && (
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => onChange(null)}
          >
            Remove
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex w-full items-center justify-center overflow-hidden border border-dashed border-border bg-muted/40 text-muted-foreground transition hover:border-primary/40 hover:bg-muted",
          aspect === "wide" && "min-h-40 rounded-xl p-3",
          aspect === "square" && "min-h-36 w-full max-w-56 rounded-xl p-3",
          aspect === "circle" && "min-h-32 w-full max-w-56 rounded-[28px] p-3",
        )}
      >
        {previewUrl ? (
          <img src={previewUrl} alt={label} className="max-h-44 w-auto max-w-full object-contain" />
        ) : (
          <span className="flex flex-col items-center gap-2 text-xs">
            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
            {hint ?? "Upload image"}
          </span>
        )}
        {previewUrl && (
          <span className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white">
            <X className="h-3 w-3" />
          </span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void onFile(e.target.files?.[0])}
      />
    </div>
  );
}
