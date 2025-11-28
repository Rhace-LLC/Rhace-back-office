"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { parseError } from "@/api-services/utils/parseError";
import {
  registerRestaurant,
} from "@/api-services/auth.service";
import { Eye, EyeOff } from "lucide-react";
import RhaceImage from "../../assets/Rhace-10.png";
import { Country, State, City } from "country-state-city";
import { UserRole } from "@/contexts/AuthContext";

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

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mb-5 text-center">
            <img
              src={RhaceImage}
              alt="Rhace Logo"
              className="mx-auto !w-[100px]"
            />
          </div>
          <CardTitle className="text-2xl font-semibold text-gray-800">
            Restaurant Registration
          </CardTitle>
          <CardDescription>
            Register your restaurant, fill in the details below
          </CardDescription>
        </CardHeader>

        <CardContent>
              <form onSubmit={handleOwnerSubmit} className="mt-4 space-y-3">
                <div>
                  <Label>Restaurant Name</Label>
                  <Input
                    value={ownerForm.restaurant_name}
                    onChange={(e) =>
                      handleOwnerChange("restaurant_name", e.target.value)
                    }
                  />
                  {errors.restaurant_name && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.restaurant_name}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Restaurant Email</Label>
                    <Input
                      type="email"
                      value={ownerForm.restaurant_email}
                      onChange={(e) =>
                        handleOwnerChange("restaurant_email", e.target.value)
                      }
                    />
                    {errors.restaurant_email && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.restaurant_email}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Restaurant Phone</Label>
                    <Input
                      type="tel"
                      value={ownerForm.restaurant_phone}
                      onChange={(e) =>
                        handleOwnerChange("restaurant_phone", e.target.value)
                      }
                    />
                    {errors.restaurant_phone && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.restaurant_phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Owner First Name</Label>
                    <Input
                      value={ownerForm.owner_first_name}
                      onChange={(e) =>
                        handleOwnerChange("owner_first_name", e.target.value)
                      }
                    />
                    {errors.owner_first_name && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.owner_first_name}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Owner Last Name</Label>
                    <Input
                      value={ownerForm.owner_last_name}
                      onChange={(e) =>
                        handleOwnerChange("owner_last_name", e.target.value)
                      }
                    />
                    {errors.owner_last_name && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.owner_last_name}
                      </p>
                    )}
                  </div>
                </div>

                {/* ---------------- OWNER CONTACT ---------------- */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Owner Email</Label>
                    <Input
                      type="email"
                      value={ownerForm.owner_email}
                      onChange={(e) =>
                        handleOwnerChange("owner_email", e.target.value)
                      }
                    />
                    {errors.owner_email && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.owner_email}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>Owner Phone</Label>
                    <Input
                      type="tel"
                      value={ownerForm.owner_phone}
                      onChange={(e) =>
                        handleOwnerChange("owner_phone", e.target.value)
                      }
                    />
                    {errors.owner_phone && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.owner_phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* ---------------- ADDRESS INFO ---------------- */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Address</Label>
                    <Input
                      value={ownerForm.address}
                      onChange={(e) =>
                        handleOwnerChange("address", e.target.value)
                      }
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.address}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Country</Label>
                    <select
                      className="w-full rounded border border-gray-300 p-2"
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
                      <p className="mt-1 text-sm text-red-500">
                        {errors.country}
                      </p>
                    )}
                  </div>
                </div>

                {/* ---------------- COUNTRY & STATE ---------------- */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>State</Label>
                    <select
                      className="w-full rounded border border-gray-300 p-2"
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
                      <p className="mt-1 text-sm text-red-500">
                        {errors.state}
                      </p>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <Label>City</Label>
                    <select
                      className="mt-1 w-full rounded-md border p-2"
                      value={ownerForm.city}
                      onChange={(e) =>
                        handleOwnerChange("city", e.target.value)
                      }
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
                      <p className="mt-1 text-sm text-red-500">{errors.city}</p>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <Label>Password</Label>
                  <Input
                    type={showOwnerPassword ? "text" : "password"}
                    value={ownerForm.password}
                    onChange={(e) =>
                      handleOwnerChange("password", e.target.value)
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowOwnerPassword(!showOwnerPassword)}
                    className="absolute top-9 right-3 text-gray-500 hover:text-gray-700"
                  >
                    {showOwnerPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="relative">
                  <Label>Confirm Password</Label>
                  <Input
                    type={showOwnerConfirmPassword ? "text" : "password"}
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
                    className="absolute top-9 right-3 text-gray-500 hover:text-gray-700"
                  >
                    {showOwnerConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                  {errors.confirm_password && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.confirm_password}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                  style={{ backgroundColor: "#2542e3" }}
                >
                  {loading ? "Registering..." : "Register Restaurant"}
                </Button>
              </form>


          <p className="text-muted-foreground mt-5 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-[#2542e3] hover:underline">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
