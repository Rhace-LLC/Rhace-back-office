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
import { toast } from "sonner";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useLoading } from "@/contexts/LoadingContext";
import { parseError } from "@/api-services/utils/parseError";
import { verifyOtp, resendOtp } from "@/api-services/auth.service"; // implement these

export function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const { setLoading, setLoadingText } = useLoading();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error("Invalid OTP");
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
      await resendOtp(email);
      toast.success("OTP resent successfully!");
    } catch (error: any) {
      toast.error(parseError(error) || "Failed to resend OTP");
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Verify OTP</CardTitle>
          <CardDescription>
            Enter the 6-digit code sent to your email{" "}
            <span className="font-medium">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>OTP</Label>
              <Input
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit code"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              style={{ backgroundColor: "#2542e3" }}
            >
              Verify
            </Button>

            <p className="mt-2 text-center text-sm">
              Didn't receive the code?{" "}
              <span
                className="cursor-pointer text-blue-600 underline"
                onClick={handleResendOtp}
              >
                Resend OTP
              </span>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
