import { useAuth } from "@/contexts/AuthContext";
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
} from "lucide-react";

export interface MenuItem {
  title: string;
  url?: string;
  icon: LucideIcon;
  items?: MenuItem[];
}

/** Role-aware navigation model used by the shell rail + mobile drawer. */
export function useRoleBasedMenu(): MenuItem[] {
  const auth = useAuth();

  const baseMenu: MenuItem[] = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Orders", url: "/orders", icon: ShoppingCart },
    { title: "Notifications", url: "/notifications", icon: Bell },
    { title: "Profile", url: "/profile", icon: User },
  ];

  if (auth.isAdmin || auth.isOwner) {
    return [
      ...baseMenu.slice(0, 2),
      { title: "Tables", url: "/tables", icon: ListOrdered },
      { title: "Categories", url: "/category", icon: Layers3 },
      { title: "Inventory", url: "/inventory", icon: Package },
      { title: "Menu Management", url: "/menu", icon: Utensils },
      { title: "Staff", url: "/staff", icon: Users },
      { title: "Restaurant Profile", url: "/myrestaurant", icon: Store },
      { title: "Subscriptions", url: "/billings-and-subscriptions", icon: CreditCard },
      { title: "Payment Account", url: "/wallet-and-account", icon: Wallet },
      ...baseMenu.slice(2),
    ];
  }

  if (auth.isWaiter) {
    return [
      ...baseMenu.slice(0, 2),
      { title: "Tables", url: "/tables", icon: ListOrdered },
      ...baseMenu.slice(2),
    ];
  }

  if (auth.isInventoryMgr) {
    return [
      { title: "Inventory", url: "/inventory", icon: Package },
      ...baseMenu.slice(2),
    ];
  }

  if (auth.isKitchen) {
    return [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Orders", url: "/orders", icon: ShoppingCart },
      { title: "Menu", url: "/menu", icon: Utensils },
      ...baseMenu.slice(2),
    ];
  }

  return baseMenu;
}
