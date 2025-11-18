"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import {
  login,
  LoginRequestBody,
  resendOtp,
} from "@/api-services/auth.service";
import { parseError } from "@/api-services/utils/parseError";
import RhaceImage from "../../assets/Rhace-10.png";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const auth = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    try {
      const resendVerificationMail = await resendOtp({ email });
      toast.success("OTP has been resent successfully!");
      return resendVerificationMail;
    } catch (error: any) {
      const message = parseError(error) || "Something went wrong!";
      toast.error(message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Optional: validate form here
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    const payload: LoginRequestBody = { email, password };
    setLoading(true);

    try {
      const response = await login(payload); // Await API call

      console.log("Response:", response);

      // Save auth info
      auth.login(
        response.tokens.access,
        email,
        response.role,
        response.user,
        response.restaurants
      );

      toast.success("Login successful!");
      navigate("/dashboard"); // or your desired route
    } catch (error: any) {
      console.error("Login error:", error);
      const message = parseError(error) || "Something went wrong!";
      toast.error(message);
      if (message === "Please verify your email before logging in") {
        navigate(`/verify-email?email=${email}`);
        handleResend();
        toast.info("A verification OTP would be sent to your mail " + email);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-7 text-center">
          <div className="mb-5 text-center">
            <img
              src={RhaceImage}
              alt="Rhace Logo"
              className="mx-auto !w-[100px]"
            />
          </div>
          <CardTitle className="text-2xl font-semibold text-gray-800">
            Welcome Back
          </CardTitle>
          <CardDescription>Sign in to your back office account</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-[#2542e3] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="text-center text-sm">
              <span>Don't have an account? </span>
              <Link to="/signup" className="text-[#2542e3] hover:underline">
                Sign up
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
              style={{ backgroundColor: "#2542e3" }}
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
