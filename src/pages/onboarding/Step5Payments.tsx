"use client";
import { useState } from "react";
import { Check, CheckCircle2, Sparkles } from "lucide-react";
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

type Substep = "bank" | "billing" | "plan" | "confirm" | "ready";

function CheckBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-[8px] border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
      <Check className="h-3.5 w-3.5" />
      {label}
    </span>
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
  };

  const masked = `•••• ${accountNumber.slice(-4) || "0000"}`;

  const goBank = () => setSubstep("bank");
  const goBilling = () => setSubstep("billing");
  const goConfirm = () => setSubstep("confirm");
  const goReady = () => setSubstep("ready");

  /* ------------------------- READY ------------------------- */
  if (substep === "ready") {
    const checklistDone = [
      "Restaurant profile",
      "Menu added",
      "Tables configured",
      "Team configured",
      "Billing plan selected",
    ];
    const checklistNext = [
      "Generate QR codes",
      "Connect WhatsApp",
      "Configure opening hours",
      "Add inventory",
      "Customize online ordering page",
    ];
    return (
      <>
        <div className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </span>
          <StepHeader
            step="05"
            title="You're all set."
            subtitle="Your restaurant is ready to go live. Finish the remaining setup items whenever you're ready — they live in your dashboard."
          />
        </div>

        <div className="mt-6 rounded-[16px] border border-line bg-cardfill p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-ink">Restaurant setup</p>
            <span className="text-sm font-semibold text-brand">80%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-line">
            <div className="h-full w-[80%] rounded-full bg-brand" />
          </div>

          <ul className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {checklistDone.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-sm leading-5 text-ink"
              >
                <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-5 border-t border-line-subtle pt-4">
            <p className="mb-2 text-xs font-medium tracking-wide text-ink-muted uppercase">
              Next
            </p>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {checklistNext.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-sm leading-5 text-ink-subtle"
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded-full border border-line-strong">
                    <span className="h-1.5 w-1.5 rounded-full bg-line-strong" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 space-y-2 border-t border-line-subtle pt-6">
          <button
            type="button"
            onClick={onComplete}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[8px] bg-ink px-5 text-sm font-medium text-white transition-colors duration-150 hover:bg-ink-secondary focus-visible:ring-[3px] focus-visible:ring-focus-ring focus-visible:outline-none"
          >
            <Sparkles className="h-4 w-4" />
            Go to Dashboard
          </button>
        </div>
      </>
    );
  }

  /* ------------------------- CONFIRM ------------------------- */
  if (substep === "confirm") {
    const isPayg = model === "payg";
    const plan = PLANS.find((p) => p.name === planName);
    return (
      <>
        <StepHeader
          step="05"
          title="You're almost ready."
          subtitle="Review your choices below. You can change your plan anytime."
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-[16px] border border-line bg-cardfill px-4 py-3.5">
            <span className="text-sm text-ink-muted">Plan</span>
            <span className="text-sm font-semibold text-ink">
              {isPayg
                ? "Pay As You Grow"
                : `${plan?.name} · ${plan?.price}/month`}
            </span>
          </div>
          {!isPayg && (
            <div className="flex items-center justify-between rounded-[16px] border border-line bg-cardfill px-4 py-3.5">
              <span className="text-sm text-ink-muted">Billing</span>
              <span className="text-sm font-semibold text-ink">Monthly</span>
            </div>
          )}
          {isPayg && (
            <>
              <div className="flex items-center justify-between rounded-[16px] border border-line bg-cardfill px-4 py-3.5">
                <span className="text-sm text-ink-muted">Monthly fee</span>
                <span className="text-sm font-semibold text-ink">₦0</span>
              </div>
              <div className="flex items-center justify-between rounded-[16px] border border-line bg-cardfill px-4 py-3.5">
                <span className="text-sm text-ink-muted">Transaction fee</span>
                <span className="text-sm font-semibold text-ink">1.5%</span>
              </div>
            </>
          )}
          <div className="flex items-center justify-between gap-3 rounded-[16px] border border-line bg-cardfill px-4 py-3.5">
            <span className="text-sm text-ink-muted">Payment account</span>
            <span className="flex items-center gap-2 text-sm font-medium text-ink">
              <CheckBadge label="Verified" />
              {bank} {masked}
            </span>
          </div>
        </div>

        <div className="mt-8 space-y-2 border-t border-line-subtle pt-6">
          <button
            type="button"
            onClick={goReady}
            className="inline-flex h-12 w-full items-center justify-center rounded-[8px] bg-ink px-5 text-sm font-medium text-white transition-colors duration-150 hover:bg-ink-secondary focus-visible:ring-[3px] focus-visible:ring-focus-ring focus-visible:outline-none"
          >
            {isPayg ? "Launch My Restaurant" : "Start Free Trial"}
          </button>
          <button
            type="button"
            onClick={goBilling}
            className="inline-flex h-12 w-full items-center justify-center rounded-[8px] px-5 text-sm font-medium text-ink-muted transition-colors duration-150 hover:bg-line-subtle hover:text-ink"
          >
            Back
          </button>
        </div>
      </>
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
                  "relative flex flex-col rounded-[16px] border bg-surface p-5 text-left transition-colors duration-150",
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
                <span className="text-sm leading-5 font-semibold text-ink">
                  {plan.name}
                </span>
                <span className="mt-1 text-[24px] leading-[29px] font-semibold tracking-[-0.4px] text-ink">
                  {plan.price}
                  <span className="ml-1 text-sm font-normal text-ink-muted">
                    /month
                  </span>
                </span>
                <span className="mt-1 text-sm leading-5 text-ink-muted">
                  {plan.blurb}
                </span>
                <ul className="mt-4 flex-1 space-y-2">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm leading-5 text-ink"
                    >
                      <Check className="h-4 w-4 shrink-0 text-brand" />
                      {feature}
                    </li>
                  ))}
                </ul>
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
    }[] = [
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
      {
        key: "payg",
        tag: "Pay As You Grow",
        price: "₦0 monthly",
        meta: "1.5% per transaction",
        points: [
          "No monthly commitment",
          "Pay only when you earn",
          "Great for smaller restaurants",
        ],
        cta: "Choose Pay As You Grow",
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
          {models.map((m) => (
            <div
              key={m.key}
              className="flex flex-col rounded-[16px] border border-line bg-surface p-6"
            >
              <p className="text-[11px] leading-[15px] font-semibold tracking-[0.08em] text-brand uppercase">
                {m.tag}
              </p>
              <p className="mt-2 text-sm leading-5 font-medium text-ink">
                {m.meta}
              </p>
              <p className="mt-1 text-[24px] leading-[29px] font-semibold tracking-[-0.4px] text-ink">
                {m.price}
              </p>
              <ul className="mt-4 flex-1 space-y-2">
                {m.points.map((point) => (
                  <li
                    key={point}
                    className="flex items-center gap-2 text-sm leading-5 text-ink"
                  >
                    <Check className="h-4 w-4 shrink-0 text-brand" />
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
                className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-[8px] border border-line bg-surface text-sm font-medium text-ink transition-colors duration-150 hover:border-ink hover:bg-cardfill"
              >
                {m.cta}
              </button>
            </div>
          ))}
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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="ob-acct-name" className="mb-1.5 block text-sm font-medium leading-5 text-ink-secondary">
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
            <label htmlFor="ob-bank" className="mb-1.5 block text-sm font-medium leading-5 text-ink-secondary">
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
          <div>
            <label htmlFor="ob-acct-no" className="mb-1.5 block text-sm font-medium leading-5 text-ink-secondary">
              Account number
            </label>
            <input
              id="ob-acct-no"
              className={obField}
              value={accountNumber}
              onChange={(e) =>
                setAccountNumber(e.target.value.replace(/[^\d]/g, "").slice(0, 10))
              }
              placeholder="0000000000"
              inputMode="numeric"
            />
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
        <button
          type="button"
          onClick={goBilling}
          disabled={!verified}
          className="inline-flex h-12 w-full items-center justify-center rounded-[8px] bg-ink px-5 text-sm font-medium text-white transition-colors duration-150 hover:bg-ink-secondary focus-visible:ring-[3px] focus-visible:ring-focus-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
        >
          Continue to Plans
        </button>
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
        {!verified && (
          <button
            type="button"
            onClick={verifyAccount}
            disabled={!accountName.trim() || !accountNumber.trim()}
            className="inline-flex h-12 w-full items-center justify-center rounded-[8px] px-5 text-sm font-medium text-brand transition-colors duration-150 hover:bg-brand/[0.04] disabled:pointer-events-none disabled:opacity-40"
          >
            Verify account
          </button>
        )}
      </div>
    </>
  );
}
