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
    restaurants: RestaurantDataLogin[],
    hasPayoutAccount: boolean,
    hasSubscribed: boolean
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

  hasPayoutAccount: boolean;
  setHasPayoutAccount: (v: boolean) => void;

  hasSubscribed: boolean;
  setHasSubscribed: (v: boolean) => void;
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
  hasPayoutAccount: false,
  setHasPayoutAccount: () => {},
  hasSubscribed: false,
  setHasSubscribed: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);
export const useAuth = () => useContext(AuthContext);

// ------------------ TOKEN EXPIRY ------------------
export const tokenExpiresIn = (exp: number) => {
  const now = Math.floor(Date.now() / 1000);
  const oneDay = 86400;
  const adjustedExp = exp - oneDay;
  const diff = adjustedExp - now;

  if (diff <= 0) {
    return { expired: true };
  }

  return { expired: false };
};

// ------------------ PROVIDER ------------------
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

  const [hasPayoutAccount, _setHasPayoutAccount] = useState(false);
  const [hasSubscribed, _setHasSubscribed] = useState(false);

  // Role shortcuts
  const isOwner = accountType === "restaurant_owner";
  const isWaiter = accountType === "waiter";
  const isKitchen = accountType === "kitchen";
  const isAdmin = accountType === "admin";
  const isInventoryMgr = accountType === "inventory_mgr";

  // Persist helper
  const persist = (key: string, value: any) =>
    localStorage.setItem(key, String(value));

  // ------------------ LOCALSTORAGE UPDATE WRAPPERS ------------------
  const setHasPayoutAccount = (value: boolean) => {
    _setHasPayoutAccount(value);
    persist("has_payout_account", value);
  };

  const setHasSubscribed = (value: boolean) => {
    _setHasSubscribed(value);
    persist("has_subscribed", value);
  };

  // ------------------ RESTORE SESSION ------------------
  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");
    const storedEmail = localStorage.getItem("user_email");
    const storedProfile = localStorage.getItem("user_profile");
    const storedRestaurants = localStorage.getItem("user_restaurants");

    const storedHasPayout = localStorage.getItem("has_payout_account");
    const storedHasSubscribed = localStorage.getItem("has_subscribed");

    if (storedToken && storedEmail) {
      try {
        const decoded = jwtDecode<DecodedToken>(storedToken);
        const tokenStatus = tokenExpiresIn(decoded.exp ?? 0);

        if (!tokenStatus.expired) {
          setToken(storedToken);
          setEmail(storedEmail);
          setAccountType(decoded.role);
          setIsAuthenticated(true);

          if (storedProfile) setUser(JSON.parse(storedProfile));
          if (storedRestaurants)
            setRestaurants(JSON.parse(storedRestaurants));

          if (storedHasPayout)
            _setHasPayoutAccount(storedHasPayout === "true");

          if (storedHasSubscribed)
            _setHasSubscribed(storedHasSubscribed === "true");
        } else {
          localStorage.clear();
        }
      } catch (err) {
        console.error("Token decode failed:", err);
        localStorage.clear();
      }
    }

    setLoading(false);
  }, []);

  // ------------------ LOGIN ------------------
  const login = (
    accessToken: string,
    email: string,
    accountType: UserRole,
    profile: UserDataLogin,
    restaurants: RestaurantDataLogin[],
    hasPayoutAccount: boolean,
    hasSubscribed: boolean
  ) => {
    setToken(accessToken);
    setEmail(email);
    setAccountType(accountType);
    setUser(profile);
    setRestaurants(restaurants);
    _setHasPayoutAccount(hasPayoutAccount);
    _setHasSubscribed(hasSubscribed);

    setIsAuthenticated(true);

    persist("access_token", accessToken);
    persist("user_email", email);
    localStorage.setItem("user_profile", JSON.stringify(profile));
    localStorage.setItem("user_restaurants", JSON.stringify(restaurants));
    persist("has_payout_account", hasPayoutAccount);
    persist("has_subscribed", hasSubscribed);
  };

  // ------------------ LOGOUT ------------------
  const logout = () => {
    setToken("");
    setEmail("");
    setAccountType("");
    setUser(null);
    setRestaurants([]);
    _setHasPayoutAccount(false);
    _setHasSubscribed(false);
    setIsAuthenticated(false);

    localStorage.clear();
  };

  const saveProfile = (profile: UserDataLogin) => {
    setUser(profile);
    localStorage.setItem("user_profile", JSON.stringify(profile));
  };

  // ------------------ PROVIDE CONTEXT ------------------
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
        hasPayoutAccount,
        setHasPayoutAccount,
        hasSubscribed,
        setHasSubscribed,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
