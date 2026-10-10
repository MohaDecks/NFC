import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, BadgeCheck, Building2, Coffee, CreditCard, Eye, FileEdit, Hotel, MapPin, Plus, QrCode, Shield, Stethoscope, UserPlus, UserRound, UtensilsCrossed, Wrench } from "lucide-react";
import { typeLabel } from "@shared/profileTypes";
import { FlipNfcCard } from "@/components/admin/FlipNfcCard";
import { useBranding } from "@/hooks/useBranding";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PublishBadge, StatusBadge, VerifiedBadge } from "@/components/admin/StatusBadges";
import { useAdmin } from "@/hooks/useAdmin";
import type { AdminProfile, AuditItem } from "@/types";

type DayPoint = { day: string; count: number };

type DashboardData = {
  stats: {
    total: number;
    active: number;
    inactive: number;
    verified: number;
    unverified: number;
    personal: number;
    businesses: number;
    hotels: number;
    restaurants: number;
    cafeterias: number;
    doctors?: number;
    engineers?: number;
    portfolios?: number;
    published: number;
    drafts?: number;
    nfcCards: number;
    qrCodes?: number;
    views: number;
  };
  growth?: DayPoint[];
  viewsByDay?: DayPoint[];
  profileTypes?: { id: string; name: string; slug: string }[];
  cardDesigns?: {
    id: string;
    name: string;
    backgroundColor: string;
    primaryColor: string;
    accentColor: string;
    frontText: string;
    backText: string;
  }[];
  recentProfiles: AdminProfile[];
  recentlyUpdated?: AdminProfile[];
  recentActivity: AuditItem[];
};

