import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
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
        title: "Inventory Management",
        url: "/inventory",
        icon: Package,
      },
      {
        title: "Menu Management",
        url: "/menu",
        icon: Utensils,
      },
      {
        title: "Staff Management",
        url: "/staff",
        icon: Users,
      },
      {
        title: "Restaurant Profile",
        url: "/myrestaurant",
        icon: Users,
      },
      {
        title: "Billings & Subscriptions",
        url: "/billings-and-subscriptions",
        icon: Users,
      },
      {
        title: "Wallet & Account",
        url: "/wallet-and-account",
        icon: Users,
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
        title: "Inventory Management",
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
        title: "Menu Management",
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
  const {logout} = useLogout()

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
                <SidebarMenuItem key={item.title}>
                  {item.items ? (
                    <div className="space-y-1">
                      <div className="text-sidebar-foreground/80 flex items-center gap-2 px-3 py-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </div>
                      {item.items.map((subItem: any) => (
                        <SidebarMenuButton
                          key={subItem.title}
                          onClick={() => handleNavigate(subItem.url)}
                          isActive={isActive(subItem.url)}
                          className="ml-6"
                        >
                          <subItem.icon className="h-4 w-4" />
                          <span>{subItem.title}</span>
                        </SidebarMenuButton>
                      ))}
                    </div>
                  ) : (
                    <SidebarMenuButton
                      onClick={() => handleNavigate(item.url)}
                      isActive={isActive(item.url)}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
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

          logout()
          
        }}
      />
    </Sidebar>
  );
}
