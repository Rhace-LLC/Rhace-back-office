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
 * Token-compliant navigation items (component-shell.md §2.2–2.5):
 * 40px rows, md radius, 20px icons, 8px icon/text gap, 4px item gap.
 * Active -> brand text + 4×24px brand indicator. Hover -> brand hover bg + inverted text.
 *
 * Parent items with `items` expand/collapse to reveal sub-navigation. Sub-items
 * use iconography.small (16px), the 10px radius and the same interactive tokens.
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

              {Icon && (
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors group-hover:text-white",
                    active ? "text-brand" : "text-ink-muted"
                  )}
                />
              )}

              {!collapsed && (
                <span
                  className={cn(
                    "flex-1 truncate text-left transition-colors group-hover:text-white",
                    active ? "font-medium text-brand" : "text-ink"
                  )}
                >
                  {item.title}
                </span>
              )}

              {!collapsed && hasChildren && (
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-ink-muted transition-transform duration-200 group-hover:text-white",
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
                          "group flex h-8 w-full items-center gap-2 rounded-[10px] px-3 text-[13px] leading-5 transition-colors duration-150 focus-visible:ring-[3px] focus-visible:ring-focus-ring focus-visible:outline-none",
                          "hover:bg-brand-hover hover:text-white",
                          childIsActive
                            ? "bg-cardfill font-medium text-brand"
                            : "text-ink-muted"
                        )}
                      >
                        {ChildIcon && (
                          <ChildIcon
                            className={cn(
                              "h-4 w-4 shrink-0 transition-colors group-hover:text-white",
                              childIsActive ? "text-brand" : "text-ink-subtle"
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
