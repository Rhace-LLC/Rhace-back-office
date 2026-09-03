import { cn } from "@/lib/utils";
import { useState } from "react";
import { LogOut, Building2 } from "lucide-react";
import { useAuth, UserRole, UserRoleLabels } from "@/contexts/AuthContext";
import { LogoutDialog } from "./logoutdialog";
import { useLogout } from ".";
import { SidebarNav } from "./SidebarNav";

interface AppSidebarProps {
  /** Desktop rail state — collapsed renders the 72px icon-only rail. */
  collapsed?: boolean;
  onNavigate?: () => void;
}

/**
 * Desktop side navigation (component-shell.md §2).
 * Width is controlled by the parent shell (176px expanded / 72px collapsed).
 */
export function AppSidebar({ collapsed = false, onNavigate }: AppSidebarProps) {
  const auth = useAuth();
  const { logout } = useLogout();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const roleLabel = UserRoleLabels[auth.accountType as UserRole];

  return (
    <div className="flex h-full w-full flex-col bg-surface">
      {/* Brand + restaurant context (collapsed shows compact mark) */}
      <div
        className={cn(
          "flex items-center gap-3 border-b border-line-subtle",
          collapsed ? "h-16 justify-center px-2" : "h-16 px-4"
        )}
      >
        {collapsed ? (
          <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-cardfill text-brand">
            <Building2 className="h-5 w-5" />
          </span>
        ) : (
          <>
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-cardfill text-brand">
              <Building2 className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[14px] leading-5 font-medium text-ink">
                {auth.restaurants?.[0]?.name || "Back Office"}
              </p>
              <p className="truncate text-[11px] leading-[15px] text-ink-muted capitalize">
                {roleLabel}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Scrollable navigation rail */}
      <div className="min-h-0 flex-1 overflow-y-auto px-0 py-4">
        <SidebarNav collapsed={collapsed} onNavigate={onNavigate} />
      </div>

      {/* Utility footer */}
      <div className="border-t border-line-subtle p-2">
        <button
          type="button"
          onClick={() => setLogoutOpen(true)}
          title={collapsed ? "Logout" : undefined}
          className={cn(
            "group flex h-10 w-full items-center gap-2 rounded-[10px] text-[14px] leading-5 text-ink-muted transition-colors duration-150",
            "hover:bg-line-subtle hover:text-destructive",
            "focus-visible:ring-[3px] focus-visible:ring-focus-ring focus-visible:outline-none",
            collapsed ? "justify-center px-0" : "px-4"
          )}
        >
          <LogOut className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-[-1px]" />
          {!collapsed && <span className="truncate">Logout</span>}
        </button>
      </div>

      <LogoutDialog
        isOpen={logoutOpen}
        onOpenChange={setLogoutOpen}
        onConfirm={() => logout()}
      />
    </div>
  );
}
