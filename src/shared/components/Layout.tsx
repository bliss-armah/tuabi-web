import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/shared/hooks/useAuth";
import {
  Home,
  Users,
  CreditCard,
  User,
  Bell,
  LogOut,
  Settings,
  UsersRound,
  LayoutDashboard,
  KeyRound,
  History,
  Store,
  Shield,
  ScrollText,
} from "lucide-react";
import type { UserRole } from "@/shared/types/auth";
import { cn } from "@/shared/utils/utils";
import NotificationBadge from "@/notifications/NotificationBadge";
import AIChatWidget from "./AIChatWidget";
import { ModeToggle } from "./mode-toggle";
import {
  Avatar,
  AvatarFallback,
} from "@/shared/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

interface LayoutProps {
  children: ReactNode;
}

type NavItem = { name: string; href: string; icon: typeof Home };

function getNavigation(role?: UserRole, billingExempt?: boolean): NavItem[] {
  if (role === "SUPER_ADMIN") {
    return [
      { name: "Console", href: "/admin", icon: LayoutDashboard },
      { name: "Audit", href: "/admin/audit", icon: ScrollText },
      { name: "Profile", href: "/profile", icon: User },
    ];
  }
  const base: NavItem[] = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Debtors", href: "/debtors", icon: Users },
    { name: "History", href: "/history", icon: History },
    { name: "Notifications", href: "/notifications", icon: Bell },
  ];
  // Owner-only management entries
  if (role === "ADMIN") {
    base.push({ name: "Team", href: "/team", icon: UsersRound });
    if (!billingExempt) {
      base.push({ name: "Billing", href: "/plans", icon: CreditCard });
    }
    base.push({ name: "Settings", href: "/workspace-settings", icon: Settings });
  }
  base.push({ name: "Profile", href: "/profile", icon: User });
  return base;
}

function initials(name?: string) {
  if (!name) return "U";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout, role, workspace } = useAuth();
  const location = useLocation();

  const navigation = getNavigation(role, workspace?.billingExempt);
  const bottomNav = navigation
    .filter((i) => i.href !== "/notifications")
    .slice(0, 5);

  const isRouteActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    if (href === "/profile") return location.pathname.startsWith("/profile");
    return location.pathname === href;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            T
          </div>
          <span className="text-xl font-bold tracking-tight text-sidebar-foreground">
            Tuabi
          </span>
        </div>

        {/* Current workspace indicator */}
        <div className="border-b border-sidebar-border px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {role === "SUPER_ADMIN" ? "Platform" : "Workspace"}
          </p>
          <div className="mt-1 flex items-center gap-2">
            {role === "SUPER_ADMIN" ? (
              <Shield className="h-4 w-4 shrink-0 text-primary" />
            ) : (
              <Store className="h-4 w-4 shrink-0 text-primary" />
            )}
            <span className="truncate text-sm font-semibold text-sidebar-foreground">
              {role === "SUPER_ADMIN"
                ? "Administration"
                : workspace?.name || "—"}
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navigation.map((item) => {
            const active = isRouteActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                {initials(user?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-sidebar-foreground">
                {user?.name || "User"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-2 border-b border-border bg-background/80 px-4 backdrop-blur lg:px-8">
          <div className="flex min-w-0 items-center gap-2 lg:hidden">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
              T
            </div>
            <span className="shrink-0 text-lg font-bold tracking-tight">
              Tuabi
            </span>
            {(workspace?.name || role === "SUPER_ADMIN") && (
              <span className="flex min-w-0 items-center gap-1 text-sm text-muted-foreground">
                <span className="text-muted-foreground/50">/</span>
                <span className="truncate">
                  {role === "SUPER_ADMIN" ? "Admin" : workspace?.name}
                </span>
              </span>
            )}
          </div>

          <div className="hidden lg:block" />

          <div className="flex items-center gap-1">
            <NotificationBadge />
            <ModeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger className="ml-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {initials(user?.name)}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col">
                  <span className="truncate">{user?.name || "User"}</span>
                  <span className="truncate text-xs font-normal text-muted-foreground">
                    {user?.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile/account-settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Account settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile/change-password">
                    <KeyRound className="mr-2 h-4 w-4" />
                    Change password
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={logout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="mx-auto w-full max-w-7xl p-4 pb-24 lg:p-8 lg:pb-8">
          {children}
        </main>

        <AIChatWidget />

        {/* Mobile bottom navigation */}
        <nav className="safe-area-bottom fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur lg:hidden">
          <div className="flex items-stretch justify-around">
            {bottomNav.map((item) => {
              const active = isRouteActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex min-h-14 flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors",
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
