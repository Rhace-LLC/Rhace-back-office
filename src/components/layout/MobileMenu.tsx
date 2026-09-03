import { useAuth, UserRole, UserRoleLabels } from "@/contexts/AuthContext";
import { useState } from "react";
import { LogOut, X } from "lucide-react";
import { LogoutDialog } from "./logoutdialog";
import { useLogout } from ".";
import { SidebarNav } from "./SidebarNav";
import RhaceImg from "../../assets/Rhace-10.png";

interface MobileMenuProps {
  onNavigate: () => void;
  onClose: () => void;
}

/**
 * Mobile slide-out drawer (component-shell.md §2.6):
 * 280px, surface background, same nav/active/hover rules as desktop.
 */
export function MobileMenu({ onNavigate, onClose }: MobileMenuProps) {
  const auth = useAuth();
  const { logout } = useLogout();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const roleLabel = UserRoleLabels[auth.accountType as UserRole];

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-r-2xl bg-surface shadow-md">
      {/* Brand header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-line-subtle px-4">
        <img src={RhaceImg} alt="Rhace" className="h-auto w-[86px]" />
        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-[10px] text-ink-muted transition-colors hover:bg-accent hover:text-ink"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Restaurant + role context */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line-subtle px-4 py-3">
        <p className="min-w-0 truncate text-[14px] leading-5 font-medium text-ink">
          {auth.restaurants?.[0]?.name || "Back Office"}
        </p>
        <span className="shrink-0 rounded-[6px] bg-cardfill px-2 py-1 text-[11px] leading-[15px] font-medium text-ink-secondary capitalize">
          {roleLabel}
        </span>
      </div>

      {/* Navigation */}
      <div className="min-h-0 flex-1 overflow-y-auto px-0 py-4">
        <SidebarNav onNavigate={onNavigate} />
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-line-subtle p-2">
        <button
          type="button"
          onClick={() => setLogoutOpen(true)}
          className="group flex h-10 w-full items-center gap-2 rounded-[10px] px-4 text-[14px] leading-5 text-ink-muted transition-colors duration-150 hover:bg-line-subtle hover:text-destructive focus-visible:ring-[3px] focus-visible:ring-focus-ring focus-visible:outline-none"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span className="truncate">Logout</span>
        </button>
      </div>

      <LogoutDialog
        isOpen={logoutOpen}
        onOpenChange={setLogoutOpen}
        onConfirm={() => {
          logout();
        }}
      />
    </div>
  );
}
