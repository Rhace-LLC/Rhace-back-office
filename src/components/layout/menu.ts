import { useAuth } from "@/contexts/AuthContext";
import { isLocalEnv } from "@/lib/env";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ShoppingCart,
  Bell,
  User,
  ListOrdered,
  Layers3,
  Package,
  Utensils,
  Users,
  Store,
  CreditCard,
  Wallet,
  Sparkles,
  BadgePercent,
  Gamepad2,
  LayoutGrid,
  UserCheck,
  Bug,
} from "lucide-react";

export interface MenuItem {
  title: string;
  url?: string;
  icon?: LucideIcon;
  items?: MenuItem[];
}

/**
 * Role-aware navigation model used by the shell rail + mobile drawer.
 *
 * "Restaurant Experience" groups the guest-facing configuration of the
 * restaurant: promotions, entertainment, and the public profile.
 * (Alternatives if you prefer: "Guest Experience", "Brand & Experience".)
 */
export function useRoleBasedMenu(): MenuItem[] {
  const auth = useAuth();

  const baseMenu: MenuItem[] = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Orders", url: "/orders", icon: ShoppingCart },
    { title: "Notifications", url: "/notifications", icon: Bell },
    { title: "Profile", url: "/profile", icon: User },
  ];

  let menu: MenuItem[];

  if (auth.isAdmin || auth.isOwner) {
    menu = [
      ...baseMenu.slice(0, 2),
      {
        title: "Tables",
        icon: ListOrdered,
        items: [
          {
            title: "Table Management",
            url: "/tables",
            icon: LayoutGrid,
          },
          {
            title: "Waiter Assignment",
            url: "/tables/waiter-assignment",
            icon: UserCheck,
          },
        ],
      },
      { title: "Categories", url: "/category", icon: Layers3 },
      { title: "Inventory", url: "/inventory", icon: Package },
      { title: "Menu Management", url: "/menu", icon: Utensils },
      { title: "Staff", url: "/staff", icon: Users },
      {
        title: "Restaurant Experience",
        icon: Sparkles,
        items: [
          { title: "Promotions", url: "/promotions", icon: BadgePercent },
          { title: "Entertainment", url: "/entertainment", icon: Gamepad2 },
          { title: "Restaurant Profile", url: "/myrestaurant", icon: Store },
        ],
      },
      {
        title: "Subscriptions",
        url: "/billings-and-subscriptions",
        icon: CreditCard,
      },
      { title: "Payment Account", url: "/wallet-and-account", icon: Wallet },
      ...baseMenu.slice(2),
    ];
  } else if (auth.isWaiter) {
    menu = [
      ...baseMenu.slice(0, 2),
      {
        title: "Tables",
        icon: ListOrdered,
        items: [
          {
            title: "Table Management",
            url: "/tables",
            icon: LayoutGrid,
          },
          {
            title: "Waiter Assignment",
            url: "/tables/waiter-assignment",
            icon: UserCheck,
          },
        ],
      },
      ...baseMenu.slice(2),
    ];
  } else if (auth.isInventoryMgr) {
    menu = [
      { title: "Inventory", url: "/inventory", icon: Package },
      ...baseMenu.slice(2),
    ];
  } else if (auth.isKitchen) {
    menu = [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Orders", url: "/orders", icon: ShoppingCart },
      { title: "Menu", url: "/menu", icon: Utensils },
      ...baseMenu.slice(2),
    ];
  } else {
    menu = baseMenu;
  }

  // Local development only — never shipped to production nav.
  if (isLocalEnv()) {
    menu = [...menu, { title: "Debug", url: "/debug", icon: Bug }];
  }

  return menu;
}
