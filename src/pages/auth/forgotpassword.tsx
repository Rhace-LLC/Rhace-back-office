import { Link, useNavigate } from "react-router-dom";
import RhaceLogo from "../../assets/Rhace-10.png";
import { useState } from "react";
import { useLoading } from "@/contexts/LoadingContext";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { requestPasswordReset } from "@/api-services/auth.service";
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
    } catch {
      toast.error("Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  };

  return (
    <div className={`${authPage} items-center px-4 py-10 sm:px-6 sm:py-14`}>
      <div className={`${authPanel} max-w-[1080px] overflow-hidden bg-white`}>
        <div className="grid grid-cols-1 lg:grid-cols-2  min-h-[85vh]">
          {/* ---------- Form column ---------- */}
          <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-14">
            <div className="mb-12 flex items-center justify-between">
              <img src={RhaceLogo} alt="Rhace" className="h-auto w-[88px]" />
              <span className="rounded-md bg-cardfill px-2 py-1 text-xs font-medium tracking-tight text-ink-muted">
                NG
              </span>
            </div>

            <div className="text-center lg:text-left">
              <h1 className={authTitle}>Forgot Password</h1>
              <p className={authSubtitle}>
                Enter the email linked to your account and we will send you a
                password reset link.
              </p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className={authLabel}>
                  Email (User-ID)
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={authField}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              <Button type="submit" className={authButton}>
                Send Reset Link
              </Button>

              <p className="text-center text-sm leading-5 text-ink-muted">
                Remember your password?{" "}
                <Link to="/login" className={authLink}>
                  Back to login
                </Link>
              </p>
            </form>
          </div>

          {/* ---------- Visual column ---------- */}
          <div className="relative hidden overflow-hidden bg-page lg:block">
            <img
              src="https://res.cloudinary.com/mixam/image/upload/v1765439452/y8b1xjftocmfzaf6ycxe.png"
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="relative flex h-full min-h-[560px] flex-col items-start justify-end p-10">
              <div className="max-w-sm rounded-2xl border border-white/60 bg-white/70 p-6 text-center shadow-md backdrop-blur-md">
                <AnimatePresence mode="wait">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="text-[24px] leading-[29px] font-semibold tracking-[-0.4px] text-ink">
                      Forgot Your Password?
                    </h2>
                    <p className="mt-4 text-sm leading-5 text-ink-muted">
                      You're not alone — it's one of the most common things.
                      We'll help you recover it in seconds.
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
