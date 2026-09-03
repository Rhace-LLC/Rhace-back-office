"use client";
import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { parseError } from "@/api-services/utils/parseError";
import { registerRestaurant } from "@/api-services/auth.service";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import RhaceImage from "../../assets/Rhace-10.png";
import { AuthGlows } from "./AuthGlows";
import {
  authButton,
  authField,
  authLabel,
  authPage,
  authPanel,
  authSubtitle,
  authTitle,
  authLink,
} from "./authTokens";

import "./auth.css";

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
const validateBasicSignupForm = (form: BasicSignUpData) => {
  const errors: FormErrors = {};

  // --- Basic info ---
  if (!form.owner_first_name?.trim()) {
    errors.owner_first_name = "First name is required";
  }

  if (!form.owner_last_name?.trim()) {
    errors.owner_last_name = "Last name is required";
  }

  if (!form.owner_email?.trim()) {
    errors.owner_email = "Email is required";
  }

  if (!form.owner_phone?.trim()) {
    errors.owner_phone = "Phone number is required";
  }

  if (!form.password?.trim()) {
    errors.password = "Password is required";
  }

  if (!form.confirm_password?.trim()) {
    errors.confirm_password = "Confirm password is required";
  }

  // --- Email validation ---
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (form.owner_email && !emailRegex.test(form.owner_email)) {
    errors.owner_email = "Invalid email address";
  }

  // --- Phone validation ---
  const phoneRegex = /^[0-9+]{7,15}$/;
  if (form.owner_phone && !phoneRegex.test(form.owner_phone)) {
    errors.owner_phone = "Invalid phone number";
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

// -------------------- COMPONENT --------------------
export function SignUp() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [showOwnerPassword, setShowOwnerPassword] = useState(false);
  const [showOwnerConfirmPassword, setShowOwnerConfirmPassword] =
    useState(false);

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
    const { valid, errors } = validateBasicSignupForm(formData);
    setErrors(errors);

    if (!valid) {
      return;
    }

    setLoading(true);
    try {
      await registerRestaurant(formData);
      toast.success("Restaurant Registered successfully!");
      navigate(
        `/verify-email?email=${encodeURIComponent(formData.owner_email)}`
      );
    } catch (error: unknown) {
      const message = parseError(error) || "Something went wrong!";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const inputError = (field: string) =>
    `${authField} ${errors[field] ? "border-red-400" : ""}`;

  return (
    <div className={`${authPage} relative overflow-hidden py-10 sm:py-14`}>
      {/* Soft atmospheric accents (soft SaaS background treatment) */}
      <AuthGlows />

      <div className="relative z-10 flex w-full justify-center px-4 sm:px-6">
        <div
          className={`${authPanel} flex max-w-[880px] flex-col gap-6 bg-white px-6 py-8 sm:gap-8 sm:p-12 justify-center`}
        >
          {/* Top brand */}
          <div className="flex items-center justify-between">
            <img src={RhaceImage} alt="Rhace" className="h-auto w-[88px]" />
            <Link to="/login" className="text-sm font-medium text-ink-muted transition-colors hover:text-ink">
              Have an account? <span className={authLink}>Log in</span>
            </Link>
          </div>

          {/* Heading */}
          <div className="max-w-lg">
            <p className="text-sm font-medium text-ink-muted">Get Started for Free</p>
            <h1 className={`${authTitle} mt-2`}>
              Begin Your Journey With Rhace
            </h1>
            <p className={authSubtitle}>
              Everything you need to run your restaurant smoothly—right at your
              fingertips.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* OWNER FIRST + LAST NAME */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className={authLabel}>First Name</label>
                <input
                  className={inputError("owner_first_name")}
                  value={formData.owner_first_name}
                  onChange={(e) =>
                    handleChange("owner_first_name", e.target.value)
                  }
                />
                {errors.owner_first_name && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.owner_first_name}
                  </p>
                )}
              </div>

              <div>
                <label className={authLabel}>Last Name</label>
                <input
                  className={inputError("owner_last_name")}
                  value={formData.owner_last_name}
                  onChange={(e) =>
                    handleChange("owner_last_name", e.target.value)
                  }
                />
                {errors.owner_last_name && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.owner_last_name}
                  </p>
                )}
              </div>
            </div>

            {/* OWNER EMAIL + PHONE */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className={authLabel}>Email</label>
                <input
                  type="email"
                  className={inputError("owner_email")}
                  value={formData.owner_email}
                  onChange={(e) => handleChange("owner_email", e.target.value)}
                />
                {errors.owner_email && (
                  <p className="mt-1 text-xs text-red-500">{errors.owner_email}</p>
                )}
              </div>

              <div>
                <label className={authLabel}>Phone</label>
                <input
                  type="tel"
                  className={inputError("owner_phone")}
                  value={formData.owner_phone}
                  onChange={(e) => handleChange("owner_phone", e.target.value)}
                />
                {errors.owner_phone && (
                  <p className="mt-1 text-xs text-red-500">{errors.owner_phone}</p>
                )}
              </div>
            </div>

            {/* PASSWORD */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className={authLabel}>Password</label>
                <div className="relative">
                  <input
                    type={showOwnerPassword ? "text" : "password"}
                    className={`${inputError("password")} pr-11`}
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                  />
                  <button
                    type="button"
                    aria-label={showOwnerPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowOwnerPassword(!showOwnerPassword)}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-ink-subtle transition-colors hover:text-ink"
                  >
                    {showOwnerPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                )}
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label className={authLabel}>Confirm Password</label>
                <div className="relative">
                  <input
                    type={showOwnerConfirmPassword ? "text" : "password"}
                    className={`${inputError("confirm_password")} pr-11`}
                    value={formData.confirm_password}
                    onChange={(e) =>
                      handleChange("confirm_password", e.target.value)
                    }
                  />
                  <button
                    type="button"
                    aria-label={
                      showOwnerConfirmPassword ? "Hide password" : "Show password"
                    }
                    onClick={() =>
                      setShowOwnerConfirmPassword(!showOwnerConfirmPassword)
                    }
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-ink-subtle transition-colors hover:text-ink"
                  >
                    {showOwnerConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                {errors.confirm_password && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.confirm_password}
                  </p>
                )}
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <Button
              type="submit"
              disabled={loading}
              className={`${authButton} mt-2`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register Restaurant"
              )}
            </Button>
          </form>

          <p className="text-center text-sm leading-5 text-ink-muted">
            Already have an account?{" "}
            <Link to={"/login"} className={authLink}>
              Log in to your dashboard
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
