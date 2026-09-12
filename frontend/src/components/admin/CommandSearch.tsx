import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { api } from "@/lib/api";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { AdminProfile } from "@/types";
import { typeLabel } from "@shared/profileTypes";

export function CommandSearch({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);

  useEffect(() => {
    if (!open) return;
    const handle = window.setTimeout(() => {
      void api
        .get<{ profiles: AdminProfile[] }>(`/api/admin/profiles?limit=8&search=${encodeURIComponent(query)}`)
        .then((data) => setProfiles(data.profiles))
        .catch(() => setProfiles([]));
    }, 180);
    return () => window.clearTimeout(handle);
  }, [open, query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-lg">
        <DialogTitle className="sr-only">Search</DialogTitle>
        <div className="flex items-center gap-2 border-b px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search profiles, menus, users..."
            className="border-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {profiles.map((profile) => (
            <button
              key={profile.id}
              type="button"
              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left hover:bg-secondary"
              onClick={() => {
                onOpenChange(false);
                navigate(`/admin/profiles/${profile.id}`);
              }}
            >
              <span>
                <span className="block text-sm font-medium">{profile.name}</span>
                <span className="text-xs text-muted-foreground">/{profile.publicId}</span>
              </span>
              <span className="text-xs text-muted-foreground">{typeLabel(profile.type)}</span>
            </button>
          ))}
          {profiles.length === 0 && <p className="px-3 py-8 text-center text-sm text-muted-foreground">No matches yet.</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
