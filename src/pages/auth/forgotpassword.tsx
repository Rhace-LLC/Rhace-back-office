import { Link } from "react-router-dom";
import RhaceLogo from "../../assets/Rhace-10.png";
import { useState } from "react";
import { useLoading } from "@/contexts/LoadingContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { requestPasswordReset } from "@/api-services/auth.service";

export interface FormErrors {
  [key: string]: string;
}

export default function ForgotPassword() {
  const { setLoading, setLoadingText } = useLoading();
  const [form, setForm] = useState({ email: "" });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = () => {
    const errors: FormErrors = {};
    if (!form.email.trim()) errors.email = "Email is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.email && !emailRegex.test(form.email))
      errors.email = "Invalid email address";

    return { valid: Object.keys(errors).length === 0, errors };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { valid, errors } = validateForm();
    setErrors(errors);
    if (!valid) {
      Object.values(errors).forEach((err) => toast.error(err));
      return;
    }

    try {
      setLoadingText("Sending reset link...");
      setLoading(true);

      const response = await requestPasswordReset(form.email);

      toast.success(response?.message || "Password reset link sent!");
    } catch (error) {
      toast.error("Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-lg bg-transparent shadow-sm rounded-[10px] p-8 py-[100px] space-y-10 relative z-10">
        <div className="text-center">
          <img src={RhaceLogo} alt="Rhace Logo" className="w-[150px] mx-auto" />
        </div>

        <div className="text-center">
          <h3 className="text-3xl font-bold text-gray-800">Forgot Password</h3>
          <p className="font-medium text-gray-500 mt-2">
            Enter your email to receive a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
            {errors.email && <small className="text-red-500">{errors.email}</small>}
          </div>

          <Button
            type="submit"
            className="rounded-[10px] w-full bg-blue-600 hover:bg-blue-700"
          >
            Send Reset Link
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600">
          <Link to="/login" className="text-blue-600 hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
