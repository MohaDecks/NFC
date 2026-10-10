import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BadgeCheck,
  Building2,
  Coffee,
  CreditCard,
  Eye,
  FileEdit,
  Hotel,
  Layers,
  Plus,
  QrCode,
  Search,
  Stethoscope,
  UserRound,
  UtensilsCrossed,
  Wrench,
} from "lucide-react";
import { PROFILE_TYPES, typeLabel, type ProfileType } from "@shared/profileTypes";
import { FlipNfcCard } from "@/components/admin/FlipNfcCard";
import { CommandSearch } from "@/components/admin/CommandSearch";
import { PublishBadge, StatusBadge, VerifiedBadge } from "@/components/admin/StatusBadges";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdmin } from "@/hooks/useAdmin";
import { useBranding } from "@/hooks/useBranding";
import { api } from "@/lib/api";
import type { AdminProfile, AuditItem } from "@/types";

type DayPoint = { day: string; count: number };

type DashboardData = {
  stats: {
    total: number;
    active: number;
    inactive: number;
    verified: number;
    unverified: number;
    published: number;
    drafts?: number;
    nfcCards: number;
    activeCards?: number;
    qrCodes?: number;
    views: number;
  };
  rangeDays?: number;
  growth?: DayPoint[];
  viewsByDay?: DayPoint[];
  typeCounts?: Record<string, number>;
  cardDesigns?: {
    id: string;
    name: string;
    backgroundColor: string;
    primaryColor: string;
    accentColor: string;
    frontText: string;
    backText: string;
  }[];
  recentActivity: AuditItem[];
};

type ListResponse = { profiles: AdminProfile[]; page: number; pages: number; total: number };

const TYPE_ICONS: Partial<Record<ProfileType, typeof UserRound>> = {
  PERSONAL: UserRound,
  INDIVIDUAL_BUSINESS: UserRound,
  BUSINESS: Building2,
  ORGANIZATION: Building2,
  HOTEL: Hotel,
  RESTAURANT: UtensilsCrossed,
  CAFETERIA: Coffee,
  DOCTOR: Stethoscope,
  ENGINEER: Wrench,
  PROFESSIONAL: BadgeCheck,
  PORTFOLIO: Layers,
};

