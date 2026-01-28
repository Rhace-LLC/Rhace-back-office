import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
} from "../ui/sidebar";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

import {
  LayoutDashboard,
  LogOut,
  Building2,
  Layers3,
  Package,
  Users,
  CalendarDays,
  Store,
  CreditCard,
  Wallet,
} from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";
import { useAuth, UserRole, UserRoleLabels } from "@/contexts/AuthContext";
import { useState } from "react";
import { LogoutDialog } from "./logoutdialog";

import { ShoppingCart, Utensils, ListOrdered, Bell, User } from "lucide-react";
import { useLogout } from ".";

export interface MenuItem {
  title: string;
  url?: string;
  icon: any;
  items?: MenuItem[];
}

export function useRoleBasedMenu(): MenuItem[] {
  const auth = useAuth();

  const baseMenu: MenuItem[] = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Orders",
      url: "/orders",
      icon: ShoppingCart,
    },
    {
      title: "Notifications",
      url: "/notifications",
      icon: Bell,
    },
    {
      title: "Profile",
      url: "/profile",
      icon: User,
    },
  ];

  if (auth.isAdmin || auth.isOwner) {
    return [
      ...baseMenu.slice(0, 2), // Dashboard, Orders

      {
        title: "Reservations",
        url: "/reservations",
        icon: CalendarDays,
      },
      {
        title: "Tables",
        url: "/tables",
        icon: ListOrdered,
      },
      {
        title: "Category",
        url: "/category",
        icon: Layers3,
      },
      {
        title: "Inventory",
        url: "/inventory",
        icon: Package,
      },
      {
        title: "Menu Management",
        url: "/menu",
        icon: Utensils,
      },
      {
        title: "Staffs",
        url: "/staff",
        icon: Users,
      },
      {
        title: "Restaurant Profile",
        url: "/myrestaurant",
        icon: Store,
      },
      {
        title: "Subscriptions",
        url: "/billings-and-subscriptions",
        icon: CreditCard,
      },
      {
        title: "Payment Account",
        url: "/wallet-and-account",
        icon: Wallet,
      },
      ...baseMenu.slice(2), // Notifications, Profile
    ];
  }

  if (auth.isWaiter) {
    return [
      ...baseMenu.slice(0, 2),
      {
        title: "Tables",
        url: "/tables",
        icon: ListOrdered,
      },
      ...baseMenu.slice(2),
    ];
  }
  if (auth.isInventoryMgr) {
    return [
      {
        title: "Inventory",
        url: "/inventory",
        icon: Package,
      },
      ...baseMenu.slice(2),
    ];
  }

  if (auth.isKitchen) {
    return [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Orders",
        url: "/orders",
        icon: ShoppingCart,
      },
      {
        title: "Menu .Mgt",
        url: "/menu",
        icon: Utensils,
      },
      ...baseMenu.slice(2), // Notifications, Profile
    ];
  }

  // Fallback for unknown roles
  return baseMenu;
}

interface AppSidebarProps {
  isOpen: boolean;
  onNavigate?: () => void;
}

export function AppSidebar({ isOpen, onNavigate }: AppSidebarProps) {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentRoute = location.pathname;
  const { logout } = useLogout();

  const menuItems = useRoleBasedMenu();
  console.log("isOpen", isOpen, "menuItems", menuItems);

  const isActive = (url?: string) => {
    if (!url) return false;
    if (url === "/dashboard") return currentRoute === "/dashboard";
    return currentRoute.startsWith(url);
  };

  const handleNavigate = (url?: string) => {
    if (!url) return;
    navigate(url);
    if (onNavigate) onNavigate(); // ✅ Close sidebar on mobile
  };

  const [logoutOpen, setLogoutOpen] = useState(false);

  return (
    <Sidebar
      className={`border-sidebar-border flex h-full flex-col border-r transition-all duration-300 ${
        isOpen ? "w-64" : "w-0"
      }`}
    >
      <SidebarHeader className="border-sidebar-border border-b">
        <div className="flex items-center gap-3 px-3 py-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary text-primary-foreground">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sidebar-foreground/60 w-full max-w-[180px] truncate overflow-hidden text-[16px] whitespace-nowrap">
              {auth.email}
            </p>
            <p className="text-[15px] text-gray-500 capitalize">
              {UserRoleLabels[auth.accountType as UserRole]}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <div key={item.title} className="px-3 py-0.5">
                  <button
                    onClick={() => handleNavigate(item.url)}
                    className={`group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-200 ease-out active:scale-[0.97] ${
                      isActive(item.url)
                        ? "bg-black text-white shadow-lg shadow-black/10"
                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    } `}
                  >
                    {/* Active Indicator (Subtle vertical bar) */}
                    {isActive(item.url) && (
                      <div className="absolute left-0 h-5 w-1 rounded-r-full bg-white" />
                    )}

                    {/* Icon with hover scale effect */}
                    <item.icon
                      className={`h-4 w-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${isActive(item.url) ? "text-white" : "text-gray-400 group-hover:text-gray-900"} `}
                    />

                    {/* Label with improved tracking */}
                    <span
                      className={`font-semibold tracking-tight transition-colors ${
                        isActive(item.url)
                          ? "text-white"
                          : "text-gray-600 group-hover:text-gray-900"
                      }`}
                    >
                      {item.title}
                    </span>

                    {/* Optional: Hover spotlight effect */}
                    {!isActive(item.url) && (
                      <div className="absolute inset-0 rounded-xl opacity-0 transition-opacity group-hover:opacity-100" />
                    )}
                  </button>
                </div>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-sidebar-border border-t">
        <div className="space-y-3 p-3">
          <div className="flex items-center gap-3">
            <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <Building2 className="text-primary-foreground h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sidebar-foreground truncate capitalize">
                Back Office - {auth.accountType}
              </h2>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLogoutOpen(true)}
            className="bg-sidebar border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent w-full justify-start"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </SidebarFooter>
      <LogoutDialog
        isOpen={logoutOpen}
        onOpenChange={setLogoutOpen}
        onConfirm={() => {
          logout();
        }}
      />
    </Sidebar>
  );
}
