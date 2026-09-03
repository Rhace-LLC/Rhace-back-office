export interface RestaurantInfo {
  name: string;
  description: string;
  features: string[];
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  website: string;
  instagram: string;
  logoUrl?: string;
  coverUrl?: string;
}

export type MenuMode = "sample" | "manual" | "import" | "later";

export interface MenuDraftItem {
  name: string;
  category: string;
  price: string;
  description?: string;
  available: boolean;
}

export interface MenuData {
  mode: MenuMode;
  /** Restaurant-level dish categories the user serves. */
  categories: string[];
  /** Selected dishes (from the sample set, manual builder, etc.). */
  items: MenuDraftItem[];
}

export interface FloorData {
  tableCount: number;
  areas: string[];
  methods: string[];
}

export interface TeamMemberDraft {
  name: string;
  contact: string;
  role: string;
}

export interface TeamData {
  members: TeamMemberDraft[];
}

export type BillingModel = "subscription" | "payg";

export interface OnboardingData {
  restaurant?: RestaurantInfo;
  menu?: MenuData;
  floor?: FloorData;
  team?: TeamData;
  billing?: {
    model: BillingModel;
    planName?: string;
    planPrice?: string;
  };
}
