import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AdminDashboard } from "./AdminDashboard";
import { KitchenDashboard } from "./KitchenDashboard";
import { WaiterDashboard } from "./WaiterDashboard";

export function Dashboard() {
  const auth = useAuth();

  if (auth.isWaiter) return <WaiterDashboard />;
  if (auth.isKitchen) return <KitchenDashboard />;
  // Inventory managers have no dashboard of their own — send them to their
  // workspace rather than showing owner revenue metrics.
  if (auth.isInventoryMgr) return <Navigate to="/inventory" replace />;

  return <AdminDashboard />;
}
