"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { StepHeader } from "./ui";
import { obField } from "./tokens";
import { BillingModel } from "./types";

const BANKS = [
  "Access Bank",
  "Zenith Bank",
  "Guaranty Trust Bank (GTB)",
  "United Bank for Africa (UBA)",
  "First Bank",
  "Wema Bank",
  "Providus Bank",
  "Kuda Bank",
  "Moniepoint",
  "Opay",
];

const PLANS = [
  {
    key: "starter",
    name: "Starter",
    price: "₦10,000",
    blurb: "For small restaurants getting started.",
    features: [
      "POS",
      "Digital menu",
      "QR ordering",
      "Order management",
      "Basic reports",
      "2 staff accounts",
    ],
  },
  {
    key: "growth",
    name: "Growth",
    price: "₦25,000",
    blurb: "For growing restaurants.",
    popular: true,
    features: [
      "Everything in Starter",
      "Unlimited orders",
      "Kitchen Display",
      "Inventory",
      "Staff management",
      "Advanced analytics",
      "WhatsApp ordering",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    price: "₦50,000",
    blurb: "For established restaurants.",
    features: [
      "Everything in Growth",
      "Advanced analytics",
      "Multiple branches",
      "Advanced inventory",
      "Customer management",
      "Loyalty",
      "Priority support",
    ],
  },
];

type Substep = "bank" | "billing" | "plan" | "confirm";

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
  const [substep, setSubstep] = useState<Substep>("bank");

  // Bank details
  const [accountName, setAccountName] = useState(restaurantName ?? "");
  const [bank, setBank] = useState(BANKS[0]);
  const [accountNumber, setAccountNumber] = useState("");
  const [verified, setVerified] = useState(false);

  // Billing
  const [model, setModel] = useState<BillingModel>("subscription");
  const [planName, setPlanName] = useState<string>("Growth");

  const verifyAccount = () => {
    if (!accountName.trim() || !accountNumber.trim()) return;
    setVerified(true);
    // Brief "Account verified" flash, then straight to the plans screen.
    window.setTimeout(goBilling, 600);
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

  /* ------------------------- PLAN (subscription) ------------------------- */
  if (substep === "plan") {
    return (
      <>
        <StepHeader
          step="05"
          title="Choose how you want to grow"
          subtitle="Start with the plan that works best for your restaurant. You can change your plan anytime."
        />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const active = planName === plan.name;
            return (
              <button
                key={plan.key}
                type="button"
                onClick={() => setPlanName(plan.name)}
                className={cn(
                  "relative flex min-h-[420px] flex-col rounded-[16px] border bg-surface p-6 text-left transition-colors duration-150 sm:min-h-[440px] sm:p-7",
                  active
                    ? "border-brand ring-1 ring-brand"
                    : "border-line hover:border-line-strong"
                )}
              >
                {plan.popular && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-0.5 text-[10px] font-semibold tracking-wide text-white">
                    Most Popular
                  </span>
                )}
                <span className="mt-2 text-sm leading-5 font-semibold text-ink">
                  {plan.name}
                </span>
                <span className="mt-2 text-[24px] leading-[29px] font-semibold tracking-[-0.4px] text-ink">
                  {plan.price}
                  <span className="ml-1 text-sm font-normal text-ink-muted">
                    /month
                  </span>
                </span>
                <span className="mt-1.5 text-sm leading-5 text-ink-muted">
                  {plan.blurb}
                </span>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm leading-5 text-ink"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <span
                  aria-hidden
                  className={cn(
                    "mt-6 flex h-10 items-center justify-center rounded-[10px] border text-sm font-medium transition-colors duration-150",
                    active
                      ? "border-brand bg-brand text-white"
                      : "border-line bg-cardfill text-ink"
                  )}
                >
                  Select {plan.name}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-8 space-y-2 border-t border-line-subtle pt-6">
          <button
            type="button"
            onClick={goConfirm}
            className="inline-flex h-12 w-full items-center justify-center rounded-[8px] bg-ink px-5 text-sm font-medium text-white transition-colors duration-150 hover:bg-ink-secondary focus-visible:ring-[3px] focus-visible:ring-focus-ring focus-visible:outline-none"
          >
            Continue with {planName}
          </button>
          <button
            type="button"
            onClick={goBilling}
            className="inline-flex h-12 w-full items-center justify-center rounded-[8px] px-5 text-sm font-medium text-ink-muted transition-colors duration-150 hover:bg-line-subtle hover:text-ink"
          >
            Back to billing model
          </button>
        </div>
      </>
    );
  }

  /* ------------------------- BILLING MODEL ------------------------- */
  if (substep === "billing") {
    const models: {
      key: BillingModel;
      tag: string;
      price: string;
      meta: string;
      points: string[];
      cta: string;
      featured?: boolean;
    }[] = [
      {
        key: "payg",
        tag: "Pay As You Grow",
        price: "₦0 monthly",
        meta: "1.5% per transaction",
        featured: true,
        points: [
          "No monthly commitment",
          "Pay only when you earn",
          "Great for smaller restaurants",
        ],
        cta: "Choose Pay As You Grow",
      },
      {
        key: "subscription",
        tag: "Subscription",
        price: "From ₦10,000/month",
        meta: "Predictable monthly cost",
        points: [
          "Lower transaction costs",
          "Full restaurant tools",
          "Best for busy restaurants",
        ],
        cta: "Choose Subscription",
      },
    ];

    return (
      <>
        <StepHeader
          step="05"
          title="Choose your billing model"
          subtitle="No free vs premium — pick the way you want to pay as you grow."
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {models.map((m) => {
            const featured = m.featured;
            return (
              <div
                key={m.key}
                className={cn(
                  "flex flex-col rounded-[16px] p-6",
                  featured
                    ? "bg-gradient-to-br from-brand via-brand-secondary to-brand-accent shadow-md"
                    : "border border-line bg-surface"
                )}
              >
                <p
                  className={cn(
                    "text-[11px] leading-[15px] font-semibold tracking-[0.08em] uppercase",
                    featured ? "text-white/80" : "text-brand"
                  )}
                >
                  {m.tag}
                </p>
                <p
                  className={cn(
                    "mt-2 text-sm leading-5 font-medium",
                    featured ? "text-white/90" : "text-ink"
                  )}
                >
                  {m.meta}
                </p>
                <p
                  className={cn(
                    "mt-1 text-[24px] leading-[29px] font-semibold tracking-[-0.4px]",
                    featured ? "text-white" : "text-ink"
                  )}
                >
                  {m.price}
                </p>
                <ul className="mt-4 flex-1 space-y-2">
                  {m.points.map((point) => (
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
                  onClick={() => {
                    setModel(m.key);
                    if (m.key === "subscription") {
                      setSubstep("plan");
                    } else {
                      goConfirm();
                    }
                  }}
                  className={cn(
                    "mt-6 inline-flex h-12 w-full items-center justify-center rounded-[8px] text-sm font-medium transition-colors duration-150",
                    featured
                      ? "bg-white text-brand hover:bg-surface"
                      : "border border-line bg-surface text-ink hover:border-ink hover:bg-cardfill"
                  )}
                >
                  {m.cta}
                </button>
              </div>
            );
          })}
        </div>
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
                value={bank}
                onChange={(e) => setBank(e.target.value)}
              >
                {BANKS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
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
              onClick={verifyAccount}
              disabled={!accountName.trim() || !accountNumber.trim()}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[8px] bg-ink px-5 text-sm font-medium text-white transition-colors duration-150 hover:bg-ink-secondary focus-visible:ring-[3px] focus-visible:ring-focus-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 sm:w-auto sm:shrink-0"
            >
              <Check className="h-4 w-4" />
              Verify account
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
              {bank} · {masked}
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
