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
import { requestPasswordReset } from "@/api-services/auth.service";
import { parseError } from "@/api-services/utils/parseError";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      // Await the password reset API call
      const response = await requestPasswordReset(email);

      console.log("Password reset response:", response);
      toast.success("Password reset link sent to your email!");
      navigate(`/resetpassword?email=${email}`);
    } catch (error: any) {
      console.error("Password reset error:", error);
      const message = parseError(error) || "Failed to send reset link!";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Forgot Password?</CardTitle>
          <CardDescription>
            Enter your email to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button
              className="w-full"
              disabled={loading}
              style={{ backgroundColor: "#2542e3" }}
            >
              {loading ? "Sending Reset Link..." : "Send Reset Link"}
            </Button>
            <p className="text-muted-foreground mt-3 text-center text-sm">
              Remember your password?{" "}
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
