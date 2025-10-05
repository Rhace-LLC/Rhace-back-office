"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "../ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useLocation } from "react-router-dom";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const auth = useAuth();
  const location = useLocation();
  // Track sidebar open/collapsed
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      setSidebarOpen(false);
    } else {  
      setSidebarOpen(true);
    }
  }, [auth.isAuthenticated]);

  // Automatically close sidebar on route change (mobile only)
useEffect(() => {
  console.log("location changed:", location.pathname, window.innerWidth);
  if (window.innerWidth < 768) {
  console.log("location changed:", "DEbug");
    setSidebarOpen(false)
  }
}, [location]);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        {/* Only show sidebar on md and above */}
        {auth.isAuthenticated && (
            <AppSidebar isOpen={sidebarOpen} />
        )}

        {/* SidebarInset flexes to remaining space */}
        <SidebarInset
          className={`flex flex-1 flex-col transition-all duration-300 ${
            sidebarOpen ? "md:ml-64" : "md:ml-0"
          }`}
        >
          <div className="flex flex-1 flex-col gap-4">
            {auth.isAuthenticated && (
              <div className="flex items-center gap-4 p-3">
                <SidebarTrigger onClick={() => setSidebarOpen((prev) => !prev)}>
                </SidebarTrigger>
                <div className="bg-border h-4 w-px" />
              </div>
            )}
            <div className="flex-1">{children}</div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
