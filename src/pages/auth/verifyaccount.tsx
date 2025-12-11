"use client";
import { useState } from "react";
import RhaceLogo from "../../assets/Rhace-10.png";
import { toast } from "sonner";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useLoading } from "@/contexts/LoadingContext";
import { parseError } from "@/api-services/utils/parseError";
import { verifyOtp, resendOtp } from "@/api-services/auth.service"; // implement these
import { Flag, Loader2 } from "lucide-react";

export function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const { setLoadingText } = useLoading();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<any>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      setErrors({ otp: "Otp Must be 6 Characters Long" });
      return;
    }

    try {
      setLoading(true);
      setLoadingText("Verifying OTP...");

      // Call your API to verify OTP
      await verifyOtp({ email, otp });

      toast.success("OTP verified successfully!");
      navigate("/login"); // redirect after success
    } catch (error: any) {
      const errorMessage = parseError(error) || "Failed to verify OTP";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      setLoadingText("Resending OTP...");
      await resendOtp({ email });
      toast.success("OTP resent successfully!");
    } catch (error: any) {
      toast.error(parseError(error) || "Failed to resend OTP");
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  };

  return (
    <div className="item-center flex min-h-screen w-full justify-center bg-gray-50 px-4">
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
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tighter">Verify OTP</h1>
          <p className="mt-2 leading-relaxed text-gray-600">
            Enter the 6-digit code sent to your email{" "}
            <span className="font-medium">{email}</span> to verify your account.
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium tracking-tight text-gray-700">
              OTP
            </label>
            <input
              autoFocus
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              required
              className="mx-auto h-12 w-full rounded-sm bg-gray-100 px-5 text-center text-xl transition-all duration-200 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {errors?.otp && (
              <small className="text-red-500">{errors.otp}</small>
            )}
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            className="flex h-12 w-full items-center justify-center rounded-md bg-black font-medium tracking-tight text-white shadow-sm transition-all duration-200 hover:bg-gray-900 hover:shadow-md active:scale-[0.98]"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify"}
          </button>
        </form>

        {/* FOOTER LINKS */}
        <p className="mt-6 flex justify-between text-sm text-gray-600">
          <span
            className="cursor-pointer font-medium text-blue-600 hover:underline"
            onClick={handleResendOtp}
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
