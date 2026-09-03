"use client";
import { useState } from "react";
import RhaceLogo from "../../assets/Rhace-10.png";
import { toast } from "sonner";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useLoading } from "@/contexts/LoadingContext";
import { parseError } from "@/api-services/utils/parseError";
import { verifyOtp, resendOtp } from "@/api-services/auth.service"; // implement these
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const { setLoadingText } = useLoading();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<{ otp?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      setErrors({ otp: "OTP must be 6 characters long" });
      return;
    }

    try {
      setLoading(true);
      setLoadingText("Verifying OTP...");

      // Call your API to verify OTP
      await verifyOtp({ email, otp });

      toast.success("OTP verified successfully!");
      navigate("/login"); // redirect after success
    } catch (error: unknown) {
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
    } catch (error: unknown) {
      toast.error(parseError(error) || "Failed to resend OTP");
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  };

  return (
    <div className={`${authPage} items-center px-4 py-10 sm:py-14`}>
      <div className={`${authPanel} max-w-[520px] p-6 sm:p-10`}>
        {/* Top Logo & Country */}
        <div className="mb-10 flex items-center justify-between">
          <img src={RhaceLogo} alt="Rhace" className="h-auto w-[88px]" />
          <span className="rounded-md bg-cardfill px-2 py-1 text-xs font-medium tracking-tight text-ink-muted">
            NG
          </span>
        </div>

        {/* Headings */}
        <div className="mb-6 text-center">
          <h1 className={authTitleSm}>Verify OTP</h1>
          <p className={authSubtitle}>
            Enter the 6-digit code sent to your email{" "}
            <span className="font-medium text-ink-secondary">{email}</span> to
            verify your account.
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={authLabel}>OTP</label>
            <input
              autoFocus
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              required
              className={`${authField} text-center text-xl tracking-[0.5em]`}
            />
            {errors?.otp && (
              <small className="mt-1 block text-xs text-red-500">
                {errors.otp}
              </small>
            )}
          </div>

          <Button type="submit" disabled={loading} className={authButton}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
          </Button>
        </form>

        {/* FOOTER LINKS */}
        <div className="mt-6 flex items-center justify-between text-sm text-ink-muted">
          <button type="button" className={authLink} onClick={handleResendOtp}>
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
