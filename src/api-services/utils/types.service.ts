export interface RegisterRestaurantResponse {
  detail: string;
  restaurant: {
    id: string;
    name: string;
    slug: string;
    access_url: string;
    access_token_url: string;
    trial_ends_at: string; // ISO date string
  };
  owner_email: string;
}
