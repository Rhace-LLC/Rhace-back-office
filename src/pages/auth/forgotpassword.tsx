import { Link, useNavigate } from "react-router-dom";
import RhaceLogo from "../../assets/Rhace-10.png";
import { useState } from "react";
import { useLoading } from "@/contexts/LoadingContext";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { requestPasswordReset } from "@/api-services/auth.service";
import { Flag } from "lucide-react";

export interface FormErrors {
  [key: string]: string;
}

export default function ForgotPassword() {
  const { setLoading, setLoadingText } = useLoading();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const navigate = useNavigate();

  const validateForm = () => {
    const errors: FormErrors = {};
    if (!email.trim()) errors.email = "Email is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email))
      errors.email = "Invalid email address";

    return { valid: Object.keys(errors).length === 0, errors };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { valid, errors } = validateForm();
    setErrors(errors);
    if (!valid) {
      Object.values(errors).forEach((err) => toast.error(err));
      return;
    }

    try {
      setLoadingText("Sending reset link...");
      setLoading(true);

      const response = await requestPasswordReset(email);

      toast.success(response?.message || "Password reset link sent!");
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (error) {
      toast.error("Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  };

  return (
    <div className="item-center flex min-h-screen w-full justify-center bg-gray-50">
      <div className="m-0 flex w-full max-w-5xl flex-col items-stretch gap-10 sm:m-15 md:m-25 md:flex-row md:gap-0">
        <div className="rounded-0 md:rounded-r-0 flex-1 border-r-0 bg-white p-6">
          {/* TOP SECTION */}
          <div
            id="form-top"
            className="mb-10 flex items-center justify-between"
          >
            <img src={RhaceLogo} className="w-20" />

            <div className="flex items-center gap-1">
              <Flag className="h-4 w-4 text-green-500" />
              <p className="text-sm font-semibold tracking-tighter">NG</p>
            </div>
          </div>
          <form className="space-y-5 py-20" onSubmit={handleSubmit}>
            {/* TITLE */}
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tighter">
                Forgot Password
              </h1>
              <p className="mt-2 leading-relaxed text-gray-600">
                Enter the email linked to your account and we will send you a
                password reset link.
              </p>
            </div>

            {/* INPUT */}
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
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  required
                  className="h-12 w-full rounded-sm bg-gray-100 px-5 transition-all duration-200 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />

                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              className="flex h-12 w-full items-center justify-center rounded-md bg-black font-medium tracking-tight text-white shadow-sm transition-all duration-200 hover:bg-gray-900 hover:shadow-md active:scale-[0.98]"
            >
              Send Reset Link
            </button>

            {/* FOOTER LINK */}
            <p className="mt-4 text-center text-sm text-gray-700">
              Remember your password?{" "}
              <Link to="/login">
                <span className="font-medium text-blue-600">Back to login</span>
              </Link>
            </p>
          </form>
        </div>

        {/* RIGHT SIDE IMAGE PANEL */}
        <div className="relative flex flex-1 items-center justify-center rounded-r-3xl bg-white p-5">
          <div className="absolute inset-0 h-[100%] rounded-r-3xl bg-white/50 p-4">
            <img
              src="https://res.cloudinary.com/mixam/image/upload/v1765439452/y8b1xjftocmfzaf6ycxe.png"
              className="h-[100%] min-h-[500px] w-[100%] rounded-3xl"
            />
          </div>

          <div className="mt-[20%] w-[90%] max-w-xs rounded-xl bg-white/50 p-6 text-center backdrop-blur-sm md:mt-[10%]">
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl text-gray-800">
                  Forgot Your Password?
                </h2>
                <p className="mt-10 text-sm text-gray-600">
                  You're not alone — it’s one of the most common things. We’ll
                  help you recover it in seconds.
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
