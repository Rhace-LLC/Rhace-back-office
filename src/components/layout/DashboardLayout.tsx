"use client";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bell, Menu, PanelLeft, PanelLeftClose } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth, UserRole, UserRoleLabels } from "@/contexts/AuthContext";
import { AppSidebar } from "./AppSidebar";
import { MobileMenu } from "./MobileMenu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import RhaceImg from "../../assets/Rhace-10.png";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * Application shell (component-shell.md §3.2):
 * full-width 64px top bar, side rail below it, main content, mobile drawer.
 */
export function DashboardLayout({ children }: DashboardLayoutProps) {
  const auth = useAuth();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Focused flows (e.g. onboarding) render without the side navigation.
  const hideSidebar = location.pathname === "/onboarding";

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      setMobileMenuOpen(false);
    }
  }, [auth.isAuthenticated]);

  const roleLabel = useMemo(() => {
    const label = UserRoleLabels[auth.accountType as UserRole];
    return label?.toLowerCase();
  }, [auth.accountType]);

  const displayName = useMemo(() => {
    if (auth.user?.first_name || auth.user?.last_name) {
      return `${auth.user?.first_name ?? ""} ${auth.user?.last_name ?? ""}`.trim();
    }
    return auth.email;
  }, [auth.user, auth.email]);

  const initials = useMemo(() => {
    const parts = (displayName || auth.email).trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1][0] ?? "" : "";
    return (first + last).toUpperCase() || "R";
  }, [displayName, auth.email]);

  // Public (auth) routes render without the shell.
  if (!auth.isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen w-full flex-col text-foreground">
      {/* ---------- Top Navigation (component-shell.md §1) ---------- */}
      <header
        className={cn(
          "sticky top-0 z-50 flex h-16 w-full shrink-0 items-center justify-between border-b border-line-subtle bg-surface px-4 md:px-6"
        )}
      >
        {/* Left zone */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Mobile: open drawer */}
          {!hideSidebar && (
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-[10px] text-ink-muted transition-colors hover:bg-accent hover:text-ink md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          {/* Desktop: collapse rail */}
          {!hideSidebar && (
            <button
              type="button"
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              className="hidden h-9 w-9 items-center justify-center rounded-[10px] text-ink-muted transition-colors hover:bg-accent hover:text-ink md:flex"
            >
              {sidebarCollapsed ? (
                <PanelLeft className="h-5 w-5" />
              ) : (
                <PanelLeftClose className="h-5 w-5" />
              )}
            </button>
          )}

          <Link to="/dashboard" className="flex items-center">
            <img src={RhaceImg} alt="Rhace" className="h-auto w-[88px] md:w-[96px]" />
          </Link>

          <div className="mx-1 hidden h-6 w-px bg-line-subtle sm:block md:mx-2" />
          <span className="hidden max-w-[220px] truncate text-[14px] leading-5 font-medium text-ink-secondary capitalize sm:block">
            {auth.restaurants?.[0]?.name || "Back Office"} · {roleLabel}
          </span>
        </div>

        {/* Right zone */}
        <div className="flex items-center gap-2 md:gap-3">
          <Link
            to="/notifications"
            aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-[10px] text-ink-muted transition-colors hover:bg-accent hover:text-ink"
          >
            <Bell className="h-5 w-5" />
          </Link>

          <div className="hidden h-6 w-px bg-line-subtle sm:block" />

          <Link
            to="/profile"
            className="flex items-center gap-2.5 rounded-[10px] p-1 transition-colors hover:bg-accent"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-brand text-[11px] font-semibold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-left lg:block">
              <span className="block max-w-[160px] truncate text-[13px] leading-4 font-medium text-ink">
                {displayName}
              </span>
              <span className="block max-w-[160px] truncate text-[11px] leading-4 text-ink-muted capitalize">
                {roleLabel}
              </span>
            </span>
          </Link>
        </div>
      </header>

      {/* ---------- Shell body: rail + main content ---------- */}
      <div className="flex w-full flex-1 items-stretch">
        {/* Desktop side rail (component-shell.md §2) — hidden on focused flows */}
        {!hideSidebar && (
          <aside
            className={cn(
              "sticky top-16 hidden px-2 h-[calc(100vh-4rem)] shrink-0 self-start overflow-hidden border-r border-line-subtle bg-surface transition-[width] duration-300 ease-in-out md:block",
              sidebarCollapsed ? "w-[60px]" : "w-[200px]"
            )}
          >
            <AppSidebar
              collapsed={sidebarCollapsed}
              onNavigate={() => {
                if (window.innerWidth < 768) {
                  setMobileMenuOpen(false);
                }
              }}
            />
          </aside>
        )}

        {/* Main content (component-shell.md §3) */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>

      {/* ---------- Mobile drawer (component-shell.md §2.6) ---------- */}
      {!hideSidebar && (
        <>
          <div
            aria-hidden={!mobileMenuOpen}
            onClick={() => setMobileMenuOpen(false)}
            className={cn(
              "fixed inset-0 z-[90] bg-ink/40 backdrop-blur-[2px] transition-opacity duration-300 md:hidden",
              mobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
            )}
          />

          <aside
            aria-hidden={!mobileMenuOpen}
            className={cn(
              "fixed inset-y-0 left-0 z-[100] w-[280px] transform shadow-xl transition-transform duration-300 ease-in-out md:hidden",
              mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <MobileMenu
              onNavigate={() => setMobileMenuOpen(false)}
              onClose={() => setMobileMenuOpen(false)}
            />
          </aside>
        </>
      )}
    </div>
  );
}