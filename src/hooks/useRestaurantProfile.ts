import { useQuery } from "@tanstack/react-query";
import { getRestaurantProfile } from "@/api-services/restaurantProfile";
import { useAuth } from "@/contexts/AuthContext";

export const restaurantProfileKeys = {
  all: ["restaurant", "profile"] as const,
  detail: (id?: string) => ["restaurant", "profile", id] as const,
};

export const useRestaurantProfileQuery = () => {
  const auth = useAuth();
  const restaurantId = auth.restaurants?.[0]?.id;

  return useQuery({
    queryKey: restaurantProfileKeys.detail(restaurantId),
    queryFn: () => getRestaurantProfile(restaurantId!, auth.token),
    enabled: Boolean(
      auth.isOwner && auth.isAuthenticated && auth.token && restaurantId
    ),
  });
};