export function DashboardPage() {
  const { can } = useAdmin();
  const { brandName, tagline } = useBranding();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [list, setList] = useState<"recent" | "updated">("recent");

  useEffect(() => {
    void api
      .get<DashboardData>("/api/admin/dashboard")
      .then(setData)
      .catch(() => setError("Dashboard data could not be loaded."));
  }, []);

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-sm text-muted-foreground">{error}</CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} className="h-28 rounded-2xl" />)}
      </div>
    );
  }

  const { stats } = data;
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  const profiles = list === "updated" ? data.recentlyUpdated ?? data.recentProfiles : data.recentProfiles;
  const distribution = [
    { label: "Personal", value: stats.personal },
    { label: "Businesses", value: stats.businesses },
    { label: "Hotels", value: stats.hotels },
    { label: "Restaurants", value: stats.restaurants },
    { label: "Cafeterias", value: stats.cafeterias },
    { label: "Doctors", value: stats.doctors ?? 0 },
    { label: "Engineers", value: stats.engineers ?? 0 },
    { label: "Portfolios", value: stats.portfolios ?? 0 },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">{today}{tagline ? ` · ${tagline}` : ""}</p>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={UserRound} label="Total Profiles" value={stats.total} hint={`${stats.active} active · ${stats.inactive} inactive`} />
        <Kpi icon={BadgeCheck} label="Verified" value={stats.verified} hint={`${stats.unverified} unverified`} />
        <Kpi icon={Activity} label="Published" value={stats.published ?? 0} hint="Live public websites" />
        <Kpi icon={FileEdit} label="Drafts" value={stats.drafts ?? 0} hint="Not published" />
        <Kpi icon={CreditCard} label="Business Cards" value={stats.nfcCards ?? 0} hint="Registered NFC cards" />
        <Kpi icon={QrCode} label="QR Codes" value={stats.qrCodes ?? stats.nfcCards ?? 0} hint="Cards with QR enabled" />
        <Kpi icon={Eye} label="Profile Views" value={stats.views} hint="All recorded views" />
        <Kpi icon={Building2} label="Businesses" value={stats.businesses} hint={`${stats.personal} personal profiles`} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {can("profiles.create") && <QuickAction to="/admin/profiles/new" icon={Plus} label="Create Profile" />}
        {can("nfc.manage") && <QuickAction to="/admin/business-cards/register" icon={CreditCard} label="Register Card" />}
        {can("profiles.view") && <QuickAction to="/admin/profiles" icon={UserRound} label="All Profiles" />}
        {can("analytics.view") && <QuickAction to="/admin/analytics" icon={Eye} label="Insights" />}
        {can("locations.create") && <QuickAction to="/admin/locations/countries" icon={MapPin} label="Add Country" />}
        {can("users.create") && <QuickAction to="/admin/users/new" icon={UserPlus} label="Create Admin" />}
        {can("types.create") && <QuickAction to="/admin/profile-types" icon={Shield} label="Profile Types" />}
        {can("design.view") && <QuickAction to="/admin/design/templates" icon={FileEdit} label="Templates" />}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold">Last 7 days</h2>
                <p className="text-sm text-muted-foreground">Profiles created and public views.</p>
              </div>
            </div>
            <TrendChart created={data.growth ?? []} views={data.viewsByDay ?? []} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <h2 className="font-semibold">Profile types</h2>
            <p className="mb-4 text-sm text-muted-foreground">Counts from the profile collection.</p>
            {distribution.length === 0 ? (
              <p className="text-sm text-muted-foreground">No profiles yet.</p>
            ) : (
              <div className="space-y-3">
                {distribution.map((item) => (
                  <div key={item.label}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{item.label}</span>
                      <span className="text-muted-foreground">{item.value}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.max(6, (item.value / Math.max(stats.total, 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <TypeTile to="/admin/profiles?type=PERSONAL" icon={UserRound} label="Personal" value={stats.personal} />
        <TypeTile to="/admin/profiles?kind=business" icon={Building2} label="Businesses" value={stats.businesses} />
        <TypeTile to="/admin/profiles?type=HOTEL" icon={Hotel} label="Hotels" value={stats.hotels} />
        <TypeTile to="/admin/profiles?type=RESTAURANT" icon={UtensilsCrossed} label="Restaurants" value={stats.restaurants} />
        <TypeTile to="/admin/profiles?type=CAFETERIA" icon={Coffee} label="Cafeterias" value={stats.cafeterias} />
        <TypeTile to="/admin/profiles?type=DOCTOR" icon={Stethoscope} label="Doctors" value={stats.doctors ?? 0} />
        <TypeTile to="/admin/profiles?type=ENGINEER" icon={Wrench} label="Engineers" value={stats.engineers ?? 0} />
        <TypeTile to="/admin/profiles?type=PORTFOLIO" icon={FileEdit} label="Portfolios" value={stats.portfolios ?? 0} />
      </div>

      {(data.cardDesigns?.length ?? 0) > 0 && (
        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Card designs</h2>
                <p className="text-sm text-muted-foreground">Click a card to flip front and back.</p>
              </div>
              <Link to="/admin/design/card-designs" className="text-sm font-medium text-primary">Open designer</Link>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-2 pt-2">
              {data.cardDesigns?.map((design) => (
                <div key={design.id} className="shrink-0">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">{design.name}</p>
                  <FlipNfcCard title={brandName} design={design} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-semibold">{list === "recent" ? "Recent profiles" : "Recently updated"}</h2>
              <div className="flex items-center gap-2">
                <Button size="sm" variant={list === "recent" ? "default" : "outline"} onClick={() => setList("recent")}>Created</Button>
                <Button size="sm" variant={list === "updated" ? "default" : "outline"} onClick={() => setList("updated")}>Updated</Button>
                <Link to="/admin/profiles" className="text-sm font-medium text-primary">View all</Link>
              </div>
            </div>
            <div className="space-y-1">
              {profiles.map((profile) => (
                <Link key={profile.id} to={`/admin/profiles/${profile.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-xl px-3 py-3 transition hover:bg-accent">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar profile={profile} />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{profile.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {typeLabel(profile.type)} · {profile.owner.name || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    <StatusBadge status={profile.status} />
                    <PublishBadge state={profile.publishState} />
                    <VerifiedBadge verified={profile.isVerified} />
                  </div>
                </Link>
              ))}
              {profiles.length === 0 && (
                <div className="rounded-2xl border border-dashed py-12 text-center">
                  <p className="font-medium">No profiles yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">Create the first digital profile.</p>
                  {can("profiles.create") && (
                    <Button className="mt-4" asChild>
                      <Link to="/admin/profiles/new">Create Profile</Link>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <h2 className="mb-4 font-semibold">Recent activity</h2>
            <div className="space-y-3">
              {data.recentActivity.map((item) => (
                <div key={item.id} className="border-b border-border pb-3 last:border-0">
                  <p className="text-sm">
                    <span className="font-medium">{item.adminName}</span> {labelAction(item.action)} {item.targetName}
                  </p>
                  <p className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</p>
                </div>
              ))}
              {data.recentActivity.length === 0 && <p className="text-sm text-muted-foreground">No activity yet.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TrendChart({ created, views }: { created: DayPoint[]; views: DayPoint[] }) {
  const points = created.length ? created : views;
  if (points.length === 0) {
    return <p className="text-sm text-muted-foreground">No dated activity is available yet.</p>;
  }
  const width = 640;
  const height = 180;
  const max = Math.max(1, ...created.map((point) => point.count), ...views.map((point) => point.count));
  const line = (series: DayPoint[]) =>
    series
      .map((point, index) => {
        const x = series.length === 1 ? width / 2 : (index / (series.length - 1)) * (width - 24) + 12;
        const y = height - 28 - (point.count / max) * (height - 48);
        return `${index === 0 ? "M" : "L"}${x},${y}`;
      })
      .join(" ");

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-48 w-full" role="img" aria-label="Profiles created and views over the last 7 days">
        <line x1="12" y1={height - 28} x2={width - 12} y2={height - 28} className="stroke-border" />
        {created.length > 0 && <path d={line(created)} fill="none" className="stroke-primary" strokeWidth="2.5" />}
        {views.length > 0 && <path d={line(views)} fill="none" className="stroke-sky-400" strokeWidth="2.5" strokeDasharray="5 4" />}
      </svg>
      <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2"><span className="h-0.5 w-4 bg-primary" /> Profiles created</span>
        <span className="inline-flex items-center gap-2"><span className="h-0.5 w-4 border-t-2 border-dashed border-sky-400" /> Views</span>
        <span className="ml-auto">{points.map((point) => point.day.slice(5)).join("  ")}</span>
      </div>
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof UserRound;
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-4 inline-flex rounded-xl bg-secondary p-2.5 text-secondary-foreground">
          <Icon className="h-4 w-4" />
        </div>
        <p className="text-3xl font-semibold tracking-tight">{value}</p>
        <p className="mt-1 text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

function QuickAction({ to, icon: Icon, label }: { to: string; icon: typeof Plus; label: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 rounded-2xl border bg-card px-4 py-3 text-sm font-medium shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-primary/30">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
        <Icon className="h-4 w-4" />
      </span>
      {label}
    </Link>
  );
}

function TypeTile({
  to,
  icon: Icon,
  label,
  value,
}: {
  to: string;
  icon: typeof UserRound;
  label: string;
  value: number;
}) {
  return (
    <Link to={to} className="rounded-2xl border bg-card p-4 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-primary/30">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-0.5 text-sm text-muted-foreground">{label}</p>
    </Link>
  );
}

function Avatar({ profile }: { profile: AdminProfile }) {
  const src = profile.avatarUrl || profile.logoUrl;
  return src ? (
    <img src={src} alt="" className="h-10 w-10 rounded-xl object-cover" />
  ) : (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-sm font-medium text-secondary-foreground">
      {profile.name?.[0] || "P"}
    </div>
  );
}

function labelAction(action: string) {
  return action.replaceAll("_", " ").toLowerCase();
}
