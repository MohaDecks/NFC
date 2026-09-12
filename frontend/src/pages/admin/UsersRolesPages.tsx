import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { MENU_MATRIX, matrixFromPermissions, permissionsFromMatrix, type MenuAction } from "@shared/permissions";
import { api } from "@/lib/api";
import { friendlyError } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAdmin } from "@/hooks/useAdmin";
import type { Admin } from "@/types";

type RoleRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  permissions: string[];
  status: string;
  system: boolean;
  users: number;
};

type CountyRow = { id: string; name: string; status: string };
type CityRow = { id: string; name: string; countyId: string; county?: { id: string; name: string } | null };

function PageShell({
  title,
  hint,
  action,
  children,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export function UsersPage() {
  const navigate = useNavigate();
  const { can } = useAdmin();
  const [admins, setAdmins] = useState<Admin[]>([]);

  async function load() {
    const data = await api.get<{ admins: Admin[] }>("/api/admin/users");
    setAdmins(data.admins);
  }
  useEffect(() => { void load().catch((err) => toast.error(friendlyError(err))); }, []);

  return (
    <PageShell
      title="Users"
      action={can("users.create") && (
        <Button className="rounded-full bg-[#5b5ce6] hover:bg-[#4F46E5]" onClick={() => navigate("/admin/users/new")}>
          + Add User
        </Button>
      )}
    >
      <div className="overflow-hidden rounded-[22px] border border-[#EEEFF3] bg-white">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="font-medium">Email</th>
              <th className="font-medium">Role</th>
              <th className="font-medium">County / City</th>
              <th className="pr-5 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id} className="border-t border-[#F1F2F6]">
                <td className="px-5 py-3 font-medium">{admin.name}</td>
                <td className="text-slate-500">{admin.email}</td>
                <td className="text-[#5b5ce6]">{admin.role?.name ?? "—"}</td>
                <td className="text-slate-500">{admin.city?.name || admin.county?.name || "—"}</td>
                <td className="pr-5 text-right">
                  {can("users.edit") && (
                    <button type="button" className="mr-2 text-[#5b5ce6]" onClick={() => navigate(`/admin/users/${admin.id}/edit`)}>
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                  {can("users.delete") && (
                    <button
                      type="button"
                      className="text-red-500"
                      onClick={async () => {
                        if (!window.confirm(`Delete ${admin.name}?`)) return;
                        try {
                          await api.delete(`/api/admin/users/${admin.id}`);
                          toast.success("User deleted");
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
    </PageShell>
  );
}

export function UserFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [counties, setCounties] = useState<CountyRow[]>([]);
  const [cities, setCities] = useState<CityRow[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  const [countyId, setCountyId] = useState("");
  const [cityId, setCityId] = useState("");
  const [busy, setBusy] = useState(false);

  const cityOptions = useMemo(
    () => cities.filter((city) => !countyId || city.countyId === countyId),
    [cities, countyId],
  );

  useEffect(() => {
    void Promise.all([
      api.get<{ roles: RoleRow[] }>("/api/admin/roles"),
      api.get<{ counties: CountyRow[] }>("/api/admin/counties"),
      api.get<{ cities: CityRow[] }>("/api/admin/cities"),
      id ? api.get<{ admin: Admin }>(`/api/admin/users/${id}`) : Promise.resolve(null),
    ]).then(([roleData, countyData, cityData, userData]) => {
      setRoles(roleData.roles.filter((role) => role.status === "ACTIVE"));
      setCounties(countyData.counties);
      setCities(cityData.cities);
      if (userData?.admin) {
        setName(userData.admin.name);
        setEmail(userData.admin.email);
        setRoleId(userData.admin.role?.id ?? "");
        setCountyId(userData.admin.county?.id ?? "");
        setCityId(userData.admin.city?.id ?? "");
      } else if (roleData.roles[0]) {
        setRoleId(roleData.roles[0].id);
      }
    }).catch((err) => toast.error(friendlyError(err)));
  }, [id]);

  return (
    <PageShell title={editing ? "Edit User" : "New User"}>
      <form
        className="max-w-4xl space-y-5 rounded-[22px] border border-[#EEEFF3] bg-white p-6"
        onSubmit={async (event) => {
          event.preventDefault();
          setBusy(true);
          try {
            const payload = { name, email, roleId, countyId: countyId || null, cityId: cityId || null, ...(password ? { password } : {}) };
            if (editing && id) await api.patch(`/api/admin/users/${id}`, payload);
            else await api.post("/api/admin/users", { ...payload, password });
            toast.success(editing ? "User updated" : "User created");
            navigate("/admin/users");
          } catch (err) {
            toast.error(friendlyError(err));
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Name *" value={name} onChange={setName} required />
          <Field label="Email *" value={email} onChange={setEmail} type="email" required />
          <Field label={editing ? "Password (leave blank to keep)" : "Password *"} value={password} onChange={setPassword} type="password" required={!editing} />
          <div className="space-y-2">
            <Label>Role *</Label>
            <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={roleId} onChange={(e) => setRoleId(e.target.value)} required>
              {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>County (optional)</Label>
            <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={countyId} onChange={(e) => { setCountyId(e.target.value); setCityId(""); }}>
              <option value="">Select county</option>
              {counties.map((county) => <option key={county.id} value={county.id}>{county.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>City (optional)</Label>
            <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={cityId} onChange={(e) => setCityId(e.target.value)} disabled={!countyId}>
              <option value="">Select city</option>
              {cityOptions.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}
            </select>
            <p className="text-xs text-muted-foreground">Link this user to a city in the selected county.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button className="rounded-full bg-[#5b5ce6] hover:bg-[#4F46E5]" disabled={busy}>{editing ? "Save User" : "Create User"}</Button>
          <Button type="button" variant="outline" className="rounded-full" onClick={() => navigate("/admin/users")}>Cancel</Button>
        </div>
      </form>
    </PageShell>
  );
}

export function RolesPage() {
  const navigate = useNavigate();
  const { can } = useAdmin();
  const [roles, setRoles] = useState<RoleRow[]>([]);

  async function load() {
    const data = await api.get<{ roles: RoleRow[] }>("/api/admin/roles");
    setRoles(data.roles);
  }
  useEffect(() => { void load().catch((err) => toast.error(friendlyError(err))); }, []);

  return (
    <PageShell
      title="Roles"
      action={can("roles.create") && (
        <Button className="rounded-full bg-[#5b5ce6] hover:bg-[#4F46E5]" onClick={() => navigate("/admin/roles/new")}>
          + Add Role
        </Button>
      )}
    >
      <div className="overflow-hidden rounded-[22px] border border-[#EEEFF3] bg-white">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="font-medium">Description</th>
              <th className="font-medium">Active</th>
              <th className="pr-5 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id} className="border-t border-[#F1F2F6]">
                <td className="px-5 py-3 font-medium">{role.name}</td>
                <td className="text-slate-500">{role.description || "—"}</td>
                <td>
                  <span className={role.status === "ACTIVE" ? "text-emerald-600" : "text-slate-400"}>
                    {role.status === "ACTIVE" ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="pr-5 text-right">
                  {can("roles.edit") && (
                    <button type="button" className="mr-2 text-[#5b5ce6]" onClick={() => navigate(`/admin/roles/${role.id}/edit`)}>
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                  {can("roles.delete") && !role.system && (
                    <button
                      type="button"
                      className="text-red-500"
                      onClick={async () => {
                        if (!window.confirm(`Delete ${role.name}?`)) return;
                        try {
                          await api.delete(`/api/admin/roles/${role.id}`);
                          toast.success("Role deleted");
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
    </PageShell>
  );
}

export function RoleFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    void api.get<{ role: RoleRow }>(`/api/admin/roles/${id}`).then((data) => {
      setName(data.role.name);
      setDescription(data.role.description);
      setActive(data.role.status === "ACTIVE");
    }).catch((err) => toast.error(friendlyError(err)));
  }, [id]);

  return (
    <PageShell title={editing ? "Edit Role" : "New Role"}>
      <form
        className="max-w-3xl space-y-5 rounded-[22px] border border-[#EEEFF3] bg-white p-6"
        onSubmit={async (event) => {
          event.preventDefault();
          setBusy(true);
          try {
            const payload = { name, description, status: active ? "ACTIVE" : "INACTIVE" };
            if (editing && id) await api.patch(`/api/admin/roles/${id}`, payload);
            else await api.post("/api/admin/roles", payload);
            toast.success(editing ? "Role updated" : "Role created");
            navigate("/admin/roles");
          } catch (err) {
            toast.error(friendlyError(err));
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <Field label="Name *" value={name} onChange={setName} required />
          <label className="flex h-10 items-center gap-2 text-sm">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            Is Active
          </label>
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <textarea className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <Button className="rounded-full bg-[#5b5ce6] hover:bg-[#4F46E5]" disabled={busy}>{editing ? "Save Role" : "Create Role"}</Button>
          <Button type="button" variant="outline" className="rounded-full" onClick={() => navigate("/admin/roles")}>Cancel</Button>
        </div>
      </form>
    </PageShell>
  );
}

export function PermissionsPage() {
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [roleId, setRoleId] = useState("");
  const [selected, setSelected] = useState<Record<string, MenuAction[]>>({});
  const [busy, setBusy] = useState(false);
  const role = roles.find((item) => item.id === roleId);
  const locked = role?.slug === "super_admin";

  async function load() {
    const data = await api.get<{ roles: RoleRow[] }>("/api/admin/roles");
    setRoles(data.roles);
    const current = data.roles.find((item) => item.id === roleId) ?? data.roles[0];
    if (current) {
      setRoleId(current.id);
      setSelected(matrixFromPermissions(current.permissions));
    }
  }

  useEffect(() => { void load().catch((err) => toast.error(friendlyError(err))); }, []);

  function toggle(menuId: string, action: MenuAction, on: boolean) {
    if (locked) return;
    setSelected((current) => {
      const next = new Set(current[menuId] ?? []);
      if (on) next.add(action);
      else next.delete(action);
      if (on && action !== "view") next.add("view");
      return { ...current, [menuId]: [...next] };
    });
  }

  return (
    <PageShell
      title="Permissions"
      hint="Toggle permissions for each menu. These are applied per role."
      action={
        <div className="flex items-center gap-2">
          <select
            className="h-10 rounded-md border bg-background px-3 text-sm"
            value={roleId}
            onChange={(e) => {
              const next = roles.find((item) => item.id === e.target.value);
              setRoleId(e.target.value);
              if (next) setSelected(matrixFromPermissions(next.permissions));
            }}
          >
            {roles.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <Button variant="outline" className="rounded-full" onClick={() => void load()}>Refresh</Button>
          <Button
            className="rounded-full bg-[#5b5ce6] hover:bg-[#4F46E5]"
            disabled={busy || locked}
            onClick={async () => {
              if (!roleId) return;
              setBusy(true);
              try {
                await api.patch(`/api/admin/roles/${roleId}`, { permissions: permissionsFromMatrix(selected) });
                toast.success("Permissions saved");
                await load();
              } catch (err) {
                toast.error(friendlyError(err));
              } finally {
                setBusy(false);
              }
            }}
          >
            Save Permissions
          </Button>
        </div>
      }
    >
      {locked && <p className="text-sm text-amber-700">Super Admin always has every permission.</p>}
      <div className="overflow-hidden rounded-[22px] border border-[#EEEFF3] bg-white">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-5 py-3 font-medium">Menu</th>
              <th className="font-medium">Parent</th>
              <th className="font-medium">View</th>
              <th className="font-medium">Add</th>
              <th className="font-medium">Update</th>
              <th className="pr-5 font-medium">Delete</th>
            </tr>
          </thead>
          <tbody>
            {MENU_MATRIX.map((row) => {
              const actions = selected[row.id] ?? [];
              return (
                <tr key={row.id} className="border-t border-[#F1F2F6]">
                  <td className="px-5 py-3 font-medium">{row.label}</td>
                  <td className="text-slate-500">{row.parent}</td>
                  {(["view", "add", "update", "delete"] as MenuAction[]).map((action) => (
                    <td key={action} className="py-3">
                      {row.actions[action] ? (
                        <Switch
                          checked={actions.includes(action) || locked}
                          disabled={locked}
                          onCheckedChange={(on) => toggle(row.id, action, on)}
                        />
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type={type} value={value} required={required} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
