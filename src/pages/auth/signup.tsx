"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { parseError } from "@/api-services/utils/parseError";
import { registerRestaurant } from "@/api-services/auth.service";
import { Eye, EyeOff, Loader2 } from "lucide-react";
//import RhaceImage from "../../assets/Rhace-10.png";
import { Country, State, City } from "country-state-city";
import { UserRole } from "@/contexts/AuthContext";

import "./auth.css";

export const UserRoleLabels: Record<UserRole, string> = {
  admin: "Admin",
  waiter: "Waiter",
  kitchen: "Kitchen",
  inventory_mgr: "Inventory Manager",
  driver: "Driver",
  customer: "Customer",
  unassigned: "Unassigned",
  restaurant_owner: "Owner",
};

export interface SignUpData {
  restaurant_name: string;
  restaurant_email: string;
  restaurant_phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  description: string;
  cuisine_type: string;
  owner_first_name: string;
  owner_last_name: string;
  owner_email: string;
  owner_phone: string;
  password: string;
  confirm_password: string;
}

export interface EmployeeSignUpData {
  id?: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  password: string;
  confirm_password: string;
  role: UserRole;
  is_verified?: boolean;
  invitation_token?: string;
}

interface FormErrors {
  [key: string]: string;
}

/** Validate employee signup form */
export const validateEmployeeSignupForm = (form: EmployeeSignUpData) => {
  const errors: FormErrors = {};

  // --- Required field checks ---
  if (!form.first_name?.trim()) errors.first_name = "First name is required";
  if (!form.last_name?.trim()) errors.last_name = "Last name is required";
  if (!form.email?.trim()) errors.email = "Email is required";
  if (!form.phone?.trim()) errors.phone = "Phone number is required";
  if (!form.password?.trim()) errors.password = "Password is required";
  if (!form.confirm_password?.trim())
    errors.confirm_password = "Confirm password is required";

  // --- Email validation ---
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (form.email && !emailRegex.test(form.email)) {
    errors.email = "Invalid email address";
  }

  // --- Phone validation ---
  const phoneRegex = /^[0-9+]{7,15}$/;
  if (form.phone && !phoneRegex.test(form.phone)) {
    errors.phone = "Invalid phone number";
  }

  // --- Password validation ---
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
  if (form.password && !passwordRegex.test(form.password)) {
    errors.password =
      "Password must be at least 6 characters, include one uppercase letter and one number";
  }

  // --- Confirm password match ---
  if (form.password !== form.confirm_password) {
    errors.confirm_password = "Passwords do not match";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/** Validate restaurant (owner) signup form */
export const validateRestaurantSignupForm = (form: SignUpData) => {
  const errors: FormErrors = {};

  // --- Restaurant info ---
  if (!form.restaurant_name?.trim())
    errors.restaurant_name = "Restaurant name is required";
  if (!form.restaurant_email?.trim())
    errors.restaurant_email = "Restaurant email is required";
  if (!form.restaurant_phone?.trim())
    errors.restaurant_phone = "Restaurant phone is required";
  if (!form.address?.trim()) errors.address = "Address is required";
  if (!form.city?.trim()) errors.city = "City is required";
  if (!form.state?.trim()) errors.state = "State is required";
  if (!form.country?.trim()) errors.country = "Country is required";

  // --- Owner info ---
  if (!form.owner_first_name?.trim())
    errors.owner_first_name = "Owner first name is required";
  if (!form.owner_last_name?.trim())
    errors.owner_last_name = "Owner last name is required";
  if (!form.owner_email?.trim()) errors.owner_email = "Owner email is required";
  if (!form.owner_phone?.trim()) errors.owner_phone = "Owner phone is required";
  if (!form.password?.trim()) errors.password = "Password is required";
  if (!form.confirm_password?.trim())
    errors.confirm_password = "Confirm password is required";

  // --- Email validation ---
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (form.restaurant_email && !emailRegex.test(form.restaurant_email)) {
    errors.restaurant_email = "Invalid restaurant email address";
  }
  if (form.owner_email && !emailRegex.test(form.owner_email)) {
    errors.owner_email = "Invalid owner email address";
  }

  // --- Phone validation ---
  const phoneRegex = /^[0-9+]{7,15}$/;
  if (form.restaurant_phone && !phoneRegex.test(form.restaurant_phone)) {
    errors.restaurant_phone = "Invalid restaurant phone number";
  }
  if (form.owner_phone && !phoneRegex.test(form.owner_phone)) {
    errors.owner_phone = "Invalid owner phone number";
  }

  // --- Password validation ---
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
  if (form.password && !passwordRegex.test(form.password)) {
    errors.password =
      "Password must be at least 6 characters, include one uppercase letter and one number";
  }

  // --- Confirm password match ---
  if (form.password !== form.confirm_password) {
    errors.confirm_password = "Passwords do not match";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

const businessTalks = [
  {
    mainText: "Effective Menu Planning for Seasonal and Holiday Specials",
    subText:
      "Offer seasonal and holiday dishes while keeping preparation manageable and quality consistent.",
  },
  {
    mainText:
      "Building Customer Loyalty Through Personalized Engagement Strategies",
    subText:
      "Use rewards and targeted promotions to encourage repeat visits and strengthen customer connections.",
  },
  {
    mainText: "Maximizing Social Media Presence to Drive Restaurant Awareness",
    subText:
      "Engage your audience with high-quality content and consistent interaction across platforms.",
  },
  {
    mainText: "Optimizing Supply Chain Management for Cost Efficiency",
    subText:
      "Reduce waste and maintain stock levels by improving supply chain efficiency.",
  },
  {
    mainText: "Comprehensive Staff Training to Enhance Customer Experiences",
    subText:
      "Train staff thoroughly in service, menu knowledge, and operations for consistent experiences.",
  },
  {
    mainText: "Implementing Data-Driven Marketing to Increase Brand Visibility",
    subText:
      "Use analytics to target campaigns and attract the right customers effectively.",
  },
  {
    mainText: "Creating a Sustainable and Eco-Friendly Restaurant Operation",
    subText:
      "Adopt sustainable practices like local sourcing and waste reduction to appeal to conscious customers.",
  },
];
// -------------------- COMPONENT --------------------
export function SignUp() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [showOwnerPassword, setShowOwnerPassword] = useState(false);
  const [showOwnerConfirmPassword, setShowOwnerConfirmPassword] =
    useState(false);

  // Owner signup form
  const [ownerForm, setOwnerForm] = useState<SignUpData>({
    restaurant_name: "",
    restaurant_email: "",
    restaurant_phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postal_code: "",
    description: "",
    cuisine_type: "",
    owner_first_name: "",
    owner_last_name: "",
    owner_email: "",
    owner_phone: "",
    password: "",
    confirm_password: "",
  });

  const [countries] = useState(Country.getAllCountries());
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]); // 👈 added city state

  const handleCountryChange = (value: string) => {
    handleOwnerChange("country", value);
    const selectedCountry = countries.find((c: any) => c.name === value);
    if (selectedCountry) {
      const fetchedStates = State.getStatesOfCountry(selectedCountry.isoCode);
      setStates(fetchedStates);
    }
  };

  const handleStateChange = (value: string) => {
    handleOwnerChange("state", value);
    handleOwnerChange("city", "");
    const selectedCountry = countries.find(
      (c: any) => c.name === ownerForm.country
    );
    const selectedState = states.find((s: any) => s.name === value);
    if (selectedCountry && selectedState) {
      const fetchedCities = City.getCitiesOfState(
        selectedCountry.isoCode,
        selectedState.isoCode
      );
      setCities(fetchedCities);
    }
  };

  const handleOwnerChange = (field: keyof SignUpData, value: string) => {
    setOwnerForm((prev) => ({ ...prev, [field]: value }));
    setErrors(() => ({}));
  };

  const handleOwnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.preventDefault();
    const { valid, errors } = validateRestaurantSignupForm(ownerForm);
    setErrors(errors);
    console.log(valid, errors);

    if (!valid) {
      return;
    }

    setLoading(true);
    try {
      const payload = {
        restaurant_name: ownerForm.restaurant_name,
        restaurant_email: ownerForm.restaurant_email,
        restaurant_phone: ownerForm.restaurant_phone,
        address: ownerForm.address,
        city: ownerForm.city,
        state: ownerForm.state,
        country: ownerForm.country,
        postal_code: ownerForm.postal_code,
        description: ownerForm.description,
        cuisine_type: ownerForm.cuisine_type,
        owner_first_name: ownerForm.owner_first_name,
        owner_last_name: ownerForm.owner_last_name,
        owner_email: ownerForm.owner_email,
        owner_phone: ownerForm.owner_phone,
        password: ownerForm.password,
        confirm_password: ownerForm.confirm_password,
      };
      const response = await registerRestaurant(payload);
      console.log("Response:", response);
      toast.success("Restaurant Registered successfully!");
      navigate(`/verify-email?email=${ownerForm.owner_email}`);
    } catch (error: any) {
      const message = parseError(error) || "Something went wrong!";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const [visibleIndex, setVisibleIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleIndex((prev) => (prev + 1) % businessTalks.length);
    }, 5000); // change every 3 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="signup-page-main item-center flex min-h-screen w-full justify-center">
        <div className="fixed top-0 left-0 hidden h-full w-[40%] sm:block">
          {/* Layer WRAPPER (creates stacking context) */}
          <div className="relative h-full w-full rounded-3xl">
            {/* Layer 1 — Background Image */}
            <div className="absolute top-0 left-0 h-full w-full">
              <img
                src="https://res.cloudinary.com/mixam/image/upload/v1765439452/sb5gch0g6ologhm6mchk.png"
                className="inset-0 mt-[5%] ml-[5%] h-[95%] w-[95%] rounded-4xl"
              />
            </div>

            {/* Layer 2 — Text Overlay */}
            <div className="absolute top-[25%] left-1/2 z-10 w-[80%] max-w-xs -translate-x-1/2 rounded-xl bg-white/50 p-6 text-center backdrop-blur-md">
              <AnimatePresence mode="wait">
                <motion.div
                  key={visibleIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-3xl text-gray-800">
                    {businessTalks[visibleIndex].mainText}
                  </h2>
                  <p className="mt-10 text-sm text-gray-600">
                    {businessTalks[visibleIndex].subText}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="w-full space-y-10 px-4 pt-4 sm:ml-[40%] sm:w-[60%] sm:px-9">
          {/* Main Content Here */}

          <div className="space-y-2">
            <p className="mt-2 text-sm leading-relaxed text-gray-400">
              Get Started for Free
            </p>
            <h1 className="text-3xl font-bold tracking-tighter">
              Begin Your Journey With Rhace
            </h1>
            <p className="mt-2 leading-relaxed text-gray-600">
              Everything you need to run your restaurant smoothly—right at your
              fingertips.
            </p>
          </div>
          <form onSubmit={handleOwnerSubmit} className="mt-4 space-y-4">
            {/* RESTAURANT NAME */}
            <div className="space-y-2">
              <label className="text-sm font-medium tracking-tight text-gray-700">
                Restaurant Name
              </label>
              <input
                className="h-12 w-full rounded-sm bg-gray-100 px-5 transition-all duration-200 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={ownerForm.restaurant_name}
                onChange={(e) =>
                  handleOwnerChange("restaurant_name", e.target.value)
                }
              />
              {errors.restaurant_name && (
                <p className="text-sm text-red-500">{errors.restaurant_name}</p>
              )}
            </div>

            {/* RESTAURANT EMAIL + PHONE */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium tracking-tight text-gray-700">
                  Restaurant Email
                </label>
                <input
                  type="email"
                  className="h-12 w-full rounded-sm bg-gray-100 px-5 transition-all duration-200 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={ownerForm.restaurant_email}
                  onChange={(e) =>
                    handleOwnerChange("restaurant_email", e.target.value)
                  }
                />
                {errors.restaurant_email && (
                  <p className="text-sm text-red-500">
                    {errors.restaurant_email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium tracking-tight text-gray-700">
                  Restaurant Phone
                </label>
                <input
                  type="tel"
                  className="h-12 w-full rounded-sm bg-gray-100 px-5 transition-all duration-200 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={ownerForm.restaurant_phone}
                  onChange={(e) =>
                    handleOwnerChange("restaurant_phone", e.target.value)
                  }
                />
                {errors.restaurant_phone && (
                  <p className="text-sm text-red-500">
                    {errors.restaurant_phone}
                  </p>
                )}
              </div>
            </div>

            {/* OWNER FIRST + LAST NAME */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium tracking-tight text-gray-700">
                  Owner First Name
                </label>
                <input
                  className="h-12 w-full rounded-sm bg-gray-100 px-5 transition-all duration-200 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={ownerForm.owner_first_name}
                  onChange={(e) =>
                    handleOwnerChange("owner_first_name", e.target.value)
                  }
                />
                {errors.owner_first_name && (
                  <p className="text-sm text-red-500">
                    {errors.owner_first_name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium tracking-tight text-gray-700">
                  Owner Last Name
                </label>
                <input
                  className="h-12 w-full rounded-sm bg-gray-100 px-5 transition-all duration-200 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={ownerForm.owner_last_name}
                  onChange={(e) =>
                    handleOwnerChange("owner_last_name", e.target.value)
                  }
                />
                {errors.owner_last_name && (
                  <p className="text-sm text-red-500">
                    {errors.owner_last_name}
                  </p>
                )}
              </div>
            </div>

            {/* OWNER EMAIL + PHONE */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium tracking-tight text-gray-700">
                  Owner Email
                </label>
                <input
                  type="email"
                  className="h-12 w-full rounded-sm bg-gray-100 px-5 transition-all duration-200 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={ownerForm.owner_email}
                  onChange={(e) =>
                    handleOwnerChange("owner_email", e.target.value)
                  }
                />
                {errors.owner_email && (
                  <p className="text-sm text-red-500">{errors.owner_email}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium tracking-tight text-gray-700">
                  Owner Phone
                </label>
                <input
                  type="tel"
                  className="h-12 w-full rounded-sm bg-gray-100 px-5 transition-all duration-200 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={ownerForm.owner_phone}
                  onChange={(e) =>
                    handleOwnerChange("owner_phone", e.target.value)
                  }
                />
                {errors.owner_phone && (
                  <p className="text-sm text-red-500">{errors.owner_phone}</p>
                )}
              </div>
            </div>

            {/* ADDRESS + COUNTRY */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium tracking-tight text-gray-700">
                  Address
                </label>
                <input
                  className="h-12 w-full rounded-sm bg-gray-100 px-5 transition-all duration-200 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={ownerForm.address}
                  onChange={(e) => handleOwnerChange("address", e.target.value)}
                />
                {errors.address && (
                  <p className="text-sm text-red-500">{errors.address}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium tracking-tight text-gray-700">
                  Country
                </label>
                <select
                  className="h-12 w-full rounded-sm bg-gray-100 px-4 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={ownerForm.country}
                  onChange={(e) => handleCountryChange(e.target.value)}
                >
                  <option value="">Select Country</option>
                  {countries.map((country) => (
                    <option key={country.isoCode} value={country.name}>
                      {country.name}
                    </option>
                  ))}
                </select>
                {errors.country && (
                  <p className="text-sm text-red-500">{errors.country}</p>
                )}
              </div>
            </div>

            {/* STATE + CITY */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium tracking-tight text-gray-700">
                  State
                </label>
                <select
                  className="h-12 w-full rounded-sm bg-gray-100 px-4 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={ownerForm.state}
                  onChange={(e) => handleStateChange(e.target.value)}
                  disabled={!ownerForm.country}
                >
                  <option value="">Select State</option>
                  {states.map((state) => (
                    <option key={state.isoCode} value={state.name}>
                      {state.name}
                    </option>
                  ))}
                </select>
                {errors.state && (
                  <p className="text-sm text-red-500">{errors.state}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium tracking-tight text-gray-700">
                  City
                </label>
                <select
                  className="h-12 w-full rounded-sm bg-gray-100 px-4 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={ownerForm.city}
                  onChange={(e) => handleOwnerChange("city", e.target.value)}
                  disabled={!ownerForm.state}
                >
                  <option value="">Select City</option>
                  {cities.map((city) => (
                    <option key={city.name} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
                {errors.city && (
                  <p className="text-sm text-red-500">{errors.city}</p>
                )}
              </div>
            </div>

            {/* PASSWORD */}
            <div className="relative space-y-2">
              <label className="text-sm font-medium tracking-tight text-gray-700">
                Password
              </label>
              <input
                type={showOwnerPassword ? "text" : "password"}
                className="h-12 w-full rounded-sm bg-gray-100 px-5 pr-12 transition-all duration-200 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={ownerForm.password}
                onChange={(e) => handleOwnerChange("password", e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowOwnerPassword(!showOwnerPassword)}
                className="absolute top-[40px] right-4 text-gray-500 hover:text-gray-700"
              >
                {showOwnerPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="relative space-y-2">
              <label className="text-sm font-medium tracking-tight text-gray-700">
                Confirm Password
              </label>
              <input
                type={showOwnerConfirmPassword ? "text" : "password"}
                className="h-12 w-full rounded-sm bg-gray-100 px-5 pr-12 transition-all duration-200 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={ownerForm.confirm_password}
                onChange={(e) =>
                  handleOwnerChange("confirm_password", e.target.value)
                }
              />
              <button
                type="button"
                onClick={() =>
                  setShowOwnerConfirmPassword(!showOwnerConfirmPassword)
                }
                className="absolute top-[40px] right-4 text-gray-500 hover:text-gray-700"
              >
                {showOwnerConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
              {errors.confirm_password && (
                <p className="text-sm text-red-500">
                  {errors.confirm_password}
                </p>
              )}
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center rounded-sm font-medium text-white transition-all duration-200"
              style={{ backgroundColor: "#2542e3" }}
            >
              {loading ? (
                <span>
                  <Loader2 className="h-5 w-5 animate-spin" /> Registering...
                </span>
              ) : (
                "Register Restaurant"
              )}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-700">
            Already have an account?{" "}
            <span className="text-gray-700">Login to your dashboard</span> here
            and{" "}
            <Link to={"/login"}>
              <span className="font-medium text-blue-600">
                continue your experience
              </span>
            </Link>
          </p>
        </div>
      </div>
      <div className="py-10" />
    </>
  );
}
