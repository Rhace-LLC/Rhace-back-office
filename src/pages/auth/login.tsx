"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

import { Eye, EyeOff, Flag, Loader2 } from "lucide-react";
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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const auth = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <>
      <div className="item-center flex min-h-screen w-full justify-center bg-gray-50">
        <div className="m-0 flex w-full max-w-5xl flex-col items-stretch gap-10 sm:m-15 md:m-25 md:flex-row md:gap-0">
          <div className="rounded-0 md:rounded-r-0 flex-1 border-r-0 bg-white p-6">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div
                id="form-top"
                className="mb-10 flex items-center justify-between"
              >
                <img src={RhaceImage} className="w-20" />

                <div className="flex items-center gap-1">
                  <Flag className="h-4 w-4 text-green-500" />
                  <p className="text-sm font-semibold tracking-tighter">NG</p>
                </div>
              </div>
              <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tighter">Hello!</h1>
                <p className="mt-2 leading-relaxed text-gray-600">
                  To access your account, enter your email and password. Make
                  sure your details are correct and free of errors.
                </p>
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium tracking-tight text-gray-700"
                  >
                    Email (User-ID)
                  </label>

                  <input
                    id="email"
                    type="email"
                    className={`h-12 w-full rounded-sm bg-gray-100 px-5 transition-all duration-200 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium tracking-tight text-gray-700"
                  >
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
                      className={`h-12 w-full rounded-sm bg-gray-100 px-5 pr-12 transition-all duration-200 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                    />

                    {/* Show / Hide Button */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-4 flex items-center text-gray-500 transition hover:text-gray-700"
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

              <p className="cursor-pointer text-sm font-medium text-blue-600 transition-colors hover:text-blue-700">
                <Link to={"/forgot-password"}>Forgot Password?</Link>
              </p>

              <button
                disabled={loading}
                className={`flex h-12 w-full items-center justify-center rounded-md bg-black font-medium tracking-tight text-white shadow-sm transition-all duration-200 hover:bg-gray-900 hover:shadow-md active:scale-[0.98] ${loading ? "cursor-not-allowed opacity-60 hover:bg-black hover:shadow-sm" : ""} `}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Login"
                )}
              </button>
              <p className="mt-4 text-center text-sm text-gray-700">
                Are you new to the platform ?{" "}
                <span className="text-gray-700">Register your restaurant</span>{" "}
                here and{" "}
                <Link to={"/signup"}>
                  <span className="font-medium text-blue-600">
                    sign up for an awesome experience
                  </span>
                </Link>
              </p>
            </form>
          </div>

          <div className="relative flex flex-1 items-center justify-center rounded-r-3xl bg-white p-5">
            <div className="absolute inset-0 h-[100%] rounded-r-3xl bg-white/50 p-4">
              {/* Your content goes here */}
              <img
                src={
                  "https://res.cloudinary.com/mixam/image/upload/v1765439452/y8b1xjftocmfzaf6ycxe.png"
                }
                className="h-[100%] min-h-[500px] w-[100%] rounded-3xl"
              />
            </div>
            <div className="mt-[24%] w-[90%] max-w-xs rounded-xl bg-white/50 p-6 text-center backdrop-blur-sm md:mt-[15%]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={visibleIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-3xl text-gray-800">
                    {businessTalks[visibleIndex].mainText}
                  </h2>
                  <p className="mt-10 text-sm text-gray-600">
                    {businessTalks[visibleIndex].subText}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
