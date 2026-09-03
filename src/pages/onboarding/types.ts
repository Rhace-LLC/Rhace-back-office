export interface RestaurantInfo {
  name: string;
  businessType: string;
  phone: string;
  email: string;
  country: string;
  stateCity: string;
  address: string;
  website: string;
  instagram: string;
  description: string;
  logoUrl?: string;
  coverUrl?: string;
}

export type MenuMode = "manual" | "import" | "sample" | "later";

export interface MenuDraftItem {
  name: string;
  category: string;
  price: string;
  description?: string;
  available: boolean;
}

export interface MenuData {
  mode: MenuMode;
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
