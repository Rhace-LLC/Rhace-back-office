import {
  LayoutDashboard,
  ShoppingCart,
  Utensils,
  ListOrdered,
  BarChart3,
  Bell,
  User,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export interface MenuItem {
  title: string;
  url?: string;
  icon: any;
  items?: MenuItem[];
}

export function useRoleBasedMenu(): MenuItem[] {
  const auth = useAuth();

  const baseMenu: MenuItem[] = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Orders", url: "/orders", icon: ShoppingCart },
    { title: "Notifications", url: "/notifications", icon: Bell },
    { title: "Profile", url: "/profile", icon: User },
  ];

  if (auth.isAdmin)
    return [
      ...baseMenu.slice(0, 2),
      { title: "Tables", url: "/tables", icon: ListOrdered },
      { title: "Menu Management", url: "/menu", icon: Utensils },
      { title: "Analytics", url: "/analytics", icon: BarChart3 },
      ...baseMenu.slice(2),
    ];

  if (auth.isWaiter)
    return [
      ...baseMenu.slice(0, 2),
      { title: "Tables", url: "/tables", icon: ListOrdered },
      ...baseMenu.slice(2),
    ];

  if (auth.isKitchen)
    return [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Menu Management", url: "/menu", icon: Utensils },
      ...baseMenu.slice(2),
    ];

  return baseMenu;
}
