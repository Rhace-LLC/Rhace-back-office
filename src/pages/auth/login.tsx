"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

import { Eye, EyeOff, Loader2 } from "lucide-react";
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
import { AuthGlows } from "./AuthGlows";
import { Button } from "@/components/ui/button";
import {
  authButton,
  authField,
  authLabel,
  authPage,
  authPanel,
  authSubtitle,
  authTitle,
  authLink,
} from "./authTokens";

import "./auth.css";

const businessTalks = [
  {
    mainText: "Effective Menu Planning for Seasonal and Holiday Specials",
    subText:
      "Offer seasonal and holiday dishes while keeping preparation manageable and quality consistent.",
  },
  {
    mainText:
      "Building Customer Loyalty Through Personalized Engagement Strategies",
    subText:
      "Use rewards and targeted promotions to encourage repeat visits and strengthen customer connections.",
  },
  {
    mainText: "Maximizing Social Media Presence to Drive Restaurant Awareness",
    subText:
      "Engage your audience with high-quality content and consistent interaction across platforms.",
  },
  {
    mainText: "Optimizing Supply Chain Management for Cost Efficiency",
    subText:
      "Reduce waste and maintain stock levels by improving supply chain efficiency.",
  },
  {
    mainText: "Comprehensive Staff Training to Enhance Customer Experiences",
    subText:
      "Train staff thoroughly in service, menu knowledge, and operations for consistent experiences.",
  },
  {
    mainText: "Implementing Data-Driven Marketing to Increase Brand Visibility",
    subText:
      "Use analytics to target campaigns and attract the right customers effectively.",
  },
  {
    mainText: "Creating a Sustainable and Eco-Friendly Restaurant Operation",
    subText:
      "Adopt sustainable practices like local sourcing and waste reduction to appeal to conscious customers.",
  },
];

export function Login() {
  const [visibleIndex, setVisibleIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleIndex((prev) => (prev + 1) % businessTalks.length);
    }, 5000); // change every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const auth = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleResend = async () => {
    try {
      const resendVerificationMail = await resendOtp({ email });
      toast.success("OTP has been resent successfully!");
      return resendVerificationMail;
    } catch (error: unknown) {
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

      const restaurants =
        response.restaurants ??
        (response.restaurant ? [response.restaurant] : []);
      if (response.role == "restaurant_owner") {
        auth.login(
          response.tokens.access,
          email,
          response.role,
          response.user,
          restaurants,
          restaurants[0].has_subaccount,
          restaurants[0].is_subscribed
        );
      } else {
        auth.login(
          response.tokens.access,
          email,
          response.role,
          response.user,
          restaurants,
          true,
          true
        );
      }

      toast.success("Login successful!");
      navigate("/dashboard"); // or your desired route
    } catch (error: unknown) {
      console.error("Login error:", error);
      const message = parseError(error) || "Something went wrong!";
      toast.error(message);
      if (message === "Please verify your email before logging in") {
        navigate(`/verify-email?email=${encodeURIComponent(email)}`);
        handleResend();
        toast.info("A verification OTP would be sent to your mail " + email);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`${authPage} relative items-center overflow-hidden px-4 py-10 sm:px-6 sm:py-14`}
    >
      {/* Soft atmospheric accents (soft SaaS background treatment) */}
      <AuthGlows />
      <div className={`${authPanel} relative z-10 max-w-[1080px] overflow-hidden`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[85vh]">
          {/* ---------- Form column ---------- */}
          <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-14 bg-white">
            {/* Top brand + country */}
            <div className="mb-10 flex items-center justify-between">
              <img src={RhaceImage} alt="Rhace" className="h-auto w-[88px]" />
              <span className="rounded-md bg-cardfill px-2 py-1 text-xs font-medium tracking-tight text-ink-muted">
                NG
              </span>
            </div>

            <div className="text-center lg:text-left">
              <h1 className={authTitle}>Hello!</h1>
              <p className={authSubtitle}>
                To access your account, enter your email and password. Make
                sure your details are correct and free of errors.
              </p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className={authLabel}>
                    Email (User-ID)
                  </label>
                  <input
                    id="email"
                    type="email"
                    className={authField}
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className={authLabel}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
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
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className={authLink}>
                  <Link to={"/forgot-password"}>Forgot Password?</Link>
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className={authButton}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Login
              </Button>

              <p className="text-center text-sm leading-5 text-ink-muted">
                Are you new to the platform?{" "}
                <Link to={"/signup"} className={authLink}>
                  Register your restaurant
                </Link>{" "}
                here
              </p>
            </form>
          </div>

          {/* ---------- Visual column ---------- */}
          <div className="relative hidden overflow-hidden bg-transparent lg:block">
            <img
              src={
                "https://res.cloudinary.com/mixam/image/upload/v1765439452/y8b1xjftocmfzaf6ycxe.png"
              }
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="relative flex h-full min-h-[640px] flex-col items-start justify-end p-10">
              <div className="max-w-sm rounded-2xl border border-white/60 bg-white/70 p-6 text-center shadow-md backdrop-blur-md">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={visibleIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="text-[24px] leading-[29px] font-semibold tracking-[-0.4px] text-ink">
                      {businessTalks[visibleIndex].mainText}
                    </h2>
                    <p className="mt-4 text-sm leading-5 text-ink-muted">
                      {businessTalks[visibleIndex].subText}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
