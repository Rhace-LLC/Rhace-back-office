import { useAuth } from "@/contexts/AuthContext";
import { WaiterDashboard } from "./WaiterDashboard";
import { AdminDashboard } from "./AdminDashboard";
import { KitchenDashboard } from "./KitchenDashboard";

export function Dashboard() {
  const auth = useAuth();

  if (auth.isWaiter) {
    return (
      <WaiterDashboard />
    );
  }

  if (auth.isKitchen) {
    return (
      <KitchenDashboard />
    );
  }

  // Admin Dashboard
  return (
    <AdminDashboard />
  );
}
