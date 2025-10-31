import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// ---------------- Types ----------------
export interface StaffAccount {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: "admin" | "manager" | "staff" | "driver";
  status: "active" | "inactive";
}

// ---------------- Mock Data ----------------
export const staffAccounts: StaffAccount[] = [
  {
    id: "1",
    first_name: "John",
    last_name: "Doe",
    email: "john.doe@example.com",
    phone: "+2348012345678",
    role: "admin",
    status: "active",
  },
  {
    id: "2",
    first_name: "Mary",
    last_name: "Johnson",
    email: "mary.johnson@example.com",
    phone: "+2348098765432",
    role: "manager",
    status: "active",
  },
  {
    id: "3",
    first_name: "David",
    last_name: "Okafor",
    email: "david.okafor@example.com",
    phone: "+2348076543210",
    role: "staff",
    status: "active",
  },
  {
    id: "4",
    first_name: "Grace",
    last_name: "Adams",
    email: "grace.adams@example.com",
    phone: "+2348056789012",
    role: "driver",
    status: "inactive",
  },
  {
    id: "5",
    first_name: "Michael",
    last_name: "Olawale",
    email: "michael.olawale@example.com",
    phone: "+2348081122334",
    role: "staff",
    status: "active",
  },
  {
    id: "6",
    first_name: "Chinwe",
    last_name: "Eze",
    email: "chinwe.eze@example.com",
    phone: "+2348064455667",
    role: "manager",
    status: "inactive",
  },
  {
    id: "7",
    first_name: "Samuel",
    last_name: "Bello",
    email: "samuel.bello@example.com",
    phone: "+2348045566778",
    role: "staff",
    status: "active",
  },
  {
    id: "8",
    first_name: "Joy",
    last_name: "Okonkwo",
    email: "joy.okonkwo@example.com",
    phone: "+2348077788990",
    role: "driver",
    status: "active",
  },
  {
    id: "9",
    first_name: "Ibrahim",
    last_name: "Aliyu",
    email: "ibrahim.aliyu@example.com",
    phone: "+2348099988776",
    role: "staff",
    status: "inactive",
  },
  {
    id: "10",
    first_name: "Patricia",
    last_name: "Williams",
    email: "patricia.williams@example.com",
    phone: "+2348011223344",
    role: "manager",
    status: "active",
  },
];
interface StaffState {
  data: Record<string, StaffAccount[]>; // paginated
}

const initialState: StaffState = {
  data: {"1": staffAccounts},
};

// ---------------- Helper ----------------
function uniqueBy<T, K extends keyof T>(items: T[], key: K): T[] {
  const seen = new Set<T[K]>();
  return items.filter((item) => {
    const val = item[key];
    if (seen.has(val)) return false;
    seen.add(val);
    return true;
  });
}

// ---------------- Slice ----------------
const staffSlice = createSlice({
  name: "staff",
  initialState,
  reducers: {
    updateStaffData: (
      state,
      action: PayloadAction<{ key: string; data: StaffAccount[] }>
    ) => {
      const { key, data } = action.payload;
      state.data[key] = uniqueBy([...(state.data[key] || []), ...data], "id");
    },
    updateStaffDataById: (state, action: PayloadAction<StaffAccount>) => {
      Object.keys(state.data).forEach((key) => {
        state.data[key] = state.data[key].map((item) =>
          item.id === action.payload.id ? action.payload : item
        );
      });
    },
    removeStaffDataById: (state, action: PayloadAction<string>) => {
      Object.keys(state.data).forEach((key) => {
        state.data[key] = state.data[key].filter(
          (item) => item.id !== action.payload
        );
      });
    },
    clearStaffData: (state) => {
      state.data = {};
    },
  },
});

export const {
  updateStaffData,
  updateStaffDataById,
  removeStaffDataById,
  clearStaffData,
} = staffSlice.actions;

export default staffSlice.reducer;
