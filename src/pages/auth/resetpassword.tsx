import RhaceLogo from "../../assets/Rhace-10.png";
import { useState } from "react";
import { useLoading } from "@/contexts/LoadingContext";
import { Eye, EyeOff, Flag } from "lucide-react";
import { toast } from "sonner";
import {
  requestPasswordReset,
  resetPassword,
} from "@/api-services/auth.service";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { OtpInput } from "@/components/OTP/otp";
import { parseError } from "@/api-services/utils/parseError";

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
        console.log("Response", response);
        toast.success(response?.message || "Password reset successful!");
        navigate("/login");
      }
    } catch (error) {
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
    } catch (error) {
      toast.error("Failed to send reset link. Please try again.");
    } finally {
      setStep("otp");
      setOtp("");
      setLoading(false);
      setLoadingText("");
    }
  };

  return (<div className="item-center flex min-h-screen w-full justify-center bg-gray-50 px-4">
  <div className="m-10 w-full max-w-xl rounded-3xl bg-white p-8 shadow-sm">
    
    {/* Top Logo & Country */}
    <div id="form-top" className="mb-10 flex items-center justify-between">
      <img src={RhaceLogo} className="w-20" />

      <div className="flex items-center gap-1">
        <Flag className="h-4 w-4 text-green-500" />
        <p className="text-sm font-semibold tracking-tighter">NG</p>
      </div>
    </div>

    {/* Headings */}
    <div className="text-center mb-6">
      <h1 className="text-3xl font-bold tracking-tighter">
        {step === "otp" ? "Verify OTP" : "Reset Password"}
      </h1>

      <p className="mt-2 leading-relaxed text-gray-600">
        {step === "otp"
          ? "Enter the 6-digit code sent to your email. Let’s get you back in."
          : "Create a new password that’s secure and easy for you to remember."}
      </p>
    </div>

    {/* FORM */}
    <form onSubmit={handleSubmit} className="space-y-5">
      {step === "otp" ? (
        <>
          {/* OTP INPUT */}
          <div className="space-y-2">
            <label className="text-sm font-medium tracking-tight text-gray-700">
              Enter OTP
            </label>
            <OtpInput value={otp} onChange={setOtp} />
            {errors.otp && (
              <small className="text-red-500">{errors.otp}</small>
            )}
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            className="flex h-12 w-full items-center justify-center rounded-md bg-black font-medium tracking-tight text-white shadow-sm transition-all duration-200 hover:bg-gray-900 hover:shadow-md active:scale-[0.98]"
          >
            Verify OTP
          </button>
        </>
      ) : (
        <>
          {/* NEW PASSWORD */}
          <div className="space-y-2 relative">
            <label className="text-sm font-medium tracking-tight text-gray-700">
              New Password
            </label>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              required
              value={form.password}
              onChange={handleChange}
              className="h-12 w-full rounded-sm bg-gray-100 px-5 pr-12 transition-all duration-200 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-8 top-[45px] right-4 flex items-center text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
            {errors.password && (
              <small className="text-red-500">{errors.password}</small>
            )}
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="space-y-2 relative">
            <label className="text-sm font-medium tracking-tight text-gray-700">
              Confirm Password
            </label>
            <input
              id="confirm_password"
              name="confirm_password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter password"
              required
              value={form.confirm_password}
              onChange={handleChange}
              className="h-12 w-full rounded-sm bg-gray-100 px-5 pr-12 transition-all duration-200 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-8 right-4 top-[45px] flex items-center text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
            {errors.confirm_password && (
              <small className="text-red-500">{errors.confirm_password}</small>
            )}
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            className="flex h-12 w-full items-center justify-center rounded-md bg-black font-medium tracking-tight text-white shadow-sm transition-all duration-200 hover:bg-gray-900 hover:shadow-md active:scale-[0.98]"
          >
            Reset Password
          </button>
        </>
      )}
    </form>

    {/* FOOTER LINKS */}
    <p className="mt-6 flex justify-between text-sm text-gray-600">
      <span
        className="cursor-pointer font-medium text-blue-600 hover:underline"
        onClick={passwordResetRequest}
      >
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
