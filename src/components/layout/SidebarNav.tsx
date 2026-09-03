import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";
import { useRoleBasedMenu } from "./menu";

const NAV_LABEL = "Navigation";

interface SidebarNavProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

/**
 * Token-compliant navigation items (component-shell.md §2.2–2.5):
 * 40px rows, md radius, 20px icons, 8px icon/text gap, 4px item gap.
 * Active -> brand text + 4×24px brand indicator. Hover -> brand hover bg + inverted text.
 */
export function SidebarNav({ collapsed = false, onNavigate }: SidebarNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentRoute = location.pathname;
  const menuItems = useRoleBasedMenu();

  const isActive = (url?: string) => {
    if (!url) return false;
    if (url === "/dashboard") return currentRoute === "/dashboard";
    return currentRoute.startsWith(url);
  };

  const handleNavigate = (url?: string) => {
    if (!url) return;
    navigate(url);
    onNavigate?.();
  };

  return (
    <nav aria-label={NAV_LABEL} className="flex w-full flex-col gap-1">
      {!collapsed && (
        <span className="px-3 pb-1 text-[11px] leading-[15px] font-medium tracking-[0.08em] text-ink-muted uppercase">
          {NAV_LABEL}
        </span>
      )}

      {menuItems.map((item) => {
        const active = isActive(item.url);
        const Icon = item.icon;

        return (
          <button
            key={item.title}
            type="button"
            title={collapsed ? item.title : undefined}
            aria-current={active ? "page" : undefined}
            onClick={() => handleNavigate(item.url)}
            className={cn(
              "group relative flex h-10 w-full items-center gap-2 rounded-[10px] text-[14px] leading-5 transition-colors duration-150 focus-visible:ring-[3px] focus-visible:ring-focus-ring focus-visible:outline-none",
              "hover:bg-brand-hover active:bg-brand-active",
              collapsed ? "justify-center px-0" : "px-4",
              active && !collapsed ? "bg-cardfill font-medium" : ""
            )}
          >
            {/* Active indicator — component-shell.md §2.3 */}
            {!collapsed && (
              <span
                aria-hidden
                className={cn(
                  "absolute top-1/2 left-0 h-6 w-1 -translate-y-1/2 rounded-r-[6px] bg-brand transition-opacity",
                  active ? "opacity-100" : "opacity-0"
                )}
              />
            )}

            <Icon
              className={cn(
                "h-5 w-5 shrink-0 transition-colors group-hover:text-white",
                collapsed ? "" : "",
                active ? "text-brand" : "text-ink-muted"
              )}
            />

            {!collapsed && (
              <span
                className={cn(
                  "truncate transition-colors group-hover:text-white",
                  active ? "font-medium text-brand" : "text-ink"
                )}
              >
                {item.title}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