export function DashboardPage() {
  const { admin, can } = useAdmin();
  const { brandName, tagline } = useBranding();
  const [days, setDays] = useState<7 | 30>(7);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileQuery, setProfileQuery] = useState("");
  const [profileType, setProfileType] = useState("");
  const [profilePage, setProfilePage] = useState(1);
  const [profiles, setProfiles] = useState<ListResponse | null>(null);
  const [profilesError, setProfilesError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void api
      .get<DashboardData>(`/api/admin/dashboard?days=${days}`)
      .then((next) => {
        if (!cancelled) {
          setData(next);
          setError("");
        }
      })
      .catch(() => {
        if (!cancelled) setError("Dashboard data could not be loaded.");
      });
    return () => {
      cancelled = true;
    };
  }, [days]);

  useEffect(() => {
    let cancelled = false;
    const query = new URLSearchParams({ page: String(profilePage), limit: "6" });
    if (profileQuery.trim()) query.set("search", profileQuery.trim());
    if (profileType) query.set("type", profileType);
    void api
      .get<ListResponse>(`/api/admin/profiles?${query}`)
      .then((next) => {
        if (!cancelled) {
          setProfiles(next);
          setProfilesError("");
        }
      })
      .catch(() => {
        if (!cancelled) setProfilesError("Profiles could not be loaded.");
      });
    return () => {
      cancelled = true;
    };
  }, [profileQuery, profileType, profilePage]);

  if (error && !data) {
    return (
      <Card className="mx-auto max-w-3xl">
        <CardContent className="p-8 text-sm text-muted-foreground">{error}</CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto grid max-w-[1180px] gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} className="h-28 rounded-2xl" />)}
      </div>
    );
  }

  const { stats } = data;
  const counts = data.typeCounts ?? {};
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  const distribution = PROFILE_TYPES.map((type) => ({
    type,
    label: typeLabel(type),
    value: counts[type] ?? 0,
  })).filter((item) => item.value > 0);

  const actions = [
    can("profiles.create") ? { to: "/admin/profiles/new", icon: Plus, label: "Create Profile" } : null,
    can("nfc.manage") ? { to: "/admin/business-cards/register", icon: CreditCard, label: "Register NFC Card" } : null,
    can("nfc.view") ? { to: "/admin/connections/qr", icon: QrCode, label: "Generate QR Code" } : null,
    can("design.view") ? { to: "/admin/design/templates", icon: Layers, label: "Manage Templates" } : null,
    can("types.view") ? { to: "/admin/profile-types", icon: BadgeCheck, label: "Manage Profile Types" } : null,
    can("profiles.view") ? { to: "/admin/profiles", icon: UserRound, label: "View All Profiles" } : null,
  ].filter(Boolean) as { to: string; icon: typeof Plus; label: string }[];

  return (
    <div className="mx-auto w-full max-w-[1180px] space-y-6">
      <header className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-[var(--shadow-card)] sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <BrandLogo imgClassName="h-12 w-auto max-w-[52px] object-contain" />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Dashboard</p>
            <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">{brandName}</h1>
            <p className="truncate text-sm text-muted-foreground">
              Welcome back, {admin?.name ?? "Admin"}. {today}
              {tagline ? ` · ${tagline}` : ""}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="rounded-full bg-background" onClick={() => setSearchOpen(true)}>
            <Search className="h-4 w-4" /> Search
          </Button>
          {can("profiles.create") && (
            <Button className="rounded-full" asChild>
              <Link to="/admin/profiles/new">Create Profile</Link>
            </Button>
          )}
        </div>
      </header>
      <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} />

      <section className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={UserRound} label="Total Profiles" value={stats.total} hint={`${stats.active} active · ${stats.inactive} inactive`} />
        <Kpi icon={Eye} label="Published Profiles" value={stats.published ?? 0} hint="Live public websites" />
        <Kpi icon={BadgeCheck} label="Verified Profiles" value={stats.verified} hint={`${stats.unverified} still unverified`} />
        <Kpi icon={FileEdit} label="Draft Profiles" value={stats.drafts ?? 0} hint="Not published yet" />
        <Kpi icon={CreditCard} label="Registered NFC Cards" value={stats.nfcCards ?? 0} hint="Cards stored in the system" />
        <Kpi icon={CreditCard} label="Active NFC Cards" value={stats.activeCards ?? 0} hint="Status is active" tone="cyan" />
        <Kpi icon={QrCode} label="QR Codes" value={stats.qrCodes ?? 0} hint="Cards with QR enabled" tone="cyan" />
        <Kpi icon={Eye} label="Total Profile Views" value={stats.views} hint="All recorded public views" />
      </section>

      {actions.length > 0 && (
        <section className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 lg:grid-cols-3">
          {actions.map((action) => (
            <Link key={action.to} to={action.to} className="flex items-center gap-3 rounded-2xl border bg-card px-4 py-3 text-sm font-medium shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-primary/30">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <action.icon className="h-4 w-4" />
              </span>
              {action.label}
            </Link>
          ))}
        </section>
      )}

      <section className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardContent className="p-5">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">Profile activity</h2>
                <p className="text-sm text-muted-foreground">Profiles created and public views.</p>
              </div>
              <div className="flex rounded-full border bg-background p-1">
                {([7, 30] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setDays(value)}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${days === value ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                  >
                    {value} days
                  </button>
                ))}
              </div>
            </div>
            <TrendChart created={data.growth ?? []} views={data.viewsByDay ?? []} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardContent className="p-5">
            <h2 className="font-semibold">Profile distribution</h2>
            <p className="mb-4 text-sm text-muted-foreground">Share of each saved profile type.</p>
            {distribution.length === 0 ? (
              <p className="text-sm text-muted-foreground">No profiles yet.</p>
            ) : (
              <div className="space-y-3">
                {distribution.map((item) => (
                  <Link key={item.type} to={`/admin/profiles?type=${item.type}`} className="block">
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{item.label}</span>
                      <span className="text-muted-foreground">{item.value}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(8, (item.value / Math.max(stats.total, 1)) * 100)}%` }} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="mb-3">
          <h2 className="font-semibold">Profile types</h2>
          <p className="text-sm text-muted-foreground">Open the filtered list for a category.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {PROFILE_TYPES.map((type) => {
            const Icon = TYPE_ICONS[type] ?? UserRound;
            return (
              <Link key={type} to={`/admin/profiles?type=${type}`} className="rounded-2xl border bg-card p-4 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-primary/30">
                <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <p className="text-2xl font-semibold tracking-tight">{counts[type] ?? 0}</p>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">{typeLabel(type)}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <Card>
        <CardContent className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Card designs</h2>
              <p className="text-sm text-muted-foreground">Saved designs. Select a card to preview the back.</p>
            </div>
            {can("design.view") && (
              <Link to="/admin/design/card-designs" className="text-sm font-medium text-primary">Edit designs</Link>
            )}
          </div>
          {(data.cardDesigns?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">No card designs have been saved yet.</p>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {data.cardDesigns?.map((design) => (
                <div key={design.id} className="w-[240px] shrink-0">
                  <FlipNfcCard title={brandName} design={design} width={240} />
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{design.name}</p>
                    {can("design.view") && (
                      <Link to="/admin/design/card-designs" className="shrink-0 text-xs font-medium text-primary">Edit</Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <section className="grid gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardContent className="p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-semibold">Recent profiles</h2>
              <Link to="/admin/profiles" className="text-sm font-medium text-primary">View all</Link>
            </div>
            <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_180px]">
              <Input
                value={profileQuery}
                placeholder="Search name, phone, public ID"
                onChange={(event) => {
                  setProfilePage(1);
                  setProfileQuery(event.target.value);
                }}
              />
              <select
                className="h-10 rounded-md border px-3 text-sm"
                value={profileType}
                onChange={(event) => {
                  setProfilePage(1);
                  setProfileType(event.target.value);
                }}
              >
                <option value="">All types</option>
                {PROFILE_TYPES.map((type) => (
                  <option key={type} value={type}>{typeLabel(type)}</option>
                ))}
              </select>
            </div>
            {profilesError && <p className="text-sm text-muted-foreground">{profilesError}</p>}
            {!profiles && !profilesError && <Skeleton className="h-40 rounded-xl" />}
            {profiles && profiles.profiles.length === 0 && (
              <div className="rounded-2xl border border-dashed py-10 text-center">
                <p className="font-medium">No profiles match</p>
                <p className="mt-1 text-sm text-muted-foreground">Try another search, or create a profile.</p>
                {can("profiles.create") && (
                  <Button className="mt-4" asChild>
                    <Link to="/admin/profiles/new">Create Profile</Link>
                  </Button>
                )}
              </div>
            )}
            <div className="divide-y">
              {profiles?.profiles.map((profile) => (
                <div key={profile.id} className="flex flex-wrap items-center gap-3 py-3">
                  <Avatar profile={profile} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{profile.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {typeLabel(profile.type)} · {new Date(profile.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <StatusBadge status={profile.status} />
                    <PublishBadge state={profile.publishState} />
                    <VerifiedBadge verified={profile.isVerified} />
                  </div>
                  <div className="flex gap-3 text-sm font-medium">
                    <a href={`/p/${profile.publicId}`} target="_blank" rel="noreferrer" className="text-primary">View</a>
                    <Link to={`/admin/profiles/${profile.id}`} className="text-primary">Edit</Link>
                  </div>
                </div>
              ))}
            </div>
            {profiles && profiles.pages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Page {profiles.page} of {profiles.pages}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" disabled={profilePage <= 1} onClick={() => setProfilePage((value) => value - 1)}>Previous</Button>
                  <Button size="sm" variant="outline" disabled={profilePage >= profiles.pages} onClick={() => setProfilePage((value) => value + 1)}>Next</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardContent className="p-5">
            <h2 className="font-semibold">Recent activity</h2>
            <p className="mb-4 text-sm text-muted-foreground">From the audit log.</p>
            {data.recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity has been recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {data.recentActivity.map((item) => (
                  <div key={item.id} className="border-b border-border pb-3 last:border-0">
                    <p className="text-sm">
                      <span className="font-medium">{item.adminName}</span> {labelAction(item.action)}
                      {item.targetName ? ` · ${item.targetName}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function TrendChart({ created, views }: { created: DayPoint[]; views: DayPoint[] }) {
  const series = created.length ? created : views;
  const total = [...created, ...views].reduce((sum, point) => sum + point.count, 0);
  if (series.length === 0 || total === 0) {
    return <p className="py-16 text-center text-sm text-muted-foreground">No profiles or views were recorded in this period.</p>;
  }
  const width = 720;
  const height = 220;
  const max = Math.max(1, ...created.map((point) => point.count), ...views.map((point) => point.count));
  const plot = (points: DayPoint[]) =>
    points.map((point, index) => {
      const x = points.length === 1 ? width / 2 : 28 + (index / (points.length - 1)) * (width - 48);
      const y = 16 + (height - 48) - (point.count / max) * (height - 48);
      return { x, y };
    });
  const createdPts = plot(created);
  const viewPts = plot(views);
  const line = (pts: { x: number; y: number }[]) => pts.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");
  const area = (pts: { x: number; y: number }[]) =>
    pts.length ? `${line(pts)} L${pts[pts.length - 1].x},${height - 32} L${pts[0].x},${height - 32} Z` : "";
  const labels = series.filter((_, index) => series.length <= 7 || index % 5 === 0 || index === series.length - 1);

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-52 w-full" role="img" aria-label="Profiles created and views">
        <line x1="28" y1={height - 32} x2={width - 16} y2={height - 32} className="stroke-border" />
        <line x1="28" y1="16" x2="28" y2={height - 32} className="stroke-border" />
        <text x="4" y="20" className="fill-muted-foreground" fontSize="11">{max}</text>
        <text x="4" y={height - 28} className="fill-muted-foreground" fontSize="11">0</text>
        {createdPts.length > 0 && <path d={area(createdPts)} className="fill-primary/15" />}
        {createdPts.length > 0 && <path d={line(createdPts)} fill="none" className="stroke-primary" strokeWidth="2.5" />}
        {viewPts.length > 0 && <path d={line(viewPts)} fill="none" className="stroke-sky-400" strokeWidth="2.5" />}
      </svg>
      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2"><span className="h-0.5 w-4 bg-primary" /> Profiles created</span>
        <span className="inline-flex items-center gap-2"><span className="h-0.5 w-4 bg-sky-400" /> Views</span>
        <span className="ml-auto">{labels.map((point) => point.day.slice(5)).join("  ")}</span>
      </div>
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
  tone = "blue",
}: {
  icon: typeof UserRound;
  label: string;
  value: number;
  hint: string;
  tone?: "blue" | "cyan";
}) {
  return (
    <Card className="transition hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-4">
        <div className={`mb-3 inline-flex rounded-xl p-2 ${tone === "cyan" ? "bg-sky-500/10 text-sky-600 dark:text-sky-300" : "bg-primary/10 text-primary"}`}>
          <Icon className="h-4 w-4" />
        </div>
        <p className="text-2xl font-semibold tracking-tight">{value.toLocaleString()}</p>
        <p className="mt-1 text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

function Avatar({ profile }: { profile: AdminProfile }) {
  const src = profile.avatarUrl || profile.logoUrl;
  return src ? (
    <img src={src} alt="" className="h-10 w-10 rounded-xl object-cover" />
  ) : (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-sm font-medium text-primary">
      {profile.name?.[0] || "P"}
    </div>
  );
}

function labelAction(action: string) {
  return action.replaceAll("_", " ").toLowerCase();
}
