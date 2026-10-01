import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";
import { useRoleBasedMenu, type MenuItem } from "./menu";

const NAV_LABEL = "Navigation";

interface SidebarNavProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

/**
 * Tactile navigation items (visual-direction.md §3):
 * 40px rows, 16px radius, solid surfaces. Active = solid royal blue
 * with white text; idle hover = soft inset tint.
 */
export function SidebarNav({ collapsed = false, onNavigate }: SidebarNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const menuItems = useRoleBasedMenu();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const isActive = (url?: string, exact = false) => {
    if (!url) return false;
    if (exact) return location.pathname === url;
    if (url === "/dashboard") return location.pathname === "/dashboard";
    return (
      location.pathname === url || location.pathname.startsWith(`${url}/`)
    );
  };

  const hasActiveChild = (item: MenuItem) =>
    Boolean(item.items?.some((child) => isActive(child.url, true)));

  const handleNavigate = (url?: string) => {
    if (!url) return;
    navigate(url);
    onNavigate?.();
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.items?.length) {
      // Collapsed rail has no room for sub-items: jump to the first child.
      if (collapsed) {
        handleNavigate(item.items[0].url);
        return;
      }
      setExpanded((prev) => ({
        ...prev,
        [item.title]: !(prev[item.title] ?? hasActiveChild(item)),
      }));
      return;
    }
    handleNavigate(item.url);
  };

  return (
    <nav aria-label={NAV_LABEL} className="flex w-full flex-col gap-1">
      {!collapsed && (
        <span className="px-3 pb-1 text-[11px] leading-[15px] font-medium tracking-[0.08em] text-ink-muted uppercase">
          {NAV_LABEL}
        </span>
      )}

      {menuItems.map((item) => {
        const hasChildren = Boolean(item.items?.length);
        const childActive = hasActiveChild(item);
        const active = isActive(item.url) || childActive;
        const isOpen = expanded[item.title] ?? childActive;
        const Icon = item.icon;

        return (
          <div key={item.title} className="flex w-full flex-col">
            <button
              type="button"
              title={collapsed ? item.title : undefined}
              aria-current={active && !hasChildren ? "page" : undefined}
              aria-expanded={hasChildren ? isOpen : undefined}
              onClick={() => handleItemClick(item)}
              className={cn(
                "group relative flex h-10 w-full items-center gap-2 rounded-2xl text-[14px] leading-5 transition-colors duration-150 focus-visible:ring-[3px] focus-visible:ring-focus-ring focus-visible:outline-none",
                collapsed ? "justify-center px-0" : "px-4",
                active
                  ? "bg-primary font-medium text-white shadow-button"
                  : "text-ink hover:bg-inset active:bg-inset-accent"
              )}
            >
              {Icon && (
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    active ? "text-white" : "text-ink-muted"
                  )}
                />
              )}

              {!collapsed && (
                <span
                  className={cn(
                    "flex-1 truncate text-left transition-colors",
                    active ? "font-medium text-white" : "text-ink"
                  )}
                >
                  {item.title}
                </span>
              )}

              {!collapsed && hasChildren && (
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform duration-200",
                    active ? "text-white" : "text-ink-muted",
                    isOpen && "rotate-180"
                  )}
                />
              )}
            </button>

            {hasChildren && !collapsed && isOpen && (
              <ul className="mt-1 ml-4 flex flex-col gap-1 border-l border-line-subtle pl-2">
                {item.items!.map((child) => {
                  const childIsActive = isActive(child.url, true);
                  const ChildIcon = child.icon;

                  return (
                    <li key={child.title}>
                      <button
                        type="button"
                        aria-current={childIsActive ? "page" : undefined}
                        onClick={() => handleNavigate(child.url)}
                        className={cn(
                          "group flex h-8 w-full items-center gap-2 rounded-2xl px-3 text-[13px] leading-5 transition-colors duration-150 focus-visible:ring-[3px] focus-visible:ring-focus-ring focus-visible:outline-none",
                          childIsActive
                            ? "bg-primary font-medium text-white shadow-button"
                            : "text-ink-muted hover:bg-inset hover:text-ink"
                        )}
                      >
                        {ChildIcon && (
                          <ChildIcon
                            className={cn(
                              "h-4 w-4 shrink-0 transition-colors",
                              childIsActive ? "text-white" : "text-ink-subtle"
                            )}
                          />
                        )}
                        <span className="truncate">{child.title}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );
}
