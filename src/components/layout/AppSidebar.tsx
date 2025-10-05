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
import { LayoutDashboard, LogOut, Building2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { LogoutDialog } from "./logoutdialog";

import {
  ShoppingCart,
  Utensils,
  ListOrdered,
  BarChart3,
  Bell,
  User,
} from "lucide-react";
export const menuItems = [
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
    title: "Tables",
    url: "/tables",
    icon: ListOrdered,
  },
  {
    title: "Menu Management",
    url: "/menu",
    icon: Utensils,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
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
export function AppSidebar({ isOpen }: { isOpen: boolean }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentRoute = location.pathname;

  const isActive = (url?: string) => {
    if (!url) return false;
    if (url === "/dashboard") {
      return currentRoute === "/dashboard";
    }
    return currentRoute.startsWith(url);
  };

  const [logoutOpen, setLogoutOpen] = useState(false);

  return (
    <Sidebar
      className={`border-sidebar-border flex h-full flex-col border-r transition-all duration-300 ${
        isOpen ? "w-64" : "w-16"
      }`}
    >
      <SidebarHeader className="border-sidebar-border border-b">
        <div className="flex items-center gap-3 px-3 py-4">
          <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
            <Building2 className="text-primary-foreground h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sidebar-foreground">Admin Panel</h2>
            <p className="text-sidebar-foreground/60">Back Office - `role`</p>
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
                      {item.items.map((subItem) => (
                        <SidebarMenuButton
                          key={subItem.title}
                          onClick={() => navigate(subItem.url as any)}
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
                      onClick={() => navigate(item.url as any)}
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
            <Avatar className="h-8 w-8">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary text-primary-foreground">
                AD
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sidebar-foreground truncate">
                Waiter / Admin / Kitchen
              </p>
              <p className="text-sidebar-foreground/60 truncate text-xs">
                backoffice@bookies.com
              </p>
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
          console.log("Logging out...");
          auth.logout();
          navigate("/login");
          // your logout logic here
        }}
      />
    </Sidebar>
  );
}
