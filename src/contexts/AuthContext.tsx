import React, { createContext, useState, useContext, useEffect } from "react";
import { jwtDecode, JwtPayload } from "jwt-decode";
import {
  RestaurantDataLogin,
  UserDataLogin,
} from "@/api-services/auth.service";

// ------------------ USER ROLE TYPE ------------------
export type UserRole =
  | "admin"
  | "restaurant_owner"
  | "waiter"
  | "kitchen"
  | "inventory_mgr"
  | "driver"
  | "customer"
  | "unassigned";

// ------------------ FRIENDLY LABELS ------------------
export const UserRoleLabels: Record<UserRole, string> = {
  admin: "Admin",
  restaurant_owner: "Restaurant Owner",
  waiter: "Waiter",
  kitchen: "Kitchen",
  inventory_mgr: "Inventory Manager",
  driver: "Driver",
  customer: "Customer",
  unassigned: "Not Assigned",
};

export interface DecodedToken extends JwtPayload {
  role: UserRole;
  user_id: string;
  token_type: string;
  jti: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (
    token: string,
    email: string,
    accountType: UserRole,
    profile: UserDataLogin,
    restaurants: RestaurantDataLogin[]
  ) => void;
  logout: () => void;
  saveProfile: (profile: UserDataLogin) => void;
  email: string;
  token: string;
  accountType: string;
  isOwner: boolean;
  isWaiter: boolean;
  isAdmin: boolean;
  isKitchen: boolean;
  isInventoryMgr: boolean;
  loading: boolean;
  user: UserDataLogin | null;
  restaurants: RestaurantDataLogin[];
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
  isInventoryMgr: false,
  loading: true,
  user: null,
  restaurants: [],
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
  const [user, setUser] = useState<UserDataLogin | null>(null);
  const [restaurants, setRestaurants] = useState<RestaurantDataLogin[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const isWaiter = accountType === "waiter";
  const isKitchen = accountType === "kitchen";
  const isAdmin = accountType === "admin";
  const isOwner = accountType === "restaurant_owner";
  const isInventoryMgr = accountType === "inventory_mgr";

  // ------------------ RESTORE SESSION ------------------
  useEffect(() => {
    const restoreSession = () => {
      const storedToken = localStorage.getItem("access_token");
      const storedEmail = localStorage.getItem("user_email");
      const storedProfile = localStorage.getItem("user_profile");
      const storedRestaurants = localStorage.getItem("user_restaurants");

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

            if (storedProfile) setUser(JSON.parse(storedProfile));
            if (storedRestaurants)
              setRestaurants(JSON.parse(storedRestaurants));
          } else {
            localStorage.clear();
          }
        } catch (error) {
          console.error("Token decode error:", error);
          localStorage.clear();
        }
      }

      setLoading(false);
    };

    restoreSession();
  }, []);

  // ------------------ LOGIN ------------------
  const login = (
    accessToken: string,
    email: string,
    accountType: UserRole,
    profile: UserDataLogin,
    restaurants: RestaurantDataLogin[]
  ) => {
    setToken(accessToken);
    setEmail(email);
    setAccountType(accountType);
    setUser(profile);
    setRestaurants(restaurants);
    setIsAuthenticated(true);

    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("user_email", email);
    localStorage.setItem("user_profile", JSON.stringify(profile));
    localStorage.setItem("user_restaurants", JSON.stringify(restaurants));
  };

  // ------------------ LOGOUT ------------------
  const logout = () => {
    setToken("");
    setEmail("");
    setAccountType("");
    setUser(null);
    setRestaurants([]);
    setIsAuthenticated(false);
    localStorage.clear();
  };

  const saveProfile = (profile: UserDataLogin) => {
    setUser(profile);
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
        isInventoryMgr,
        loading,
        user,
        restaurants,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
