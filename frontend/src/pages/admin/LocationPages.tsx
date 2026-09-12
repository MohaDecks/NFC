import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { friendlyError } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdmin } from "@/hooks/useAdmin";

type CountyRow = { id: string; name: string; status: string; cities: number; code?: string; isoCode?: string; flag?: string };
type CityRow = { id: string; name: string; status: string; countyId: string; county?: { id: string; name: string } | null };

export function CountiesPage() {
  const { can } = useAdmin();
  const [rows, setRows] = useState<CountyRow[]>([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [isoCode, setIsoCode] = useState("");
  const [flag, setFlag] = useState("");
  const [editing, setEditing] = useState<CountyRow | null>(null);

  async function load() {
    const data = await api.get<{ countries?: CountyRow[]; counties: CountyRow[] }>("/api/admin/countries");
    setRows(data.countries ?? data.counties);
  }
  useEffect(() => { void load().catch((err) => toast.error(friendlyError(err))); }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Countries</h1>
          <p className="mt-1 text-sm text-muted-foreground">Dynamic countries used when creating profiles and assigning cities.</p>
        </div>
      </div>
      {can("locations.create") && (
        <form
          className="flex flex-wrap items-end gap-3 rounded-[22px] border border-[#EEEFF3] bg-white p-4"
          onSubmit={async (event) => {
            event.preventDefault();
            try {
              if (editing) await api.patch(`/api/admin/countries/${editing.id}`, { name, code, isoCode, flag });
              else await api.post("/api/admin/countries", { name, code, isoCode, flag });
              setName("");
              setCode("");
              setIsoCode("");
              setFlag("");
              setEditing(null);
              toast.success(editing ? "Country updated" : "Country added");
              await load();
            } catch (err) {
              toast.error(friendlyError(err));
            }
          }}
        >
          <div className="min-w-64 flex-1 space-y-2">
            <Label>{editing ? "Edit country" : "New country"}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ethiopia" required />
          </div>
          <div className="space-y-2">
            <Label>Code</Label>
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="ET" />
          </div>
          <div className="space-y-2">
            <Label>ISO</Label>
            <Input value={isoCode} onChange={(e) => setIsoCode(e.target.value)} placeholder="ETH" />
          </div>
          <div className="space-y-2">
            <Label>Flag</Label>
            <Input value={flag} onChange={(e) => setFlag(e.target.value)} placeholder="🇪🇹" />
          </div>
          <Button className="rounded-full bg-[#1565C0] hover:bg-[#0D47A1]">{editing ? "Save" : "+ Add Country"}</Button>
          {editing && (
            <Button type="button" variant="outline" className="rounded-full" onClick={() => { setEditing(null); setName(""); }}>
              Cancel
            </Button>
          )}
        </form>
      )}
      <div className="overflow-hidden rounded-[22px] border border-[#EEEFF3] bg-white">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="font-medium">Code</th>
              <th className="font-medium">ISO</th>
              <th className="font-medium">Cities</th>
              <th className="font-medium">Active</th>
              <th className="pr-5 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-[#F1F2F6]">
                <td className="px-5 py-3 font-medium">{row.flag ? `${row.flag} ` : ""}{row.name}</td>
                <td className="text-slate-500">{row.code || "—"}</td>
                <td className="text-slate-500">{row.isoCode || "—"}</td>
                <td className="text-slate-500">{row.cities}</td>
                <td className={row.status === "ACTIVE" ? "text-emerald-600" : "text-slate-400"}>{row.status === "ACTIVE" ? "Active" : "Inactive"}</td>
                <td className="pr-5 text-right">
                  {can("locations.edit") && (
                    <button type="button" className="mr-2 text-[#1565C0]" onClick={() => { setEditing(row); setName(row.name); setCode(row.code ?? ""); setIsoCode(row.isoCode ?? ""); setFlag(row.flag ?? ""); }}>
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                  {can("locations.delete") && (
                    <button
                      type="button"
                      className="text-red-500"
                      onClick={async () => {
                        if (!window.confirm(`Delete ${row.name}?`)) return;
                        try {
                          await api.delete(`/api/admin/countries/${row.id}`);
                          toast.success("Country deleted");
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

export function CitiesPage() {
  const { can } = useAdmin();
  const [rows, setRows] = useState<CityRow[]>([]);
  const [counties, setCounties] = useState<CountyRow[]>([]);
  const [name, setName] = useState("");
  const [countyId, setCountyId] = useState("");
  const [editing, setEditing] = useState<CityRow | null>(null);

  async function load() {
    const [cityData, countyData] = await Promise.all([
      api.get<{ cities: CityRow[] }>("/api/admin/cities"),
      api.get<{ countries?: CountyRow[]; counties: CountyRow[] }>("/api/admin/countries"),
    ]);
    setRows(cityData.cities);
    const list = countyData.countries ?? countyData.counties;
    setCounties(list);
    if (!countyId && list[0]) setCountyId(list[0].id);
  }
  useEffect(() => { void load().catch((err) => toast.error(friendlyError(err))); }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Cities</h1>
        <p className="mt-1 text-sm text-muted-foreground">Each city belongs to a country from the database.</p>
      </div>
      {can("locations.create") && (
        <form
          className="grid gap-3 rounded-[22px] border border-[#EEEFF3] bg-white p-4 md:grid-cols-[1fr_1fr_auto] md:items-end"
          onSubmit={async (event) => {
            event.preventDefault();
            try {
              if (editing) await api.patch(`/api/admin/cities/${editing.id}`, { name, countyId });
              else await api.post("/api/admin/cities", { name, countyId });
              setName("");
              setEditing(null);
              toast.success(editing ? "City updated" : "City added");
              await load();
            } catch (err) {
              toast.error(friendlyError(err));
            }
          }}
        >
          <div className="space-y-2">
            <Label>Country *</Label>
            <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={countyId} onChange={(e) => setCountyId(e.target.value)} required>
              {counties.map((county) => <option key={county.id} value={county.id}>{county.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>{editing ? "Edit city" : "New city"}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="City name" required />
          </div>
          <div className="flex gap-2">
            <Button className="rounded-full bg-[#5b5ce6] hover:bg-[#4F46E5]">{editing ? "Save" : "+ Add City"}</Button>
            {editing && (
              <Button type="button" variant="outline" className="rounded-full" onClick={() => { setEditing(null); setName(""); }}>Cancel</Button>
            )}
          </div>
        </form>
      )}
      <div className="overflow-hidden rounded-[22px] border border-[#EEEFF3] bg-white">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="font-medium">Country</th>
              <th className="font-medium">Active</th>
              <th className="pr-5 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-[#F1F2F6]">
                <td className="px-5 py-3 font-medium">{row.name}</td>
                <td className="text-slate-500">{row.county?.name ?? "—"}</td>
                <td className={row.status === "ACTIVE" ? "text-emerald-600" : "text-slate-400"}>{row.status === "ACTIVE" ? "Active" : "Inactive"}</td>
                <td className="pr-5 text-right">
                  {can("locations.edit") && (
                    <button type="button" className="mr-2 text-[#5b5ce6]" onClick={() => { setEditing(row); setName(row.name); setCountyId(row.countyId); }}>
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                  {can("locations.delete") && (
                    <button
                      type="button"
                      className="text-red-500"
                      onClick={async () => {
                        if (!window.confirm(`Delete ${row.name}?`)) return;
                        try {
                          await api.delete(`/api/admin/cities/${row.id}`);
                          toast.success("City deleted");
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
