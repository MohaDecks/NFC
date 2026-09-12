import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { PROFILE_TYPES, typeLabel } from "@shared/profileTypes";
import { api } from "@/lib/api";
import { friendlyError } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PublishBadge, StatusBadge, VerifiedBadge } from "@/components/admin/StatusBadges";
import type { AdminProfile } from "@/types";
import type { ProfileType } from "@shared/profileTypes";

type ListResponse = { profiles: AdminProfile[]; page: number; pages: number; total: number };

export function ProfilesPage({ kind }: { kind?: "business" | "customer" }) {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const [data, setData] = useState<ListResponse | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const search = params.get("search") ?? "";
  const type = params.get("type") ?? "";
  const status = params.get("status") ?? "";
  const verified = params.get("verified") ?? "";
  const from = params.get("from") ?? "";
  const page = Number(params.get("page") ?? "1");

  function setFilter(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set("page", "1");
    setParams(next);
  }

  async function load() {
    const query = new URLSearchParams({ page: String(page), limit: "12" });
    if (search) query.set("search", search);
    if (type) query.set("type", type);
    if (status) query.set("status", status);
    if (verified) query.set("verified", verified);
    if (from) query.set("from", from);
    if (kind) query.set("kind", kind);
    const result = await api.get<ListResponse>(`/api/admin/profiles?${query}`);
    setData(result);
  }

  useEffect(() => {
    void load().catch((err) => toast.error(friendlyError(err)));
  }, [search, type, status, verified, from, page, kind]);

  async function act(path: string, okMsg: string) {
    try {
      await api.post(path);
      toast.success(okMsg);
      await load();
    } catch (err) {
      toast.error(friendlyError(err));
    }
  }

  const typeTitles: Partial<Record<ProfileType, string>> = {
    PERSONAL: "Personal",
    INDIVIDUAL_BUSINESS: "Individual business",
    BUSINESS: "Businesses",
    ORGANIZATION: "Organizations",
    HOTEL: "Hotels",
    RESTAURANT: "Restaurants",
    CAFETERIA: "Cafeterias",
  };
  const title =
    (type && typeTitles[type as ProfileType]) ||
    (kind === "business" ? "Businesses" : kind === "customer" ? "Customers" : "Profiles");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{data?.total ?? 0} records</p>
        </div>
        <Button className="h-10 rounded-full bg-[#5b5ce6] px-5 hover:bg-[#4F46E5]" onClick={() => navigate(type ? `/admin/profiles/new?type=${type}` : "/admin/profiles/new")}>+ Create Profile</Button>
      </div>
      <Card className="rounded-[22px] border-[#EEEFF3] shadow-none">
        <CardContent className="grid gap-3 p-4 md:grid-cols-5">
          <Input className="rounded-full" placeholder="Search name, phone, public ID" defaultValue={search} onBlur={(e) => setFilter("search", e.target.value)} />
          {!kind && (
            <select className="h-10 rounded-md border bg-background px-3 text-sm" value={type} onChange={(e) => setFilter("type", e.target.value)}>
              <option value="">All types</option>
              {PROFILE_TYPES.filter((id) => id !== "PROFESSIONAL").map((id) => (
                <option key={id} value={id}>{typeLabel(id)}</option>
              ))}
            </select>
          )}
          <select className="h-10 rounded-md border bg-background px-3 text-sm" value={status} onChange={(e) => setFilter("status", e.target.value)}>
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="BLOCKED">Blocked</option>
          </select>
          <select className="h-10 rounded-md border bg-background px-3 text-sm" value={verified} onChange={(e) => setFilter("verified", e.target.value)}>
            <option value="">All verification</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>
          <Input type="date" value={from} onChange={(e) => setFilter("from", e.target.value)} />
        </CardContent>
      </Card>
      <div className="overflow-hidden rounded-3xl border bg-white shadow-sm dark:bg-card">
        <table className="w-full text-sm">
          <thead className="bg-[#F7F8FC] text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Profile</th>
              <th>Type</th>
              <th>Owner</th>
              <th>Status</th>
              <th>Publish</th>
              <th>Verification</th>
              <th>Template</th>
              <th>Created</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {data?.profiles.map((profile) => (
              <tr key={profile.id} className="border-t">
                <td className="px-4 py-3">
                  <Link to={`/admin/profiles/${profile.id}`} className="flex items-center gap-3">
                    <Thumb profile={profile} />
                    <div>
                      <p className="font-medium">{profile.name}</p>
                      <p className="text-xs text-muted-foreground">/{profile.publicId}</p>
                    </div>
                  </Link>
                </td>
                <td>{typeLabel(profile.type)}</td>
                <td>{profile.owner.name || "—"}</td>
                <td><StatusBadge status={profile.status} /></td>
                <td><PublishBadge state={profile.publishState} /></td>
                <td><VerifiedBadge verified={profile.isVerified} /></td>
                <td className="capitalize">{profile.design.template}</td>
                <td>{new Date(profile.createdAt).toLocaleDateString()}</td>
                <td className="pr-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button size="sm" variant="ghost" onClick={() => navigate(`/admin/profiles/${profile.id}`)}>View</Button>
                    <Button size="sm" variant="ghost" onClick={() => navigate(`/admin/profiles/${profile.id}`)}>Edit</Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/admin/profiles/${profile.id}`)}>View</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/admin/profiles/${profile.id}?tab=overview`)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => void act(`/api/admin/profiles/${profile.id}/${profile.isVerified ? "unverify" : "verify"}`, profile.isVerified ? "Unverified" : "Verified")}>
                        {profile.isVerified ? "Unverify" : "Verify"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => void act(`/api/admin/profiles/${profile.id}/${profile.publishState === "PUBLISHED" ? "unpublish" : "publish"}`, profile.publishState === "PUBLISHED" ? "Unpublished" : "Published")}>
                        {profile.publishState === "PUBLISHED" ? "Unpublish" : "Publish"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => void act(`/api/admin/profiles/${profile.id}/${profile.status === "ACTIVE" ? "deactivate" : "activate"}`, profile.status === "ACTIVE" ? "Deactivated" : "Activated")}>
                        {profile.status === "ACTIVE" ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600" onClick={() => setDeleteId(profile.id)}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data?.profiles.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-lg font-semibold">No profiles yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Create your first digital profile.</p>
            <Button className="mt-4" onClick={() => navigate(type ? `/admin/profiles/new?type=${type}` : "/admin/profiles/new")}>Create Profile</Button>
          </div>
        )}
      </div>
      {data && data.pages > 1 && (
        <div className="flex justify-end gap-2">
          <Button variant="outline" disabled={page <= 1} onClick={() => setFilter("page", String(page - 1))}>Previous</Button>
          <Button variant="outline" disabled={page >= data.pages} onClick={() => setFilter("page", String(page + 1))}>Next</Button>
        </div>
      )}
      <AlertDialog open={Boolean(deleteId)} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Profile</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the profile, menu, services, and public URL. The NFC card will stop working.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!deleteId) return;
                await api.delete(`/api/admin/profiles/${deleteId}`);
                setDeleteId(null);
                toast.success("Profile deleted");
                await load();
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

function Thumb({ profile }: { profile: AdminProfile }) {
  const src = profile.avatarUrl || profile.logoUrl;
  return src ? <img src={src} alt="" className="h-10 w-10 rounded-xl object-cover" /> : (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1b6b5a]/10 font-medium text-[#1b6b5a]">{profile.name?.[0] || "P"}</div>
  );
}
