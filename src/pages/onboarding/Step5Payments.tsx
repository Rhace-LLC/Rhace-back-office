"use client";
import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  createSubaccount,
  getSubaccountBanks,
  getSubaccount,
} from "@/api-services/subaccount.service";
import {
  getSubscriptionPlans,
  SubscriptionPlan,
} from "@/api-services/subscriptiions.service";
import { parseError } from "@/api-services/utils/parseError";
import { StepHeader } from "./ui";
import { obField } from "./tokens";
import { BillingModel } from "./types";

interface BankOption {
  code: string;
  name: string;
}

interface PlanOption {
  key: string;
  name: string;
  amount: number;
  price: string;
  meta: string;
  blurb: string;
  features: string[];
  featured: boolean;
}

const toPlanOption = (plan: SubscriptionPlan): PlanOption => {
  const withFeatures = plan as SubscriptionPlan & { features?: string[] };
  const amount = Number(plan.base_price || 0);
  const surcharge = Number(plan.surcharge_percentage || 0);
  const isPayg = amount <= 0;

  let features: string[];
  if (withFeatures.features && withFeatures.features.length > 0) {
    features = withFeatures.features;
  } else {
    features = [];
    if (surcharge > 0) features.push(`${surcharge}% per transaction`);
    if (plan.staff_threshold > 0)
      features.push(`Up to ${plan.staff_threshold} staff accounts`);
    if (plan.grace_period_days > 0)
      features.push(`${plan.grace_period_days}-day grace period`);
    if (features.length === 0)
      features.push("A plan built for your restaurant.");
  }

  return {
    key: String(plan.id),
    name: plan.name,
    amount,
    price: `₦${amount.toLocaleString()}`,
    meta: isPayg
      ? surcharge > 0
        ? `${surcharge}% per transaction`
        : "No monthly commitment"
      : "Predictable monthly cost",
    blurb: plan.description || "",
    features,
    featured: isPayg,
  };
};

type Substep = "bank" | "billing" | "confirm";

const SETUP_MESSAGES = [
  "We're setting up your restaurant…",
  "Linking your payment account…",
  "Preparing your dashboard…",
  "Just a moment — almost there…",
];

/**
 * "You're almost ready" is replaced by a short animated setup moment:
 * an icon runs while a message cycles, then the Launch button enables.
 */
function LaunchTransition({
  isPayg,
  onLaunch,
  onBack,
}: {
  isPayg: boolean;
  onLaunch: () => void;
  onBack: () => void;
}) {
  const [done, setDone] = useState(false);
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(
      () => setMsgIdx((i) => (i + 1) % SETUP_MESSAGES.length),
      650
    );
    const timeout = window.setTimeout(() => {
      window.clearInterval(interval);
      setDone(true);
    }, 2400);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, []);

  return (
    <>
      <div className="flex min-h-[320px] flex-col items-center justify-center px-4 text-center">
        {/* Animated icon */}
        <div className="flex h-20 w-20 items-center justify-center">
          <AnimatePresence mode="wait">
            {done ? (
              <motion.span
                key="done"
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
              >
                <CheckCircle2 className="h-9 w-9" />
              </motion.span>
            ) : (
              <motion.span
                key="loading"
                exit={{ scale: 0.5, opacity: 0 }}
                className="relative flex h-16 w-16 items-center justify-center"
              >
                <motion.span
                  aria-hidden
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-2 border-line-subtle border-t-brand"
                />
                <Loader2 className="h-6 w-6 animate-spin text-brand" />
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Cycling message */}
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="ready"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="mt-6 text-[24px] leading-[29px] font-semibold tracking-[-0.4px] text-ink">
                All set — you're ready to launch!
              </h2>
              <p className="mt-1 text-sm leading-5 text-ink-muted">
                Your restaurant has been set up. Go ahead and take it live.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={msgIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="mt-6 text-[24px] leading-[29px] font-semibold tracking-[-0.4px] text-ink">
                {SETUP_MESSAGES[msgIdx]}
              </h2>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8 space-y-2 border-t border-line-subtle pt-6">
        <button
          type="button"
          onClick={onLaunch}
          disabled={!done}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[8px] bg-ink px-5 text-sm font-medium text-white transition-colors duration-150 hover:bg-ink-secondary focus-visible:ring-[3px] focus-visible:ring-focus-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
        >
          {!done ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Setting things up…
            </>
          ) : isPayg ? (
            "Launch My Restaurant"
          ) : (
            "Start Free Trial"
          )}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-12 w-full items-center justify-center rounded-[8px] px-5 text-sm font-medium text-ink-muted transition-colors duration-150 hover:bg-line-subtle hover:text-ink"
        >
          Back
        </button>
      </div>
    </>
  );
}

