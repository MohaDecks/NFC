import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { friendlyError } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdmin } from "@/hooks/useAdmin";

type ProfileTypeRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  status: string;
  defaultSections: string[];
  isSystem: boolean;
};

export function ProfileTypesPage() {
  const { can } = useAdmin();
  const [rows, setRows] = useState<ProfileTypeRow[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editing, setEditing] = useState<ProfileTypeRow | null>(null);

  async function load() {
    const data = await api.get<{ profileTypes: ProfileTypeRow[] }>("/api/admin/profile-types");
    setRows(data.profileTypes);
  }
  useEffect(() => {
    void load().catch((err) => toast.error(friendlyError(err)));
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Profile Types</h1>
        <p className="mt-1 text-sm text-muted-foreground">Dynamic types power the universal profile engine. Add new kinds without rewriting the app.</p>
      </div>
      {can("types.create") && (
        <form
          className="grid gap-3 rounded-[22px] border border-[#EEEFF3] bg-white p-4 md:grid-cols-[1fr_1.4fr_auto] md:items-end"
          onSubmit={async (event) => {
            event.preventDefault();
            try {
              if (editing) await api.patch(`/api/admin/profile-types/${editing.id}`, { name, description });
              else await api.post("/api/admin/profile-types", { name, description });
              setName("");
              setDescription("");
              setEditing(null);
              toast.success(editing ? "Type updated" : "Type created");
              await load();
            } catch (err) {
              toast.error(friendlyError(err));
            }
          }}
        >
          <div className="space-y-2">
            <Label>{editing ? "Edit type" : "New type"}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Architect" required />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Public profile for architects" />
          </div>
          <div className="flex gap-2">
            <Button className="rounded-full bg-[#1565C0] hover:bg-[#0D47A1]">{editing ? "Save" : "+ Add Type"}</Button>
            {editing && (
              <Button type="button" variant="outline" className="rounded-full" onClick={() => { setEditing(null); setName(""); setDescription(""); }}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      )}
      <div className="overflow-hidden rounded-[22px] border border-[#EEEFF3] bg-white">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="font-medium">Slug</th>
              <th className="font-medium">Sections</th>
              <th className="font-medium">Status</th>
              <th className="pr-5 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-[#F1F2F6]">
                <td className="px-5 py-3 font-medium">{row.name}</td>
                <td className="font-mono text-xs text-slate-500">{row.slug}</td>
                <td className="text-slate-500">{row.defaultSections.length}</td>
                <td className={row.status === "ACTIVE" ? "text-emerald-600" : "text-slate-400"}>{row.status}</td>
                <td className="pr-5 text-right">
                  {can("types.edit") && (
                    <button
                      type="button"
                      className="mr-2 text-[#1565C0]"
                      onClick={async () => {
                        await api.patch(`/api/admin/profile-types/${row.id}`, { status: row.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" });
                        await load();
                      }}
                    >
                      {row.status === "ACTIVE" ? "Deactivate" : "Activate"}
                    </button>
                  )}
                  {can("types.edit") && (
                    <button type="button" className="mr-2 text-[#1565C0]" onClick={() => { setEditing(row); setName(row.name); setDescription(row.description); }}>
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                  {can("types.delete") && !row.isSystem && (
                    <button
                      type="button"
                      className="text-red-500"
                      onClick={async () => {
                        if (!window.confirm(`Delete ${row.name}?`)) return;
                        try {
                          await api.delete(`/api/admin/profile-types/${row.id}`);
                          toast.success("Type deleted");
                          await load();
                        } catch (err) {
                          toast.error(friendlyError(err));
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
