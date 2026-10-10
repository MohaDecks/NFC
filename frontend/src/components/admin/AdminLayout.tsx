import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Bell,
  CreditCard,
  Home,
  ImageIcon,
  LogOut,
  MapPin,
  Menu as MenuIcon,
  Moon,
  PanelLeftClose,
  QrCode,
  Search,
  Settings,
  Sun,
  UserRound,
} from "lucide-react";
import type { Permission } from "@shared/permissions";
import { useAdmin } from "@/hooks/useAdmin";
import { useBranding } from "@/hooks/useBranding";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CommandSearch } from "@/components/admin/CommandSearch";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { AuditItem } from "@/types";

type NavItem = {
  to: string;
  label: string;
  icon: typeof Home;
  permission?: Permission;
  end?: boolean;
  active: (pathname: string) => boolean;
};

const items: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: Home, end: true, active: (pathname) => pathname === "/admin" },
  { to: "/admin/profiles", label: "Profiles", icon: UserRound, permission: "profiles.view", active: (pathname) => pathname.startsWith("/admin/profiles") },
  {
    to: "/admin/cards",
    label: "Cards",
    icon: CreditCard,
    permission: "nfc.view",
    active: (pathname) =>
      pathname.startsWith("/admin/cards") ||
      pathname.startsWith("/admin/business-cards") ||
      pathname.startsWith("/admin/connections/nfc") ||
      pathname.startsWith("/admin/design/card"),
  },
  { to: "/admin/connections/qr", label: "QR Codes", icon: QrCode, permission: "nfc.view", active: (pathname) => pathname.startsWith("/admin/connections/qr") },
  { to: "/admin/content/media", label: "Media", icon: ImageIcon, permission: "media.view", active: (pathname) => pathname.startsWith("/admin/content") },
  {
    to: "/admin/locations/countries",
    label: "Locations",
    icon: MapPin,
    permission: "locations.view",
    active: (pathname) => pathname.startsWith("/admin/locations") || pathname.startsWith("/admin/counties") || pathname.startsWith("/admin/cities"),
  },
  { to: "/admin/analytics", label: "Insights", icon: BarChart3, permission: "analytics.view", active: (pathname) => pathname.startsWith("/admin/analytics") },
  {
    to: "/admin/settings",
    label: "Settings",
    icon: Settings,
    active: (pathname) =>
      pathname.startsWith("/admin/settings") ||
      pathname.startsWith("/admin/users") ||
      pathname.startsWith("/admin/roles") ||
      pathname.startsWith("/admin/permissions") ||
      pathname.startsWith("/admin/profile-types") ||
      pathname.startsWith("/admin/audit"),
  },
];

const titles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/profiles": "Profiles",
  "/admin/profiles/new": "Create Profile",
  "/admin/content/menus": "Menus",
  "/admin/content/rooms": "Rooms",
  "/admin/content/services": "Services",
  "/admin/content/media": "Media Library",
  "/admin/content/sections": "Sections",
  "/admin/design/templates": "Templates",
  "/admin/design/themes": "Design Studio",
  "/admin/design/cards": "Card Designs",
  "/admin/design/card-designs": "Card Designs",
  "/admin/connections/nfc": "NFC Management",
  "/admin/connections/qr": "QR Codes",
  "/admin/cards": "Business Cards",
  "/admin/business-cards/register": "Register Business Card",
  "/admin/business-cards/types": "Card Types",
  "/admin/analytics": "Insights",
  "/admin/profile-types": "Profile Types",
  "/admin/locations/countries": "Countries",
  "/admin/locations/cities": "Cities",
  "/admin/settings/branding": "Branding",
  "/admin/users": "Users",
  "/admin/users/new": "New User",
  "/admin/roles": "Roles",
  "/admin/roles/new": "New Role",
  "/admin/permissions": "Permissions",
  "/admin/counties": "Countries",
  "/admin/cities": "Cities",
  "/admin/settings": "Settings",
  "/admin/audit": "Audit Logs",
};

