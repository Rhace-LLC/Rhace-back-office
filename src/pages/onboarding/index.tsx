"use client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { StepProgress } from "./StepProgress";
import { Step1Restaurant } from "./Step1Restaurant";
import { Step2Menu } from "./Step2Menu";
import { Step3Tables } from "./Step3Tables";
import { Step4Team } from "./Step4Team";
import { Step5Payments } from "./Step5Payments";
import { obPanel } from "./tokens";
import { OnboardingData } from "./types";

const STEP_LABELS = ["Restaurant", "Menu", "Setup", "Team"];
const DRAFT_KEY = "rhace_onboarding_draft";

export default function Onboarding() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      return raw ? (JSON.parse(raw) as OnboardingData) : {};
    } catch {
      return {};
    }
  });

  // Keep a local draft so progress survives an accidental refresh.
  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  }, [data]);

  const ownerEmail = auth.email;
  const restaurantName = auth.restaurants?.[0]?.name;

  const next = (payload?: Partial<OnboardingData>) => {
    if (payload) setData((prev) => ({ ...prev, ...payload }));
    setStep((s) => Math.min(5, s + 1));
  };

  const finish = () => {
    localStorage.removeItem(DRAFT_KEY);
    navigate("/dashboard");
  };

  return (
    <div className="w-full px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-[920px]">
        {/* Top utility row */}
        <div className="mb-6 flex items-center justify-between">
          {step > 1 && step < 5 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="inline-flex h-9 items-center gap-1.5 rounded-[10px] px-3 text-sm font-medium text-ink-muted transition-colors hover:bg-line-subtle hover:text-ink"
            >
              <ArrowLeft className="h-4 w-4" />
              {STEP_LABELS[step - 2]}
            </button>
          ) : (
            <span />
          )}
          {step < 5 && (
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="inline-flex h-9 items-center rounded-[10px] px-3 text-sm font-medium text-ink-muted transition-colors hover:bg-line-subtle hover:text-ink"
            >
              Skip onboarding
            </button>
          )}
        </div>

        {/* Progress indicator */}
        <div className="mb-8 rounded-[16px] border border-line bg-surface px-4 py-5 shadow-sm sm:px-6">
          <StepProgress current={step} />
        </div>

        {/* Active step */}
        <div className={`${obPanel} overflow-hidden px-5 py-7 sm:px-10 sm:py-10`}>
          {step === 1 && <Step1Restaurant onContinue={(d) => next({ restaurant: d })} />}
          {step === 2 && <Step2Menu onContinue={(d) => next({ menu: d })} />}
          {step === 3 && <Step3Tables onContinue={(d) => next({ floor: d })} />}
          {step === 4 && (
            <Step4Team
              ownerEmail={ownerEmail}
              onContinue={(d) => next({ team: d })}
            />
          )}
          {step === 5 && (
            <Step5Payments
              restaurantName={restaurantName}
              onExit={() => setStep(4)}
              onComplete={finish}
            />
          )}
        </div>
      </div>
    </div>
  );
}
