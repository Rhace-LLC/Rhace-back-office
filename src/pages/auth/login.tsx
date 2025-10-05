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
import { useNavigate } from "react-router-dom";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      login(
       "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODQ5Yzk5YTVkMWY5NGRhNTZlNWFlZjgiLCJlbWFpbCI6ImFkZWZ1eWVhYmF5b21pMTZAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NTk2NDQ4OTksImV4cCI6MTc2MDMzNjA5OX0.1Smmsn-zlNFweRG9J7eG7CPJkKPvJtFsHj0nqH7R1Po",
        "waiter@bookies.com",
        "user"
      );
      if (
        ![
          "waiter@bookies.com",
          "kitchen@bookies.com",
          "admin@bookies.com",
        ].includes(email) ||
        password !== "password"
      ) {
        toast.error("Invalid credentials");
      }
      navigate('/dashboard')
    }
  };

  const quickLogin = (role: string, email: string) => {
    setEmail(email);
    setPassword("password");
    console.log("role",role)
  };

  return (
    <div className="to-background flex min-h-screen items-center justify-center bg-gradient-to-br from-[#2542e3]/10">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2542e3]">
              <div className="h-5 w-5 rounded-full bg-white"></div>
            </div>
            <span className="text-2xl">Bookies</span>
          </div>
          <CardTitle>Welcome Back</CardTitle>
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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              style={{ backgroundColor: "#2542e3" }}
            >
              Sign In
            </Button>
          </form>

          <div className="space-y-2">
            <p className="text-muted-foreground text-center text-sm">
              Quick login (demo):
            </p>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickLogin("Waiter", "waiter@bookies.com")}
              >
                Waiter
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickLogin("Kitchen", "kitchen@bookies.com")}
              >
                Kitchen
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickLogin("Admin", "admin@bookies.com")}
              >
                Admin
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
