import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useRestaurantProfileQuery } from "@/hooks/useRestaurantProfile";
import { FullScreenLoader } from "@/components/FullScreenLoader";
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
import { Orders } from "@/pages/orders/Orders";
import ManageInventoryPage from "@/pages/inventory";
import ManageStaff from "@/pages/staffmanagement";
import RestaurantProfilePage from "@/pages/myRestaurant";
import AcceptInvite from "@/pages/AcceptInvite";
import { ManageReservation } from "@/pages/reservations/re";
import BillingPage from "@/pages/subscription";
import { WalletAndAccount } from "@/pages/wallet&account";
import { MapLocationProvider } from "@/contexts/MapLocationContext";
import Onboarding from "@/pages/onboarding";

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

/** Routes that should never trap an authenticated owner. */
const AUTH_PATHS = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/accept-invite",
];

/**
 * 🚦 Session gate — sits above the app shell so nothing (chrome or page)
 * flashes before we know where an authenticated restaurant owner belongs.
 * While their onboarding state is being resolved we show a full-screen loader;
 * owners who haven't completed onboarding are sent straight to /onboarding.
 */
function SessionGate({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const location = useLocation();
  const profileQuery = useRestaurantProfileQuery();

  // 1. Restoring the session from storage.
  if (auth.loading) {
    return <FullScreenLoader label="Loading session…" />;
  }

  // 2. Only restaurant owners need the onboarding-state check.
  if (!auth.isAuthenticated || !auth.isOwner) {
    return <>{children}</>;
  }

  const { pathname } = location;
  const isAuthPath = AUTH_PATHS.includes(pathname);
  const isOnboarding = pathname === "/onboarding";

  // 3. Wait for the restaurant profile before deciding where to route.
  const profilePending =
    profileQuery.isLoading ||
    profileQuery.isFetching ||
    (profileQuery.status !== "success" && profileQuery.status !== "error");

  if (profilePending && !isOnboarding) {
    return <FullScreenLoader label="Checking your restaurant…" />;
  }

  const onboardingComplete = Boolean(profileQuery.data?.onboarding_complete);

  // 4. Authenticated owners should never linger on auth pages.
  if (isAuthPath) {
    return (
      <Navigate
        to={onboardingComplete ? "/dashboard" : "/onboarding"}
        replace
      />
    );
  }

  // 5. Owners who haven't finished onboarding may only access /onboarding.
  if (!isOnboarding && !onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

/** 🔒 Protected Route Wrapper */
function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}) {
  const auth = useAuth();
  const location = useLocation();
  const profileQuery = useRestaurantProfileQuery();

  if (auth.loading) {
    return <FullScreenLoader label="Loading session…" />;
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 🔹 FIRST: Onboarding gate — owners must finish onboarding first.
  // An owner mid-onboarding is only ever allowed to be on /onboarding.
  // The payout-account and subscription gates below must NOT run until the
  // owner has completed onboarding, otherwise they fight the onboarding gate
  // and produce a /onboarding <-> /wallet-and-account redirect loop.
  const onboardingComplete = auth.isOwner
    ? Boolean(profileQuery.data?.onboarding_complete)
    : true;

  if (auth.isOwner && !onboardingComplete) {
    if (profileQuery.isLoading || profileQuery.isFetching) {
      return <FullScreenLoader label="Checking your restaurant…" />;
    }

    if (location.pathname !== "/onboarding") {
      return <Navigate to="/onboarding" replace />;
    }

    // Onboarding wins — allow the wizard to render without further gating.
    return <>{children}</>;
  }

  // 🔹 SECOND: Force payout account setup
  if (
    auth.isOwner &&
    !auth.hasPayoutAccount &&
    location.pathname !== "/wallet-and-account"
  ) {
    return <Navigate to="/wallet-and-account" replace />;
  }

  // 🔹 THIRD: Force subscription if payout is set but not subscribed
  if (
    auth.isOwner &&
    auth.hasPayoutAccount &&
    !auth.hasSubscribed &&
    location.pathname !== "/billings-and-subscriptions"
  ) {
    return <Navigate to="/billings-and-subscriptions" replace />;
  }

  // 🔹 FOURTH: Role validation
  if (allowedRoles && !allowedRoles.includes(auth.accountType as UserRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function Navigation(): React.JSX.Element {
  return (
    <Router>
      <ScrollToTop />
      <SessionGate>
        <DashboardLayout>
          <MapLocationProvider>
            <NavigationContent />
          </MapLocationProvider>
        </DashboardLayout>
      </SessionGate>
    </Router>
  );
}

function NavigationContent() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  console.log("auth", auth);

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
      <main className="">
        <section id="mainpage" className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" Component={Login} />
            <Route path="/login" Component={Login} />
            <Route path="/signup" Component={SignUp} />
            <Route path="/forgot-password" Component={ForgotPassword} />
            <Route path="/reset-password" Component={ResetPassword} />
            <Route path="/verify-email" Component={VerifyOtp} />
            <Route path="/accept-invite" Component={AcceptInvite} />

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
              path="/onboarding"
              element={
                <ProtectedRoute allowedRoles={["restaurant_owner"]}>
                  <Onboarding />
                </ProtectedRoute>
              }
            />
            <Route path="/orders" element={<Orders />} />
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
                  allowedRoles={["admin", "inventory_mgr", "restaurant_owner"]}
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
              path="/billings-and-subscriptions"
              element={
                <ProtectedRoute allowedRoles={["restaurant_owner"]}>
                  <BillingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wallet-and-account"
              element={
                <ProtectedRoute allowedRoles={["restaurant_owner"]}>
                  <WalletAndAccount />
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
