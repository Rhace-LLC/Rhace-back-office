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
import { register, RegisterRequestBody } from "@/api-services/auth.service";
import { parseError } from "@/api-services/utils/parseError";
import RhaceImage from "../../assets/Rhace-10.png"

/** User roles available in Bookies system */
export type UserRole =
  | "admin"
  | "waiter"
  | "kitchen"
  | "inventory_mgr"
  | "driver"
  | "customer";

/** Optional: Friendly display mapping */
export const UserRoleLabels: Record<UserRole, string> = {
  admin: "Admin",
  waiter: "Waiter",
  kitchen: "Kitchen",
  inventory_mgr: "Inventory Manager",
  driver: "Driver",
  customer: "Customer",
};

interface SignupForm {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  confirm_password: string;
  role: UserRole;
}

interface FormErrors {
  [key: string]: string;
}

// -------------------- VALIDATOR --------------------
export const validateSignupForm = (form: SignupForm) => {
  const errors: FormErrors = {};

  if (!form.first_name.trim()) errors.first_name = "First name is required";
  if (!form.last_name.trim()) errors.last_name = "Last name is required";
  if (!form.email.trim()) errors.email = "Email is required";
  if (!form.phone.trim()) errors.phone = "Phone number is required";
  if (!form.password.trim()) errors.password = "Password is required";
  if (!form.confirm_password.trim())
    errors.confirm_password = "Confirm password is required";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (form.email && !emailRegex.test(form.email)) {
    errors.email = "Invalid email address";
  }

  const phoneRegex = /^[0-9]{7,15}$/;
  if (form.phone && !phoneRegex.test(form.phone)) {
    errors.phone = "Invalid phone number";
  }

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
  if (form.password && !passwordRegex.test(form.password)) {
    errors.password =
      "Password must be at least 6 characters, include one uppercase letter and one number";
  }

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
  const [form, setForm] = useState<SignupForm>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
    role: "admin",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (field: keyof SignupForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" })); // clear field error on change
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const { valid, errors } = validateSignupForm(form);
    setErrors(errors);

    if (!valid) {
      Object.values(errors).forEach((err) => toast.error(err));
      return;
    }

    // Prepare payload
    const payload: RegisterRequestBody = {
      email: form.email,
      first_name: form.first_name,
      last_name: form.last_name,
      phone: form.phone,
      password: form.password,
      confirm_password: form.confirm_password,
      role: form.role,
    };

    setLoading(true);

    try {
      // Await the register API call
      const response = await register(payload);

      console.log("Response:", response);

      toast.success("Account created successfully!");
      navigate("/verify-email");
    } catch (error: any) {
      // Handle API errors
      console.error("Registration error:", error);
      const message = parseError(error) || "Something went wrong!";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Create Account</CardTitle>
          <CardDescription>Sign up for a new Rhace account</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>First Name</Label>
                <Input
                  onFocus={() => {
                    setErrors({});
                  }}
                  value={form.first_name}
                  onChange={(e) => handleChange("first_name", e.target.value)}
                />
                {errors.first_name && (
                  <small className="text-red-500">{errors.first_name}</small>
                )}
              </div>

              <div>
                <Label>Last Name</Label>
                <Input
                  onFocus={() => {
                    setErrors({});
                  }}
                  value={form.last_name}
                  onChange={(e) => handleChange("last_name", e.target.value)}
                />
                {errors.last_name && (
                  <small className="text-red-500">{errors.last_name}</small>
                )}
              </div>
            </div>

            <div>
              <Label>Email</Label>
              <Input
                onFocus={() => {
                  setErrors({});
                }}
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
              {errors.email && (
                <small className="text-red-500">{errors.email}</small>
              )}
            </div>

            <div>
              <Label>Phone</Label>
              <Input
                onFocus={() => {
                  setErrors({});
                }}
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
              {errors.phone && (
                <small className="text-red-500">{errors.phone}</small>
              )}
            </div>

            <div>
              <Label>Password</Label>
              <Input
                onFocus={() => {
                  setErrors({});
                }}
                type="password"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
              />
              {errors.password && (
                <small className="text-red-500">{errors.password}</small>
              )}
            </div>

            <div>
              <Label>Confirm Password</Label>
              <Input
                onFocus={() => {
                  setErrors({});
                }}
                type="password"
                value={form.confirm_password}
                onChange={(e) =>
                  handleChange("confirm_password", e.target.value)
                }
              />
              {errors.confirm_password && (
                <small className="text-red-500">
                  {errors.confirm_password}
                </small>
              )}
            </div>

            {/* ================= ROLE SELECTION ================= */}
            <div className="my-3 space-y-2">
              <Label>User Role</Label>
              <div className="grid grid-cols-3 gap-2">
                {(["admin", "waiter", "kitchen"] as UserRole[]).map((role) => (
                  <label
                    key={role}
                    className={`flex cursor-pointer items-center gap-2 rounded border border-gray-100 p-2`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role}
                      checked={form.role === role}
                      onChange={() => handleChange("role", role)}
                      className="accent-blue-600"
                    />
                    {UserRoleLabels[role]}
                  </label>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              style={{ backgroundColor: "#2542e3" }}
            >
              {loading ? "Creating account..." : "Sign Up"}
            </Button>

            <p className="text-muted-foreground mt-3 text-center text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-[#2542e3] hover:underline">
                Log in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
