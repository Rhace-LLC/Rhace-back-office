import { useAuth, UserRole } from "@/contexts/AuthContext";
import NotFound from "@/pages/404";
import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Login } from "@/pages/auth/login";
import { Dashboard } from "@/pages/dashboard";
import { Orders } from "@/pages/orders";
import { TablesPage } from "@/pages/tables";
import { MenuManagement } from "@/pages/menu";
import { Notifications } from "@/pages/notification";
import { Profile } from "@/pages/profile";
import { Analytics } from "@/pages/analytics";
import { SignUp } from "@/pages/auth/signup";
import { VerifyOtp } from "@/pages/auth/verifyaccount";
import CategoryPage from "@/pages/category";
import ForgotPassword from "@/pages/auth/forgotpassword";
import ResetPassword from "@/pages/auth/resetpassword";
import ManageReservation from "@/pages/reservations";
import ManageInventoryPage from "@/pages/inventory/manage_inventory_page";
import ManageStaff from "@/pages/staffmanagement";
import RestaurantProfilePage from "@/pages/myRestaurant";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  shift: string;
}

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

/** 🔒 Protected Route Wrapper */
function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}) {
  const auth = useAuth();

  if (auth.loading) {
    return <div className="p-8 text-center">Loading Session...</div>;
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(auth.accountType as UserRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function Navigation(): React.JSX.Element {
  return (
    <Router>
      <ScrollToTop />
      <DashboardLayout>
        <NavigationContent />
      </DashboardLayout>
    </Router>
  );
}

function NavigationContent() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Redirect authenticated users from "/" to /dashboard
  useEffect(() => {
    if (
      auth.isAuthenticated &&
      (location.pathname === "/login" || location.pathname === "/")
    ) {
      navigate("/dashboard");
    }
  }, [auth, location, navigate]);

  return (
    <div className="min-h-screen">
      <main className="flex">
        <section id="mainpage" className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" Component={Login} />
            <Route path="/login" Component={Login} />
            <Route path="/signup" Component={SignUp} />
            <Route path="/forgot-password" Component={ForgotPassword} />
            <Route path="/resetpassword" Component={ResetPassword} />
            <Route path="/verify-email" Component={VerifyOtp} />

            {/* 🔒 Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tables"
              element={
                <ProtectedRoute
                  allowedRoles={["admin", "waiter", "restaurant_owner"]}
                >
                  <TablesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reservations"
              element={
                <ProtectedRoute
                  allowedRoles={["admin", "waiter", "restaurant_owner"]}
                >
                  <ManageReservation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <ProtectedRoute
                  allowedRoles={["admin", "waiter", "restaurant_owner"]}
                >
                  <ManageInventoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/category"
              element={
                <ProtectedRoute allowedRoles={["admin", "restaurant_owner"]}>
                  <CategoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff"
              element={
                <ProtectedRoute allowedRoles={["admin", "restaurant_owner"]}>
                  <ManageStaff />
                </ProtectedRoute>
              }
            />
            <Route
              path="/myrestaurant"
              element={
                <ProtectedRoute allowedRoles={["admin", "restaurant_owner"]}>
                  <RestaurantProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/menu"
              element={
                <ProtectedRoute
                  allowedRoles={["admin", "kitchen", "restaurant_owner"]}
                >
                  <MenuManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute allowedRoles={["admin", "restaurant_owner"]}>
                  <Analytics />
                </ProtectedRoute>
              }
            />

            {/* 404 - Must be last */}
            <Route path="*" Component={NotFound} />
          </Routes>
        </section>
      </main>
    </div>
  );
}

export default Navigation;
