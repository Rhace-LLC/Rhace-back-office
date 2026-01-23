"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { parseError } from "@/api-services/utils/parseError";
import { registerRestaurant } from "@/api-services/auth.service";
import { Eye, EyeOff, Loader2 } from "lucide-react";
//import RhaceImage from "../../assets/Rhace-10.png";
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

export interface BasicSignUpData {
  owner_first_name: string;
  owner_last_name: string;
  owner_email: string;
  owner_phone: string;
  password: string;
  confirm_password?: string;
}

interface FormErrors {
  [key: string]: string;
}

/** Validate basic signup form */
export const validateBasicSignupForm = (form: BasicSignUpData) => {
  const errors: FormErrors = {};

  // --- Basic info ---
  if (!form.owner_first_name?.trim()) {
    errors.owner_first_name = "First name is required";
  }

  if (!form.owner_last_name?.trim()) {
    errors.owner_last_name = "Last name is required";
  }

  if (!form.owner_email?.trim()) {
    errors.owner_email = "owner_Email is required";
  }

  if (!form.owner_phone?.trim()) {
    errors.owner_phone = "owner_Phone number is required";
  }

  if (!form.password?.trim()) {
    errors.password = "Password is required";
  }

  if (!form.confirm_password?.trim()) {
    errors.confirm_password = "Confirm password is required";
  }

  // --- owner_Email validation ---
  const owner_emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (form.owner_email && !owner_emailRegex.test(form.owner_email)) {
    errors.owner_email = "Invalid owner_email address";
  }

  // --- owner_Phone validation ---
  const owner_phoneRegex = /^[0-9+]{7,15}$/;
  if (form.owner_phone && !owner_phoneRegex.test(form.owner_phone)) {
    errors.owner_phone = "Invalid owner_phone number";
  }

  // --- Password strength ---
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
  if (form.password && !passwordRegex.test(form.password)) {
    errors.password =
      "Password must be at least 6 characters, include one uppercase letter and one number";
  }

  // --- Confirm password match ---
  if (
    form.password &&
    form.confirm_password &&
    form.password !== form.confirm_password
  ) {
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
  // Basic signup form
  const [formData, setFormData] = useState<BasicSignUpData>({
    owner_first_name: "",
    owner_last_name: "",
    owner_email: "",
    owner_phone: "",
    password: "",
    confirm_password: "",
  });

  const handleChange = (field: keyof BasicSignUpData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors(() => ({}));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.preventDefault();
    const { valid, errors } = validateBasicSignupForm(formData);
    setErrors(errors);
    console.log(valid, errors);

    if (!valid) {
      return;
    }

    setLoading(true);
    try {
      const response = await registerRestaurant(formData);
      console.log("Response:", response);
      toast.success("Restaurant Registered successfully!");
      navigate(
        `/verify_email?email=${encodeURIComponent(formData.owner_email)}`
      );
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
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* OWNER FIRST + LAST NAME */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium tracking-tight text-gray-700">
                  First Name
                </label>
                <input
                  className="h-12 w-full rounded-sm bg-gray-100 px-5 transition-all duration-200 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={formData.owner_first_name}
                  onChange={(e) =>
                    handleChange("owner_first_name", e.target.value)
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
                  Last Name
                </label>
                <input
                  className="h-12 w-full rounded-sm bg-gray-100 px-5 transition-all duration-200 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={formData.owner_last_name}
                  onChange={(e) =>
                    handleChange("owner_last_name", e.target.value)
                  }
                />
                {errors.owner_last_name && (
                  <p className="text-sm text-red-500">
                    {errors.owner_last_name}
                  </p>
                )}
              </div>
            </div>

            {/* OWNER owner_EMAIL + owner_PHONE */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium tracking-tight text-gray-700">
                  Email
                </label>
                <input
                  type="owner_email"
                  className="h-12 w-full rounded-sm bg-gray-100 px-5 transition-all duration-200 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={formData.owner_email}
                  onChange={(e) => handleChange("owner_email", e.target.value)}
                />
                {errors.owner_email && (
                  <p className="text-sm text-red-500">{errors.owner_email}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium tracking-tight text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  className="h-12 w-full rounded-sm bg-gray-100 px-5 transition-all duration-200 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={formData.owner_phone}
                  onChange={(e) => handleChange("owner_phone", e.target.value)}
                />
                {errors.owner_phone && (
                  <p className="text-sm text-red-500">{errors.owner_phone}</p>
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
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
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
                value={formData.confirm_password}
                onChange={(e) =>
                  handleChange("confirm_password", e.target.value)
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
                  <Loader2 className="mr-5 inline-block h-5 w-5 animate-spin" />{" "}
                  Registering...
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
