import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { LogOut, X, Building2 } from "lucide-react";
import { useState } from "react";
import { LogoutDialog } from "./logoutdialog";
import { useRoleBasedMenu } from "./AppSidebar";

interface MobileMenuProps {
  onNavigate: () => void;
}

export function MobileMenu({ onNavigate }: MobileMenuProps) {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentRoute = location.pathname;

  const menuItems = useRoleBasedMenu();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const isActive = (url?: string) => {
    if (!url) return false;
    if (url === "/dashboard") return currentRoute === "/dashboard";
    return currentRoute.startsWith(url);
  };

  const handleNavigate = (url?: string) => {
    if (!url) return;
    navigate(url);
    onNavigate(); // close menu after navigation
  };

  return (
    <div className="bg-sidebar text-sidebar-foreground flex h-full flex-col">
      {/* Header */}
      <div className="border-sidebar-border flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
            <Building2 className="text-primary-foreground h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Admin Panel</h2>
            <p className="text-sidebar-foreground/60 text-xs">
              Back Office - {auth.accountType ?? "Guest"}
            </p>
          </div>
        </div>
        <button
          onClick={onNavigate}
          className="text-sidebar-foreground/70 hover:text-primary transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-2 py-3">
        {menuItems.map((item) => (
          <div key={item.title} className="mb-1">
            {item.items ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium">
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </div>
                {item.items.map((sub: any) => (
                  <button
                    key={sub.title}
                    onClick={() => handleNavigate(sub.url)}
                    className={`flex w-full items-center gap-2 rounded-md px-6 py-2 text-sm transition-all ${
                      isActive(sub.url)
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-sidebar-accent"
                    }`}
                  >
                    <sub.icon className="h-4 w-4" />
                    <span>{sub.title}</span>
                  </button>
                ))}
              </div>
            ) : (
              <button
                onClick={() => handleNavigate(item.url)}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-all ${
                  isActive(item.url)
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-sidebar-accent"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-sidebar-border border-t p-4">
        <div className="mb-3 flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {"Adefuye Abayomi"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {"User"} {"Last Name"}
            </p>
            <p className="text-sidebar-foreground/60 truncate text-xs">
              {auth.email ?? "example@mail.com"}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setLogoutOpen(true)}
          className="bg-sidebar border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent flex w-full justify-start"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>

        <LogoutDialog
          isOpen={logoutOpen}
          onOpenChange={setLogoutOpen}
          onConfirm={() => {
            auth.logout();
            onNavigate();
          }}
        />
      </div>
    </div>
  );
}
