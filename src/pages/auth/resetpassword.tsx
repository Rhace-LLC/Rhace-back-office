import RhaceLogo from "../../assets/Rhace-10.png";
import { useState } from "react";
import { useLoading } from "@/contexts/LoadingContext";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import {
  requestPasswordReset,
  resetPassword,
} from "@/api-services/auth.service";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { OtpInput } from "@/components/OTP/otp";
import { Button } from "@/components/ui/button";
import { parseError } from "@/api-services/utils/parseError";
import {
  authButton,
  authField,
  authLabel,
  authPage,
  authPanel,
  authSubtitle,
  authTitleSm,
  authLink,
} from "./authTokens";

export interface FormErrors {
  [key: string]: string;
}

export default function ResetPassword() {
  const navigate = useNavigate();
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
        await new Promise((resolve) => setTimeout(resolve, 300)); // simulate success
        toast.success("Enter New Password");
        setStep("reset");
      } else {
        setLoadingText("Resetting password...");
        const payload = {
          email,
          otp: otp,
          new_password: form.password,
          confirm_password: form.confirm_password,
        };
        const response = await resetPassword(payload);
        toast.success(response?.message || "Password reset successful!");
        navigate("/login");
      }
    } catch (error: unknown) {
      const errorMessage = parseError(error);
      toast.error(
        errorMessage || "Failed to reset password. Please try again."
      );
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  };

  const passwordResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("No Mail Found");
      return;
    }

    try {
      setLoadingText("Sending reset link...");
      setLoading(true);

      const response = await requestPasswordReset(email);

      toast.success(response?.message || "Password reset link sent!");
    } catch {
      toast.error("Failed to send reset link. Please try again.");
    } finally {
      setStep("otp");
      setOtp("");
      setLoading(false);
      setLoadingText("");
    }
  };

  return (
    <div className={`${authPage} items-center px-4 py-10 sm:py-14`}>
      <div className={`${authPanel} max-w-[520px] p-6 sm:p-10 bg-white`}>
        {/* Top Logo & Country */}
        <div className="mb-10 flex items-center justify-between">
          <img src={RhaceLogo} alt="Rhace" className="h-auto w-[88px]" />
          <span className="rounded-md bg-cardfill px-2 py-1 text-xs font-medium tracking-tight text-ink-muted">
            NG
          </span>
        </div>

        {/* Headings */}
        <div className="mb-6 text-center">
          <h1 className={authTitleSm}>
            {step === "otp" ? "Verify OTP" : "Reset Password"}
          </h1>
          <p className={authSubtitle}>
            {step === "otp"
              ? "Enter the 6-digit code sent to your email. Let's get you back in."
              : "Create a new password that's secure and easy for you to remember."}
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {step === "otp" ? (
            <>
              <div>
                <label className={authLabel}>Enter OTP</label>
                <OtpInput value={otp} onChange={setOtp} />
                {errors.otp && (
                  <small className="mt-1 block text-xs text-red-500">
                    {errors.otp}
                  </small>
                )}
              </div>

              <Button type="submit" className={authButton}>
                Verify OTP
              </Button>
            </>
          ) : (
            <>
              {/* NEW PASSWORD */}
              <div>
                <label htmlFor="password" className={authLabel}>
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    className={`${authField} pr-11`}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-ink-subtle transition-colors hover:text-ink"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <small className="mt-1 block text-xs text-red-500">
                    {errors.password}
                  </small>
                )}
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label htmlFor="confirm_password" className={authLabel}>
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter password"
                    required
                    value={form.confirm_password}
                    onChange={handleChange}
                    className={`${authField} pr-11`}
                  />
                  <button
                    type="button"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-ink-subtle transition-colors hover:text-ink"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirm_password && (
                  <small className="mt-1 block text-xs text-red-500">
                    {errors.confirm_password}
                  </small>
                )}
              </div>

              <Button type="submit" className={authButton}>
                Reset Password
              </Button>
            </>
          )}
        </form>

        {/* FOOTER LINKS */}
        <div className="mt-6 flex items-center justify-between text-sm text-ink-muted">
          <button
            type="button"
            className={authLink}
            onClick={passwordResetRequest}
          >
            Resend OTP
          </button>
          <Link to="/login" className={authLink}>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
