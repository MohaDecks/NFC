import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Bell,
  Brush,
  ChevronDown,
  CreditCard,
  Home,
  LayoutGrid,
  LogOut,
  MapPin,
  Menu as MenuIcon,
  Moon,
  PanelLeftClose,
  Search,
  Shield,
  Sun,
  UserRound,
} from "lucide-react";
import type { Permission } from "@shared/permissions";
import { useAdmin } from "@/hooks/useAdmin";
import { useBranding } from "@/hooks/useBranding";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CommandSearch } from "@/components/admin/CommandSearch";
import { cn } from "@/lib/utils";

type NavChild = { to: string; label: string; permission?: Permission; end?: boolean };
type NavGroup = {
  id: string;
  label: string;
  icon: typeof Home;
  permission?: Permission;
  to?: string;
  children: NavChild[];
};

const groups: NavGroup[] = [
  {
    id: "profiles",
    label: "Profiles",
    icon: UserRound,
    permission: "profiles.view",
    children: [
      { to: "/admin/profiles?view=all", label: "All Profiles", permission: "profiles.view" },
      { to: "/admin/profiles?type=PERSONAL", label: "Personal", permission: "profiles.view" },
      { to: "/admin/profiles?kind=business", label: "Businesses", permission: "profiles.view" },
      { to: "/admin/profiles?type=HOTEL", label: "Hotels", permission: "profiles.view" },
      { to: "/admin/profiles?type=RESTAURANT", label: "Restaurants", permission: "profiles.view" },
      { to: "/admin/profiles?type=CAFETERIA", label: "Cafeterias", permission: "profiles.view" },
      { to: "/admin/profiles?type=DOCTOR", label: "Doctors", permission: "profiles.view" },
      { to: "/admin/profiles?type=ENGINEER", label: "Engineers", permission: "profiles.view" },
      { to: "/admin/profiles?type=PORTFOLIO", label: "Portfolios", permission: "profiles.view" },
    ],
  },
  {
    id: "content",
    label: "Content",
    icon: LayoutGrid,
    children: [
      { to: "/admin/content/sections", label: "Sections", permission: "content.view" },
      { to: "/admin/content/menus", label: "Menus", permission: "content.view" },
      { to: "/admin/content/rooms", label: "Rooms", permission: "content.view" },
      { to: "/admin/content/services", label: "Services", permission: "content.view" },
      { to: "/admin/content/media", label: "Media", permission: "media.view" },
    ],
  },
  {
    id: "design",
    label: "Design",
    icon: Brush,
    permission: "design.view",
    children: [
      { to: "/admin/design/templates", label: "Templates", permission: "design.view" },
      { to: "/admin/design/themes", label: "Themes", permission: "design.view" },
      { to: "/admin/design/card-designs", label: "Card Designs", permission: "design.view" },
    ],
  },
  {
    id: "nfc",
    label: "Business Cards",
    icon: CreditCard,
    permission: "nfc.view",
    children: [
      { to: "/admin/business-cards/register", label: "Register Card", permission: "profiles.create" },
      { to: "/admin/cards", label: "All Cards", permission: "nfc.view" },
      { to: "/admin/business-cards/types", label: "Card Types", permission: "types.view" },
      { to: "/admin/connections/qr", label: "QR Codes", permission: "nfc.view" },
    ],
  },
  {
    id: "locations",
    label: "Locations",
    icon: MapPin,
    permission: "locations.view",
    children: [
      { to: "/admin/locations/countries", label: "Countries", permission: "locations.view" },
      { to: "/admin/locations/cities", label: "Cities", permission: "locations.view" },
    ],
  },
  {
    id: "analytics",
    label: "Insights",
    icon: BarChart3,
    permission: "analytics.view",
    to: "/admin/analytics",
    children: [],
  },
  {
    id: "system",
    label: "System",
    icon: Shield,
    children: [
      { to: "/admin/users", label: "Users", permission: "users.view" },
      { to: "/admin/roles", label: "Roles", permission: "roles.view" },
      { to: "/admin/permissions", label: "Permissions", permission: "roles.view" },
      { to: "/admin/profile-types", label: "Profile Types", permission: "types.view" },
      { to: "/admin/settings/branding", label: "Branding", permission: "settings.view" },
      { to: "/admin/settings", label: "Settings", permission: "settings.view" },
      { to: "/admin/audit", label: "Audit Logs", permission: "audit.view" },
    ],
  },
];

