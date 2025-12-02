"use client";
import { useEffect, useState } from "react";
import { useAuth, UserRole, UserRoleLabels } from "@/contexts/AuthContext";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "../ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Menu } from "lucide-react";
import { MobileMenu } from "./MobileMenu";
import RhaceImg from "../../assets/Rhace-10.png";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const auth = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [auth.isAuthenticated]);

  const handleSidebarNavigate = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
      setMobileMenuOpen(false);
    }
  };

  return (
    <div>
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <SidebarProvider>
          <div className="flex h-screen w-full">
            {auth.isAuthenticated && (
              <AppSidebar
                isOpen={sidebarOpen}
                onNavigate={handleSidebarNavigate}
              />
            )}

            <SidebarInset
              className={`flex flex-1 flex-col transition-all duration-300 ${
                sidebarOpen ? "ml-0 md:ml-64" : "ml-0"
              }`}
            >
              <div className="flex flex-1 flex-col gap-4">
                {auth.isAuthenticated && (
                  <div className="bg-sidebar text-sidebar-foreground border-sidebar-border right-0 left-0 z-50 flex items-center justify-between border-b px-4 py-0">
                    <div className="flex items-center gap-4 p-3">
                      <SidebarTrigger
                        onClick={() => setSidebarOpen((prev) => !prev)}
                      />
                      <div className="bg-border h-4 w-px" />
                    </div>

                    <div className="flex items-center justify-center gap-2">
                      <span className="text-royalblue-600 text-[18px] font-semibold">
                        <img src={RhaceImg} className="w-[80px]" />
                      </span>
                      <span className="relative top-[1.5px] text-[15px] font-medium text-gray-600 capitalize italic">
                        {UserRoleLabels[auth.accountType as UserRole]}
                      </span>
                    </div>
                  </div>
                )}
                <div className="flex-1">{children}</div>
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>

      {/* Mobile Sidebar */}
      <div className="relative block pt-15 md:hidden">
        {/* Fixed Menu Icon */}
        {auth.isAuthenticated && (
          <div className="bg-sidebar text-sidebar-foreground border-sidebar-border fixed top-0 right-0 left-0 z-10 flex items-center justify-between border-b px-4 py-3">
            <button onClick={() => setMobileMenuOpen(true)} className="">
              <Menu className="h-6 w-9" />
            </button>

            <div className="flex items-center justify-center gap-2">
              <span className="text-royalblue-600 text-[18px] font-semibold">
                <img src={RhaceImg} className="w-[80px]" />
              </span>
              <span className="relative top-[1.5px] text-[15px] font-medium text-gray-600 capitalize italic">
                {UserRoleLabels[auth.accountType as UserRole]}
              </span>
            </div>
          </div>
        )}

        {/* Backdrop */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Slide-out Menu */}
        <div
          className={`bg-sidebar border-sidebar-border fixed top-0 left-0 z-50 h-full transform border-r transition-transform duration-300 ease-in-out ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"} w-[80%] max-w-[300px]`}
        >
          <MobileMenu
            onNavigate={() => {
              handleSidebarNavigate();
              setMobileMenuOpen(false);
            }}
          />
        </div>

        {/* Page Content */}
        <div className="">{children}</div>
      </div>
    </div>
  );
}
