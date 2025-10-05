"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "../ui/sidebar";
import { AppSidebar } from "./AppSidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const auth = useAuth();

  // Track sidebar open/collapsed
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      setSidebarOpen(false);
    } else {  
      setSidebarOpen(true);
    }
  }, [auth.isAuthenticated]);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        {auth.isAuthenticated && <AppSidebar isOpen={sidebarOpen} />}

        {/* SidebarInset flexes to remaining space */}
        <SidebarInset
          className={`flex flex-1 flex-col transition-all duration-300 ${
            sidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <div className="flex flex-1 flex-col gap-4">
            {auth.isAuthenticated && (
              <div className="flex items-center gap-4 p-3">
                <SidebarTrigger onClick={() => setSidebarOpen((prev) => !prev)}>
                  {" "}
                  {sidebarOpen ? "Collapse" : "Expand"}{" "}
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
