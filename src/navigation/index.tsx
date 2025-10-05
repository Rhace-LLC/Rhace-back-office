import { useAuth } from "@/contexts/AuthContext";
import NotFound from "@/pages/404";
import ForgotPassword from "@/pages/auth/forgotpassword";
import ResetPassword from "@/pages/auth/resetpassword";
import Signup from "@/pages/auth/signup";
import OtpVerification from "@/pages/auth/verifyaccount";
import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Login } from "@/pages/auth/login";
import { Dashboard } from "@/pages/dashboard";
import { Orders } from "@/pages/orders";
import { TablesPage } from "@/pages/tables";

export type UserRole = "Waiter" | "Kitchen" | "Admin";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  shift: string;
}

// Import pages

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll window to the top whenever the route changes
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

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

// Move useLocation inside a separate component inside Router
// How to implement page not found?
function NavigationContent() {
  let auth = useAuth();
  let navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // This useEffect is now only for general redirection,
    // but the core fix is in the conditional rendering below.
    if (auth.isAuthenticated && location.pathname === "/") {
      navigate("/dashboard");
    }
  }, [auth, location, navigate]);

  if (auth.isAuthenticated && location.pathname === "/") {
    return null; // Return nothing to prevent the landing page from rendering
  }

  return (
    <div className="min-h-screen">
      <main className={`flex`}>
        <section id="mainpage" className={`flex-1`}>
          <Routes>
            <Route path="/" Component={Login} />
            {/* Auth Pages */}
            <Route path="/login" Component={Login} />
            <Route path="/signup" Component={Signup} />
            <Route path="/forgot-password" Component={ForgotPassword} />
            <Route path="/resetpassword" Component={ResetPassword} />
            <Route path="/verify-email" Component={OtpVerification} />

            {/* Functional Logged In Pages */}
            <Route path="/dashboard" Component={Dashboard} />
            <Route path="/orders" Component={Orders} />
            <Route path="/tables" Component={TablesPage} />
            <Route path="/menu" Component={Login} />
            <Route path="/notifications" Component={Login} />
            <Route path="/profile" Component={Login} />
            <Route path="/analytics" Component={Login} />


            {/* 404 Route - must be last */}
            <Route path="*" Component={NotFound} />
          </Routes>
        </section>
      </main>
    </div>
  );
}

export default Navigation;
