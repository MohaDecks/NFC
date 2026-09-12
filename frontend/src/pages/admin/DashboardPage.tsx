import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, BadgeCheck, Building2, Coffee, CreditCard, Eye, Hotel, MapPin, Plus, Shield, UserPlus, UserRound, UtensilsCrossed } from "lucide-react";
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
    published: number;
    nfcCards: number;
    views: number;
  };
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
  recentActivity: AuditItem[];
};

export function DashboardPage() {
  const { can, admin } = useAdmin();
  const { brandName, tagline } = useBranding();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    void api.get<DashboardData>("/api/admin/dashboard").then(setData);
  }, []);

  if (!data) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-28 rounded-3xl" />)}
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const { stats } = data;
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#5b5ce6_0%,#7c3aed_52%,#2563eb_100%)] p-6 text-white shadow-[0_20px_50px_rgba(91,92,230,0.22)] md:p-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[13px] text-white/70">{today}</p>
            <p className="text-[12px] uppercase tracking-[0.2em] text-white/60">{brandName}</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-[34px]">
              Create. Connect. Grow.
            </h1>
            <p className="mt-2 max-w-xl text-sm text-white/75">
              {greeting}, {admin?.name ?? "Admin"}. {tagline} — Digital Presence Platform.
            </p>
          </div>
          {can("profiles.create") && (
            <Button asChild className="h-10 rounded-full bg-white px-5 text-[#1565C0] hover:bg-blue-50">
              <Link to="/admin/profiles/new"><Plus className="h-4 w-4" /> Create Profile</Link>
            </Button>
          )}
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {can("profiles.create") && <QuickAction to="/admin/profiles/new" icon={Plus} label="Create Profile" />}
        {can("nfc.manage") && <QuickAction to="/admin/business-cards/register" icon={CreditCard} label="Register Business Card" />}
        {can("types.create") && <QuickAction to="/admin/profile-types" icon={Shield} label="Add Profile Type" />}
        {can("locations.create") && <QuickAction to="/admin/locations/countries" icon={MapPin} label="Add Country" />}
        {can("locations.create") && <QuickAction to="/admin/locations/cities" icon={MapPin} label="Add City" />}
        {can("users.create") && <QuickAction to="/admin/users/new" icon={UserPlus} label="Create Admin" />}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <Stat icon={UserRound} label="Total Profiles" value={stats.total} hint="All workspaces" color="bg-violet-50 text-violet-700" />
        <Stat icon={Activity} label="Active Profiles" value={stats.active} hint={`${stats.inactive} inactive`} color="bg-cyan-50 text-cyan-700" />
        <Stat icon={BadgeCheck} label="Verified Profiles" value={stats.verified} hint={`${stats.unverified} unverified`} color="bg-pink-50 text-pink-700" />
        <Stat icon={Building2} label="Published" value={stats.published ?? 0} hint="Live websites" color="bg-emerald-50 text-emerald-700" />
        <Stat icon={CreditCard} label="Business Cards" value={stats.nfcCards ?? 0} hint="Registered cards" color="bg-blue-50 text-blue-700" />
        <Stat icon={Eye} label="Profile Views" value={stats.views} hint="All time" color="bg-amber-50 text-amber-700" />
      </div>

      {(data.cardDesigns?.length ?? 0) > 0 && (
        <section className="rounded-[24px] border border-[#EEEFF3] bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Card Designs</h2>
              <p className="text-sm text-muted-foreground">Click a card to flip front and back.</p>
            </div>
            <Link to="/admin/design/card-designs" className="text-sm text-[#1565C0]">Open designer</Link>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4 pt-2">
            {data.cardDesigns?.map((design) => (
              <div key={design.id} className="shrink-0">
                <p className="mb-2 text-xs font-medium text-slate-500">{design.name}</p>
                <FlipNfcCard
                  title={brandName}
                  design={design}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <TypeTile to="/admin/profiles?type=PERSONAL" icon={UserRound} label="Personal" value={stats.personal} tone="bg-[#EEF0F4] text-[#5b6472]" />
        <TypeTile to="/admin/profiles?kind=business" icon={Building2} label="Businesses" value={stats.businesses} tone="bg-[#F4E8D4] text-[#B07A32]" />
        <TypeTile to="/admin/profiles?type=HOTEL" icon={Hotel} label="Hotels" value={stats.hotels} tone="bg-[#ECE8FF] text-[#6d28d9]" />
        <TypeTile to="/admin/profiles?type=RESTAURANT" icon={UtensilsCrossed} label="Restaurants" value={stats.restaurants} tone="bg-[#FDE8E8] text-[#c2410c]" />
        <TypeTile to="/admin/profiles?type=CAFETERIA" icon={Coffee} label="Cafeterias" value={stats.cafeterias} tone="bg-[#FFF4E5] text-[#c2410c]" />
      </div>
      {(data.profileTypes?.length ?? 0) > 0 && (
        <div className="flex flex-wrap gap-2">
          {data.profileTypes?.map((item) => (
            <Link key={item.id} to={`/admin/profiles?type=${item.slug}`} className="rounded-full border border-[#EEEFF3] bg-white px-3 py-1.5 text-xs text-slate-600 hover:border-blue-200">
              {item.name}
            </Link>
          ))}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <Card className="rounded-[24px] border-[#EEEFF3] shadow-none">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Recent profiles</h2>
              <Link to="/admin/profiles" className="text-sm text-[#5b5ce6]">View all</Link>
            </div>
            <div className="space-y-1.5">
              {data.recentProfiles.map((profile) => (
                <Link key={profile.id} to={`/admin/profiles/${profile.id}`} className="flex items-center justify-between rounded-2xl px-3 py-3 transition hover:bg-[#F4F0FF]">
                  <div className="flex items-center gap-3">
                    <Avatar profile={profile} />
                    <div>
                      <p className="font-medium">{profile.name}</p>
                      <p className="text-xs text-muted-foreground">
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
              {data.recentProfiles.length === 0 && (
                <div className="rounded-2xl border border-dashed py-12 text-center">
                  <p className="font-medium">No profiles yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">Create your first digital profile.</p>
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
        <Card className="rounded-[24px] border-[#EEEFF3] shadow-none">
          <CardContent className="p-5">
            <h2 className="mb-4 font-semibold">Recent activity</h2>
            <div className="space-y-3">
              {data.recentActivity.map((item) => (
                <div key={item.id} className="border-b border-[#EEEFF3] pb-3 last:border-0">
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

function Stat({
  icon: Icon,
  label,
  value,
  hint,
  color,
}: {
  icon: typeof UserRound;
  label: string;
  value: number;
  hint: string;
  color: string;
}) {
  return (
    <Card className="rounded-[24px] border-[#EEEFF3] shadow-none">
      <CardContent className="p-5">
        <div className={`mb-4 inline-flex rounded-2xl p-2.5 ${color}`}>
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
    <Link to={to} className="flex items-center gap-3 rounded-[18px] border border-[#EEEFF3] bg-white px-4 py-3 text-sm font-medium transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-sm">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E3F2FD] text-[#1565C0]">
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
  tone,
}: {
  to: string;
  icon: typeof UserRound;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <Link to={to} className="rounded-[22px] border border-[#EEEFF3] bg-white p-4 transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-sm">
      <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-0.5 text-sm text-slate-500">{label}</p>
    </Link>
  );
}

function Avatar({ profile }: { profile: AdminProfile }) {
  const src = profile.avatarUrl || profile.logoUrl;
  return src ? (
    <img src={src} alt="" className="h-10 w-10 rounded-xl object-cover" />
  ) : (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-sm font-medium text-violet-700">
      {profile.name?.[0] || "P"}
    </div>
  );
}

function labelAction(action: string) {
  return action.replaceAll("_", " ").toLowerCase();
}
