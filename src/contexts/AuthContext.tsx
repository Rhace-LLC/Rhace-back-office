import React, { createContext, useState, useContext, useEffect } from "react";
import { jwtDecode, JwtPayload } from "jwt-decode";

// ------------------ USER ROLE TYPE ------------------
export type UserRole =
  | "admin"
  | "restaurant_owner"
  | "waiter"
  | "kitchen"
  | "inventory_mgr"
  | "driver"
  | "customer";

// ------------------ FRIENDLY LABELS ------------------
export const UserRoleLabels: Record<UserRole, string> = {
  admin: "Admin",
  restaurant_owner: "Restaurant Owner",
  waiter: "Waiter",
  kitchen: "Kitchen",
  inventory_mgr: "Inventory Manager",
  driver: "Driver",
  customer: "Customer",
};

export interface DecodedToken extends JwtPayload {
  role: UserRole;
  user_id: string;
  token_type: string;
  jti: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string, email: string, accountType: UserRole) => void;
  logout: () => void;
  saveProfile: (profile: unknown) => void;
  email: string;
  token: string;
  accountType: string;
  isOwner: boolean;
  isWaiter: boolean;
  isAdmin: boolean;
  isKitchen: boolean;
  loading: boolean;
}

const defaultAuthContext: AuthContextType = {
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  saveProfile: () => {},
  email: "",
  token: "",
  accountType: "",
  isAdmin: false,
  isWaiter: false,
  isKitchen: false,
  isOwner: false,
  loading: true,
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const useAuth = () => useContext(AuthContext);

interface TokenExpiryInfo {
  expired: boolean;
  hours: number;
  days: number;
  totalLifetimeHours: number;
  totalLifetimeDays: number;
  remainingSeconds: number;
}

export const tokenExpiresIn = (iat: number, exp: number): TokenExpiryInfo => {
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const oneDayInSeconds = 24 * 60 * 60;
  const adjustedExp = exp - oneDayInSeconds;
  const diffInSeconds = adjustedExp - nowInSeconds;
  const totalLifetimeSeconds = exp - iat;
  const totalLifetimeHours = Math.floor(totalLifetimeSeconds / 3600);
  const totalLifetimeDays = Math.floor(totalLifetimeSeconds / (3600 * 24));

  if (diffInSeconds <= 0) {
    return {
      expired: true,
      hours: 0,
      days: 0,
      totalLifetimeHours,
      totalLifetimeDays,
      remainingSeconds: 0,
    };
  }

  const hours = Math.floor(diffInSeconds / 3600);
  const days = Math.floor(diffInSeconds / (3600 * 24));

  return {
    expired: false,
    hours,
    days,
    totalLifetimeHours,
    totalLifetimeDays,
    remainingSeconds: diffInSeconds,
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [accountType, setAccountType] = useState<UserRole | "">("");
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const isWaiter = accountType === "waiter";
  const isKitchen = accountType === "kitchen";
  const isAdmin = accountType === "admin";
  const isOwner = accountType === "restaurant_owner"

  useEffect(() => {
    const restoreSession = () => {
      const storedToken = localStorage.getItem("access_token");
      const storedEmail = localStorage.getItem("user_email");

      if (storedToken && storedEmail) {
        try {
          const decoded = jwtDecode<DecodedToken>(storedToken);
          const tokenStatus = tokenExpiresIn(
            decoded.iat ?? 0,
            decoded.exp ?? 0
          );
          if (!tokenStatus.expired) {
            setToken(storedToken);
            setEmail(storedEmail);
            setAccountType(decoded.role);
            setIsAuthenticated(true);
          } else {
            localStorage.clear();
          }
        } catch (error) {
          console.error("Token decode error:", error);
          localStorage.clear();
        }
      }

      setLoading(false); // ✅ Finish restoring
    };

    restoreSession();
  }, []);

  const login = (accessToken: string, email: string, accountType: UserRole) => {
    setToken(accessToken);
    setEmail(email);
    setAccountType(accountType);
    setIsAuthenticated(true);
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("user_email", email);
  };

  const logout = () => {
    setToken("");
    setEmail("");
    setAccountType("");
    setIsAuthenticated(false);
    localStorage.clear();
  };

  const saveProfile = (profile: unknown) => {
    localStorage.setItem("user_profile", JSON.stringify(profile));
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        saveProfile,
        email,
        token,
        accountType,
        isAdmin,
        isKitchen,
        isWaiter,
        isOwner,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
