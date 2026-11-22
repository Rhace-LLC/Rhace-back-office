import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { LogoutDialog } from "./logoutdialog";
import { useLogout } from ".";

interface UserMenuProps {
  displayName: string;
  email: string;
  roleLabel?: string;
  initials: string;
}

/**
 * Top-right account control. Clicking the name/avatar opens a small menu with
 * Profile and Log out. Available on every authenticated screen, including
 * onboarding (where the side navigation and its logout button are hidden).
 */
export function UserMenu({
  displayName,
  email,
  roleLabel,
  initials,
}: UserMenuProps) {
  const { logout } = useLogout();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Owners mid-onboarding can't reach other pages, so hide the Profile link.
  const isOnboarding = location.pathname === "/onboarding";

  // Close on outside click / Escape, and on navigation.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => setOpen(false), [location.pathname]);

  const itemClass =
    "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex items-center gap-2.5 rounded-md p-1 transition-colors hover:bg-inset",
          open && "bg-inset"
        )}
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
        <ChevronDown
          className={cn(
            "hidden h-4 w-4 text-ink-muted transition-transform sm:block",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-[60] mt-2 w-60 rounded-md border border-line bg-surface p-1.5 shadow-lg"
        >
          <div className="px-3 py-2">
            <div className="truncate text-sm font-medium text-ink">
              {displayName}
            </div>
            {email && email !== displayName && (
              <div className="truncate text-xs text-ink-muted">{email}</div>
            )}
          </div>
          <div className="my-1 h-px bg-line-subtle" />

          {!isOnboarding && (
            <Link
              to="/profile"
              role="menuitem"
              className={cn(itemClass, "text-ink hover:bg-inset")}
            >
              <User className="h-4 w-4 text-ink-muted" />
              Profile
            </Link>
          )}

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              setLogoutOpen(true);
            }}
            className={cn(itemClass, "text-danger hover:bg-danger-soft")}
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      )}

      <LogoutDialog
        isOpen={logoutOpen}
        onOpenChange={setLogoutOpen}
        onConfirm={logout}
      />
    </div>
  );
}