function NavItems({
  collapsed,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const { can } = useAdmin();
  const location = useLocation();
  const visible = useMemo(() => items.filter((item) => !item.permission || can(item.permission)), [can]);

  return (
    <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-2" aria-label="Admin">
      {visible.map((item) => {
        const Icon = item.icon;
        const selected = item.active(location.pathname);
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={item.label}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-[13px] font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300",
              selected
                ? "bg-white text-foreground shadow-[0_8px_18px_rgba(37,72,140,0.08)] dark:bg-white/12 dark:text-white"
                : "text-slate-600 hover:bg-white/45 hover:text-foreground dark:text-slate-300 dark:hover:bg-white/8",
              collapsed && "justify-center px-0",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        );
      })}
    </nav>
  );
}

function AccountCard({ collapsed }: { collapsed?: boolean }) {
  const { admin, logout, can } = useAdmin();
  const navigate = useNavigate();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center gap-2.5 rounded-2xl bg-white/70 px-2.5 py-2 text-left shadow-sm hover:bg-white dark:bg-white/8 dark:hover:bg-white/12",
            collapsed && "justify-center px-1",
          )}
        >
          <div className="relative">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {admin?.name?.[0] ?? "A"}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-emerald-400" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium">{admin?.name}</p>
              <p className="truncate text-[11px] text-muted-foreground">{admin?.role?.name ?? "Admin"}</p>
            </div>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => navigate("/admin/settings")}>Profile</DropdownMenuItem>
        {can("settings.view") && <DropdownMenuItem onClick={() => navigate("/admin/settings/branding")}>Branding</DropdownMenuItem>}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            await logout();
            navigate("/admin/login");
          }}
        >
          <LogOut className="h-3.5 w-3.5" /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Notifications() {
  const { can } = useAdmin();
  const [items, setItems] = useState<AuditItem[] | null>(null);
  const [failed, setFailed] = useState(false);
  if (!can("audit.view")) return null;

  async function load() {
    if (items || failed) return;
    try {
      const data = await api.get<{ logs: AuditItem[] }>("/api/admin/audit-logs?limit=6");
      setItems(data.logs);
    } catch {
      setFailed(true);
    }
  }

  return (
    <DropdownMenu onOpenChange={(open) => { if (open) void load(); }}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Recent activity">
          <Bell className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-2">
        <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recent activity</p>
        {failed && <p className="px-2 py-3 text-sm text-muted-foreground">Activity could not be loaded.</p>}
        {!failed && !items && <p className="px-2 py-3 text-sm text-muted-foreground">Loading…</p>}
        {items?.length === 0 && <p className="px-2 py-3 text-sm text-muted-foreground">No activity yet.</p>}
        {items?.map((item) => (
          <DropdownMenuItem key={item.id} className="flex-col items-start gap-0.5">
            <span className="text-sm"><span className="font-medium">{item.adminName}</span> {item.action.replaceAll("_", " ").toLowerCase()}</span>
            <span className="text-xs text-muted-foreground">{item.targetName} · {new Date(item.createdAt).toLocaleString()}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function useTheme() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("mubarek-theme", next ? "dark" : "light");
  }
  useEffect(() => {
    const stored = localStorage.getItem("mubarek-theme") || localStorage.getItem("bravio-theme");
    if (stored === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);
  return { dark, toggle };
}

function crumbsFor(pathname: string, title: string) {
  if (pathname === "/admin") return [{ label: "Dashboard", to: "/admin" }];
  const crumbs = [{ label: "Dashboard", to: "/admin" }];
  if (pathname.startsWith("/admin/profiles/") && pathname !== "/admin/profiles/new") {
    crumbs.push({ label: "Profiles", to: "/admin/profiles" });
  }
  crumbs.push({ label: title, to: pathname });
  return crumbs;
}

export function AdminLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("mubarek-sidebar") === "collapsed");
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { dark, toggle } = useTheme();
  const { admin, can } = useAdmin();
  const { brandName } = useBranding();
  const pageTitle =
    titles[location.pathname] ||
    (location.pathname.startsWith("/admin/profiles/") ? "Profile Studio" : "Admin Portal");
  const title = location.pathname === "/admin" ? brandName : pageTitle;
  const crumbs = crumbsFor(location.pathname, pageTitle);
  const subtitle =
    location.pathname === "/admin"
      ? `Welcome back, ${admin?.name ?? "Admin"}`
      : crumbs.slice(0, -1).map((crumb) => crumb.label).join(" / ");

  useEffect(() => {
    localStorage.setItem("mubarek-sidebar", collapsed ? "collapsed" : "open");
  }, [collapsed]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const sidebar = (mobile = false) => (
    <>
      <div className={cn("flex items-center gap-2.5 px-4 py-4", !mobile && collapsed && "justify-center px-2")}>
        <BrandLogo imgClassName={!mobile && collapsed ? "h-9 w-9 rounded-lg object-contain" : "h-10 w-auto max-w-[46px] object-contain"} />
        {(mobile || !collapsed) && (
          <div className="min-w-0">
            <p className="text-[12px] font-semibold leading-tight tracking-tight">MUBAREK</p>
            <p className="text-[10px] font-medium leading-tight text-muted-foreground">TECHNOLOGY SOLUTION</p>
            <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{brandName}</p>
          </div>
        )}
      </div>
      <NavItems collapsed={!mobile && collapsed} onNavigate={mobile ? () => setOpen(false) : undefined} />
      <div className="shrink-0 p-3">
        <AccountCard collapsed={!mobile && collapsed} />
      </div>
    </>
  );

  return (
    <div className="admin-shell flex min-h-screen min-w-0 gap-3 p-3 lg:gap-4 lg:p-4">
      <aside
        className={cn(
          "glass-panel sticky top-4 hidden h-[calc(100vh-2rem)] shrink-0 flex-col overflow-hidden rounded-[28px] text-foreground transition-[width] duration-300 lg:flex",
          collapsed ? "w-[76px]" : "w-[250px]",
        )}
      >
        {sidebar(false)}
      </aside>

      <div className="glass-panel flex min-h-[calc(100vh-1.5rem)] min-w-0 flex-1 flex-col overflow-hidden rounded-[28px] lg:min-h-[calc(100vh-2rem)]">
        <header className="flex items-center gap-3 border-b border-white/50 px-4 py-4 sm:px-6 dark:border-white/10">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full lg:hidden" aria-label="Open navigation">
                <MenuIcon className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="glass-panel w-[min(100%,280px)] border-0 p-0 text-foreground">
              <SheetTitle className="sr-only">Admin navigation</SheetTitle>
              <div className="flex h-full min-h-0 flex-col">{sidebar(true)}</div>
            </SheetContent>
          </Sheet>
          <Button variant="ghost" size="icon" className="hidden rounded-full lg:inline-flex" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} onClick={() => setCollapsed((value) => !value)}>
            <PanelLeftClose className={cn("h-4 w-4 transition", collapsed && "rotate-180")} />
          </Button>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold tracking-tight sm:text-xl">{title}</p>
            {subtitle ? <p className="truncate text-sm text-muted-foreground">{subtitle}</p> : null}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="icon" className="rounded-full bg-white/80" aria-label="Search" onClick={() => setSearchOpen(true)}>
              <Search className="h-4 w-4" />
            </Button>
            <Notifications />
            <Button variant="ghost" size="icon" className="rounded-full" onClick={toggle} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}>
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            {can("profiles.create") && location.pathname !== "/admin/profiles/new" && (
              <Button className="hidden rounded-full px-4 sm:inline-flex" asChild>
                <Link to="/admin/profiles/new">Create Profile</Link>
              </Button>
            )}
          </div>
        </header>
        <main className="admin-in min-h-0 flex-1 overflow-auto px-4 py-5 sm:px-6">
          <Outlet />
        </main>
      </div>
      <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
