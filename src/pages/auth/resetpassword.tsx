import RhaceLogo from "../../assets/Rhace-10.png";
import { useState } from "react";
import { useLoading } from "@/contexts/LoadingContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { requestPasswordReset, resetPassword } from "@/api-services/auth.service";
import { Link, useSearchParams } from "react-router-dom";
import { OtpInput } from "@/components/OTP/otp";
import { parseError } from "@/api-services/utils/parseError";

export interface FormErrors {
  [key: string]: string;
}

export default function ResetPassword() {
  const { setLoading, setLoadingText } = useLoading();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";

  const [step, setStep] = useState<"otp" | "reset">("otp");
  const [form, setForm] = useState({
    otp: "",
    password: "",
    confirm_password: "",
  });
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const validateStep = () => {
    const errors: FormErrors = {};
    if (step === "otp") {
      if (otp.length === 0) errors.otp = "OTP is required";
    } else {
      if (!form.password.trim()) errors.password = "Password is required";
      if (!form.confirm_password.trim())
        errors.confirm_password = "Confirm your password";
      if (form.password !== form.confirm_password)
        errors.confirm_password = "Passwords do not match";
    }
    return { valid: Object.keys(errors).length === 0, errors };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { valid, errors } = validateStep();
    setErrors(errors);
    if (!valid) {
      Object.values(errors).forEach((err) => toast.error(err));
      return;
    }

    try {
      setLoading(true);
      if (step === "otp") {
        setLoadingText("Processing...");
        await new Promise((resolve) => setTimeout(resolve, 700)); // simulate success
        toast.success("Enter New Psssword");
        setStep("reset");
      } else {
        setLoadingText("Resetting password...");
        const payload = {
          email,
          otp: otp,
          new_password: form.password,
          confirm_password: form.confirm_password
        };
        const response = await resetPassword(payload);
        console.log("Response", response);
        toast.success(response?.message || "Password reset successful!");
      }
    } catch (error) {
      const errorMessage = parseError(error)
      toast.error(errorMessage || "Failed to reset password. Please try again.")
      setStep('otp')

    } finally {
      setLoading(false);
      setLoadingText("");
    }
  };

    const passwordResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('No Mail Found')
      return;
    }

    try {
      setLoadingText("Sending reset link...");
      setLoading(true);

      const response = await requestPasswordReset(email);

      toast.success(response?.message || "Password reset link sent!");
    } catch (error) {
      toast.error("Failed to send reset link. Please try again.");
    } finally {
      setStep('otp')
      setOtp('')
      setLoading(false);
      setLoadingText("");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="relative z-10 w-full max-w-lg space-y-10 rounded-[10px] bg-transparent p-8 py-[100px] shadow-sm">
        <div className="text-center">
          <img src={RhaceLogo} alt="Rhace Logo" className="mx-auto w-[100px]" />
        </div>

        <div className="text-center">
          <h3 className="text-2xl font-semibold text-gray-800">
            {step === "otp" ? "Verify OTP" : "Reset Password"}
          </h3>
          <p className="mt-2 font-medium text-gray-500">
            {step === "otp"
              ? "Enter your email and OTP sent to you"
              : "Set a new password for your account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === "otp" ? (
            <>

              <div className="space-y-1">
                <Label htmlFor="otp">Enter OTP</Label>
                <OtpInput value={otp} onChange={setOtp} />
                {errors.otp && (
                  <small className="text-red-500">{errors.otp}</small>
                )}
              </div>

              <Button
                type="submit"
                className="w-full rounded-[10px] bg-blue-600 hover:bg-blue-700"
              >
                Verify OTP
              </Button>
            </>
          ) : (
            <>
              <div className="relative space-y-1">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="********"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-8 right-3 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
                {errors.password && (
                  <small className="text-red-500">{errors.password}</small>
                )}
              </div>

              <div className="relative space-y-1">
                <Label htmlFor="confirm_password">Confirm Password</Label>
                <Input
                  id="confirm_password"
                  name="confirm_password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirm_password}
                  onChange={handleChange}
                  placeholder="********"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute top-8 right-3 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
                {errors.confirm_password && (
                  <small className="text-red-500">
                    {errors.confirm_password}
                  </small>
                )}
              </div>

              <Button
                type="submit"
                className="w-full rounded-[10px] bg-blue-600 hover:bg-blue-700"
              >
                Reset Password
              </Button>
            </>
          )}
        </form>
        <p className="text-center text-sm text-gray-600 flex justify-between">
          <span className="font-medium cursor-pointer" onClick={passwordResetRequest}>
            Resend OTP
          </span>
          <Link to="/login" className="text-blue-600 hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