const titles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/profiles": "Profiles",
  "/admin/profiles/new": "Create New Profile",
  "/admin/content/menus": "Menus",
  "/admin/content/rooms": "Rooms",
  "/admin/content/services": "Services",
  "/admin/content/media": "Media",
  "/admin/design/templates": "Templates",
  "/admin/design/themes": "Themes",
  "/admin/design/cards": "Card Designs",
  "/admin/design/card-designs": "Card Designs",
  "/admin/connections/nfc": "Business Cards",
  "/admin/connections/qr": "QR Codes",
  "/admin/cards": "Business Cards",
  "/admin/business-cards/register": "Register Business Card",
  "/admin/business-cards/types": "Card Types",
  "/admin/analytics": "Analytics",
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

function pathMatches(pathname: string, search: string, to: string) {
  const [path, query] = to.split("?");
  if (pathname === "/admin/profiles/new") return false;
  const onPath = pathname === path || (path !== "/admin" && pathname.startsWith(`${path}/`));
  if (!onPath) return false;
  if (query) return search.includes(query);
  if (path === "/admin") return pathname === "/admin";
  if (pathname.startsWith(`${path}/`)) return true;
  return !search.includes("type=") && !search.includes("kind=") && !search.includes("view=");
}

function NavItems({
  collapsed,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const { can } = useAdmin();
  const location = useLocation();
  const visible = useMemo(
    () =>
      groups
        .map((group) => ({
          ...group,
          children: group.children.filter((child) => !child.permission || can(child.permission)),
        }))
        .filter((group) => (group.to || group.children.length > 0) && (!group.permission || can(group.permission))),
    [can],
  );
  const currentGroup =
    visible.find((group) =>
      group.to
        ? location.pathname.startsWith(group.to)
        : group.children.some((child) => pathMatches(location.pathname, location.search, child.to)),
    )?.id;
  const [openIds, setOpenIds] = useState<string[]>(currentGroup ? [currentGroup] : []);
  const dashboardActive = location.pathname === "/admin";

  useEffect(() => {
    if (!currentGroup) return;
    setOpenIds((current) => (current.includes(currentGroup) ? current : [...current, currentGroup]));
  }, [currentGroup]);

  function toggleGroup(id: string) {
    setOpenIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  return (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
      <NavLink
        to="/admin"
        end
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-2.5 rounded-full px-3 py-2 text-[13px] font-medium transition",
          dashboardActive || location.pathname.startsWith("/admin/profiles/new")
            ? "bg-[#5b5ce6] text-white shadow-[0_10px_24px_rgba(91,92,230,0.35)]"
            : "text-white/55 hover:bg-white/5 hover:text-white",
          collapsed && "justify-center px-0",
        )}
      >
        <Home className="h-4 w-4 shrink-0" />
        {!collapsed && <span>Dashboard</span>}
      </NavLink>
      {visible.map((group) => {
        const Icon = group.icon;
        const childActive = group.children.some((child) => pathMatches(location.pathname, location.search, child.to));
        const selfActive = Boolean(group.to && location.pathname.startsWith(group.to));
        const expanded = openIds.includes(group.id) && !collapsed;
        if (group.to && group.children.length === 0) {
          return (
            <NavLink
              key={group.id}
              to={group.to}
              onClick={onNavigate}
              className={cn(
                "mt-1 flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium transition",
                selfActive ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white",
                collapsed && "justify-center px-0",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{group.label}</span>}
            </NavLink>
          );
        }
        return (
          <div key={group.id} className="mt-1">
            <button
              type="button"
              onClick={() => {
                if (collapsed) return;
                toggleGroup(group.id);
              }}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium transition",
                childActive || expanded ? "text-white" : "text-white/65 hover:bg-white/5 hover:text-white",
                collapsed && "justify-center px-0",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="flex-1 text-left">{group.label}</span>}
              {!collapsed && (
                <ChevronDown className={cn("h-4 w-4 text-white/40 transition-transform duration-200", expanded && "rotate-180")} />
              )}
            </button>
            <div className={cn("grid transition-[grid-template-rows] duration-200", expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
              <div className="overflow-hidden">
                <div className="ml-5 mt-0.5 space-y-0.5 border-l border-white/10 pb-1 pl-2">
                  {group.children.map((child) => {
                    const selected = pathMatches(location.pathname, location.search, child.to);
                    return (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        end
                        onClick={onNavigate}
                        className={cn(
                          "block rounded-full px-3 py-1.5 text-[13px] transition",
                          selected
                            ? "bg-[#5b5ce6] text-white shadow-[0_8px_18px_rgba(91,92,230,0.28)]"
                            : "text-white/45 hover:bg-white/5 hover:text-white",
                        )}
                      >
                        {child.label}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
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
            "flex w-full items-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 px-2.5 py-2 text-left backdrop-blur hover:bg-white/10",
            collapsed && "justify-center px-1",
          )}
        >
          <div className="relative">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-xs font-semibold">
              {admin?.name?.[0] ?? "A"}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0b1020] bg-emerald-400" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium">{admin?.name}</p>
              <p className="truncate text-[11px] text-white/45">{admin?.role?.name ?? "Admin"}</p>
            </div>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => navigate("/admin/settings")}>Profile</DropdownMenuItem>
        {can("settings.view") && <DropdownMenuItem onClick={() => navigate("/admin/settings/branding")}>Settings</DropdownMenuItem>}
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

export function AdminLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { dark, toggle } = useTheme();
  const { admin } = useAdmin();
  const { brandName, tagline } = useBranding();
  const title =
    titles[location.pathname] ||
    (location.pathname.startsWith("/admin/profiles/") ? "Profile" : "Admin Portal");

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

  return (
    <div className={cn("admin-shell min-h-screen bg-[#f6f7fb] lg:grid", collapsed ? "lg:grid-cols-[76px_1fr]" : "lg:grid-cols-[232px_1fr]")}>
      <aside className="relative hidden overflow-hidden text-white transition-all duration-300 lg:flex lg:flex-col" style={{ background: "linear-gradient(180deg, #0b1020 0%, #12183a 100%)" }}>
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-16 top-24 h-64 w-64 rounded-full bg-[#6d28d9]/40 blur-3xl animate-[sidebar-drift_16s_ease-in-out_infinite]" />
          <div className="absolute -right-10 bottom-10 h-56 w-56 rounded-full bg-[#4f46e5]/30 blur-3xl animate-[sidebar-drift_22s_ease-in-out_infinite]" />
          <div className="absolute left-0 top-40 h-40 w-40 rounded-full bg-fuchsia-500/10 blur-3xl" />
        </div>
        <div className={cn("relative z-10 flex items-center gap-2.5 px-4 py-5", collapsed && "justify-center px-2")}>
          <BrandLogo imgClassName={collapsed ? "h-9 w-9 rounded-lg object-cover" : "h-10 w-auto max-w-[42px]"} />
          {!collapsed && (
            <div>
              <p className="text-[12px] font-semibold leading-tight tracking-tight">MUBAREK</p>
              <p className="text-[10px] font-medium leading-tight text-white/70">TECHNOLOGY SOLUTION</p>
              <p className="mt-1 text-[10px] text-white/40">Digital Presence</p>
            </div>
          )}
        </div>
        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
          <NavItems collapsed={collapsed} />
          <div className="p-3">
            <AccountCard collapsed={collapsed} />
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 border-b border-black/5 bg-white/80 px-4 py-2.5 backdrop-blur-xl dark:border-white/10 dark:bg-[#0b1020]/80">
          <div className="flex items-center gap-3">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <MenuIcon className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-[#0b1020] p-0 text-white">
                <div className="px-4 py-5">
                  <BrandLogo showText compact imgClassName="h-9 w-auto" />
                </div>
                <NavItems onNavigate={() => setOpen(false)} />
                <div className="p-3"><AccountCard /></div>
              </SheetContent>
            </Sheet>
            {location.pathname !== "/admin/profiles/new" && (
              <Button variant="ghost" size="icon" className="hidden lg:inline-flex" onClick={() => setCollapsed((value) => !value)}>
                <PanelLeftClose className={cn("h-4 w-4 transition", collapsed && "rotate-180")} />
              </Button>
            )}
            {location.pathname !== "/admin/profiles/new" && (
              <div className="hidden min-w-0 md:block">
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{tagline || brandName}</p>
                <p className="truncate text-sm font-semibold">{title}</p>
              </div>
            )}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="mx-auto hidden h-10 w-full max-w-xl items-center gap-2 rounded-full border border-[#eceef3] bg-white px-4 text-sm text-slate-400 shadow-none md:flex dark:bg-card"
            >
              <Search className="h-4 w-4" />
              Search profiles, menus, users...
              <kbd className="ml-auto rounded-md border px-1.5 py-0.5 text-[10px] text-slate-400">Ctrl+K</kbd>
            </button>
            <div className="ml-auto flex items-center gap-1.5">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSearchOpen(true)}>
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Notifications">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <div className="hidden items-center gap-2 rounded-full border bg-white px-2 py-1 dark:bg-card sm:flex">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-[11px] font-semibold text-white">
                  {admin?.name?.[0] ?? "A"}
                </div>
                <div className="pr-1">
                  <p className="text-xs font-medium leading-none">{admin?.name}</p>
                  <p className="text-[10px] text-muted-foreground">{admin?.role?.name ?? "Admin"}</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="admin-in px-4 py-5 lg:px-7">
          <Outlet />
        </main>
      </div>
      <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