export function Step5Payments({
  restaurantName,
  onExit,
  onComplete,
}: {
  restaurantName?: string;
  onExit: () => void;
  onComplete: () => void;
}) {
  const auth = useAuth();
  const [substep, setSubstep] = useState<Substep>("bank");

  // Bank details
  const [accountName, setAccountName] = useState(restaurantName ?? "");
  const [bankCode, setBankCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [banks, setBanks] = useState<BankOption[]>([]);
  const [banksLoading, setBanksLoading] = useState(true);
  const [banksError, setBanksError] = useState("");

  // Billing
  const [model, setModel] = useState<BillingModel>("subscription");
  const [planName, setPlanName] = useState<string>("");
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState("");

  const loadPlans = useCallback(async () => {
    setPlansLoading(true);
    setPlansError("");
    try {
      const response = await getSubscriptionPlans(auth.token);
      const options = response
        .filter((p) => p.is_active)
        .map(toPlanOption);
      setPlans(options);
      setPlanName((prev) => prev || options[0]?.name || "");
    } catch (error) {
      setPlansError(parseError(error) || "Could not load plans.");
    } finally {
      setPlansLoading(false);
    }
  }, [auth.token]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const loadBanks = useCallback(async () => {
    setBanksLoading(true);
    setBanksError("");
    try {
      const response = await getSubaccountBanks(auth.token);
      setBanks(response.data ?? []);
    } catch (error) {
      setBanksError(parseError(error) || "Could not load banks.");
    } finally {
      setBanksLoading(false);
    }
  }, [auth.token]);

  useEffect(() => {
    loadBanks();
  }, [loadBanks]);

  // If the restaurant already has a settlement account, treat it as verified.
  useEffect(() => {
    const checkExisting = async () => {
      try {
        const res = await getSubaccount(auth.token);
        const existing = res?.data;
        if (existing) {
          setAccountName(existing.account_name || restaurantName || "");
          setBankName(existing.settlement_bank || "");
          setAccountNumber(existing.account_number || "");
          setVerified(true);
        }
      } catch {
        // No subaccount yet — the form below will create one.
      }
    };
    checkExisting();
  }, [auth, restaurantName]);

  const handleVerifyAccount = async () => {
    if (!accountName.trim() || !accountNumber.trim() || !bankCode) return;
    setVerifying(true);
    try {
      await createSubaccount(auth.token, {
        account_number: accountNumber,
        bank_code: bankCode,
        bank_name: bankName,
      });
      auth.setHasPayoutAccount(true);
      toast.success("Account verified successfully!");
      setVerified(true);
      // Brief "Account verified" flash, then straight to the plans screen.
      window.setTimeout(goBilling, 600);
    } catch (error) {
      toast.error(parseError(error) || "Could not verify this account.");
    } finally {
      setVerifying(false);
    }
  };

  const masked = `•••• ${accountNumber.slice(-4) || "0000"}`;

  const goBank = () => setSubstep("bank");
  const goBilling = () => setSubstep("billing");
  const goConfirm = () => setSubstep("confirm");

  /* ------------------------- LAUNCH TRANSITION ------------------------- */
  if (substep === "confirm") {
    return (
      <LaunchTransition
        isPayg={model === "payg"}
        onLaunch={onComplete}
        onBack={goBilling}
      />
    );
  }

  /* ------------------------- BILLING MODEL / PLANS ------------------------- */
  if (substep === "billing") {
    const choosePlan = (plan: PlanOption) => {
      setModel(plan.amount <= 0 ? "payg" : "subscription");
      setPlanName(plan.name);
      goConfirm();
    };

    return (
      <>
        <StepHeader
          step="05"
          title="Choose how you want to grow"
          subtitle="No free vs premium — pick the way you want to pay as you grow."
        />
        {plansLoading ? (
          <div className="flex min-h-[200px] items-center justify-center gap-2 text-sm text-ink-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading plans…
          </div>
        ) : plansError && plans.length === 0 ? (
          <div className="rounded-[16px] border border-line bg-cardfill px-4 py-6 text-center">
            <p className="text-sm text-ink-muted">{plansError}</p>
            <button
              type="button"
              onClick={loadPlans}
              className="mt-3 text-sm font-medium text-brand underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        ) : plans.length === 0 ? (
          <div className="rounded-[16px] border border-line bg-cardfill px-4 py-6 text-center">
            <p className="text-sm text-ink-muted">
              No plans available right now.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {plans.map((plan) => {
              const featured = plan.featured;
              const active = planName === plan.name;
              return (
                <div
                  key={plan.key}
                  className={cn(
                    "relative flex flex-col rounded-[16px] p-6",
                    featured
                      ? "bg-gradient-to-br from-brand via-brand-secondary to-brand-accent shadow-md"
                      : "border border-line bg-surface",
                    active &&
                      !featured &&
                      "border-brand ring-1 ring-brand"
                  )}
                >
                  <p
                    className={cn(
                      "text-[11px] leading-[15px] font-semibold tracking-[0.08em] uppercase",
                      featured ? "text-white/80" : "text-brand"
                    )}
                  >
                    {plan.name}
                  </p>
                  <p
                    className={cn(
                      "mt-2 text-sm leading-5 font-medium",
                      featured ? "text-white/90" : "text-ink"
                    )}
                  >
                    {plan.meta}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-[24px] leading-[29px] font-semibold tracking-[-0.4px]",
                      featured ? "text-white" : "text-ink"
                    )}
                  >
                    {plan.price}
                    <span
                      className={cn(
                        "ml-1 text-sm font-normal",
                        featured ? "text-white/80" : "text-ink-muted"
                      )}
                    >
                      /month
                    </span>
                  </p>
                  {plan.blurb && (
                    <p
                      className={cn(
                        "mt-1.5 text-sm leading-5",
                        featured ? "text-white/80" : "text-ink-muted"
                      )}
                    >
                      {plan.blurb}
                    </p>
                  )}
                  <ul className="mt-4 flex-1 space-y-2">
                    {plan.features.map((point) => (
                      <li
                        key={point}
                        className={cn(
                          "flex items-center gap-2 text-sm leading-5",
                          featured ? "text-white/90" : "text-ink"
                        )}
                      >
                        <Check
                          className={cn(
                            "h-4 w-4 shrink-0",
                            featured ? "text-white" : "text-brand"
                          )}
                        />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => choosePlan(plan)}
                    className={cn(
                      "mt-6 inline-flex h-12 w-full items-center justify-center rounded-[8px] text-sm font-medium transition-colors duration-150",
                      featured
                        ? "bg-white text-brand hover:bg-surface"
                        : "border border-line bg-surface text-ink hover:border-ink hover:bg-cardfill"
                    )}
                  >
                    {featured ? `Choose ${plan.name}` : `Choose ${plan.name}`}
                  </button>
                </div>
              );
            })}
          </div>
        )}
        <div className="mt-6">
          <button
            type="button"
            onClick={goBank}
            className="inline-flex h-11 items-center justify-center rounded-[8px] px-4 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
          >
            ← Back
          </button>
        </div>
      </>
    );
  }

  /* ------------------------- BANK ------------------------- */
  return (
    <>
      <StepHeader
        step="05"
        title="Where should we send your money?"
        subtitle="Connect your bank account to receive payments from your restaurant."
      />

      {!verified ? (
        <div className="space-y-5">
          {/* Account name + bank */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="ob-acct-name"
                className="mb-1.5 block text-sm font-medium leading-5 text-ink-secondary"
              >
                Account name
              </label>
              <input
                id="ob-acct-name"
                className={obField}
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Business account name"
              />
            </div>
            <div>
              <label
                htmlFor="ob-bank"
                className="mb-1.5 block text-sm font-medium leading-5 text-ink-secondary"
              >
                Bank
              </label>
              <select
                id="ob-bank"
                className={obField}
                value={bankCode}
                onChange={(e) => {
                  const code = e.target.value;
                  setBankCode(code);
                  setBankName(banks.find((b) => b.code === code)?.name ?? "");
                }}
              >
                {banksLoading ? (
                  <option value="">Loading banks…</option>
                ) : (
                  <>
                    <option value="">Select your bank</option>
                    {banks.map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
              {banksError && (
                <p className="mt-1 flex items-center justify-between gap-2 text-xs leading-[17px] text-destructive">
                  <span>{banksError}</span>
                  <button
                    type="button"
                    onClick={loadBanks}
                    className="font-medium underline underline-offset-2"
                  >
                    Retry
                  </button>
                </p>
              )}
            </div>
          </div>

          {/* Account number + Verify — button sits right where typing ends */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="w-full sm:flex-1">
              <label
                htmlFor="ob-acct-no"
                className="mb-1.5 block text-sm font-medium leading-5 text-ink-secondary"
              >
                Account number
              </label>
              <input
                id="ob-acct-no"
                className={obField}
                value={accountNumber}
                onChange={(e) =>
                  setAccountNumber(
                    e.target.value.replace(/[^\d]/g, "").slice(0, 10)
                  )
                }
                placeholder="0000000000"
                inputMode="numeric"
              />
            </div>
            <button
              type="button"
              onClick={handleVerifyAccount}
              disabled={
                !accountName.trim() ||
                !accountNumber.trim() ||
                !bankCode ||
                verifying
              }
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[8px] bg-ink px-5 text-sm font-medium text-white transition-colors duration-150 hover:bg-ink-secondary focus-visible:ring-[3px] focus-visible:ring-focus-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 sm:w-auto sm:shrink-0"
            >
              {verifying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {verifying ? "Verifying account…" : "Verify account"}
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-[16px] border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <p className="text-sm font-semibold text-emerald-700">
              Account verified
            </p>
          </div>
          <div className="mt-3 rounded-[12px] bg-surface px-4 py-3 ring-1 ring-line">
            <p className="text-sm font-semibold text-ink">{accountName}</p>
            <p className="text-xs text-ink-muted">
              {bankName} · {masked}
            </p>
          </div>
        </div>
      )}

      {verified && (
        <p className="mt-4 rounded-[12px] border border-line bg-cardfill px-4 py-3 text-xs leading-[17px] text-ink-subtle">
          Your bank details are encrypted and used only for payment settlement.
        </p>
      )}

      <div className="mt-8 space-y-2 border-t border-line-subtle pt-6">
        {verified && (
          <button
            type="button"
            onClick={goBilling}
            className="inline-flex h-12 w-full items-center justify-center rounded-[8px] bg-ink px-5 text-sm font-medium text-white transition-colors duration-150 hover:bg-ink-secondary focus-visible:ring-[3px] focus-visible:ring-focus-ring focus-visible:outline-none"
          >
            Continue to Plans
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            setVerified(false);
            onExit();
          }}
          className="inline-flex h-12 w-full items-center justify-center rounded-[8px] px-5 text-sm font-medium text-ink-muted transition-colors duration-150 hover:bg-line-subtle hover:text-ink"
        >
          Back
        </button>
      </div>
    </>
  );
}
