"use client";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  useRestaurantProfileQuery,
  restaurantProfileKeys,
} from "@/hooks/useRestaurantProfile";
import {
  patchRestaurantProfile,
  completeRestaurantOnboarding,
  updateRestaurantOnboardingStep,
  RestaurantProfile,
} from "@/api-services/restaurantProfile";
import { createCategory, createMenuItem } from "@/api-services/menu.service";
import { createInventoryItem } from "@/api-services/inventory.service";
import { inviteStaff } from "@/api-services/auth.service";
import { parseError } from "@/api-services/utils/parseError";
import { StepProgress } from "./StepProgress";
import { Step1Restaurant } from "./Step1Restaurant";
import { Step2Menu } from "./Step2Menu";
import { Step4Team } from "./Step4Team";
import { Step5Payments } from "./Step5Payments";
import { obPanel } from "./tokens";
import { OnboardingData, MenuData, TeamData, RestaurantInfo } from "./types";

const DRAFT_KEY = "rhace_onboarding_draft";

/** Backend-tracked steps we actually render. Step 3 ("Setup") is hidden for now. */
const VISIBLE_STEPS = [1, 2, 4, 5];

const clampStep = (n: number) => Math.min(5, Math.max(1, Math.round(n) || 1));

/** Fold a stored step 3 into step 4 since the Setup UI is hidden. */
const normalizeStep = (n: number) => (clampStep(n) === 3 ? 4 : clampStep(n));

const nextVisibleStep = (step: number) => {
  const idx = VISIBLE_STEPS.indexOf(step);
  if (idx === -1) return step;
  return VISIBLE_STEPS[Math.min(idx + 1, VISIBLE_STEPS.length - 1)];
};

const prevVisibleStep = (step: number) => {
  const idx = VISIBLE_STEPS.indexOf(step);
  if (idx === -1) return step;
  return VISIBLE_STEPS[Math.max(idx - 1, 0)];
};

const STEP_LABEL: Record<number, string> = {
  1: "Restaurant",
  2: "Menu",
  4: "Team",
  5: "Payments",
};

export default function Onboarding() {
  const auth = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile } = useRestaurantProfileQuery();

  const [step, setStep] = useState(() =>
    normalizeStep(profile?.current_onboarding_step ?? 1)
  );
  const finishingRef = useRef(false);
  const [saving, setSaving] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const [menuProgress, setMenuProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);
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
  const restaurantId = auth.restaurants?.[0]?.id;

  const writeProfileCache = (profile: RestaurantProfile) => {
    if (!restaurantId) return;
    queryClient.setQueryData<RestaurantProfile>(
      restaurantProfileKeys.detail(restaurantId),
      (old) => (old ? { ...old, ...profile } : profile)
    );
  };

  const dataUrlToFile = async (dataUrl: string) => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], "image.png", { type: blob.type || "image/png" });
  };

  /** Step 1 — persist restaurant details (+ logo / cover uploads). */
  const persistRestaurant = async (r: RestaurantInfo, nextStep: number) => {
    if (!restaurantId || !auth.token) return;

    const body: Partial<RestaurantProfile> = {
      name: r.name,
      description: r.description || null,
      features: r.features,
      phone: r.phone,
      email: r.email,
      address: r.address,
      city: r.city,
      state: r.state,
      country: r.country,
      current_onboarding_step: nextStep,
    };

    try {
      const updated = await patchRestaurantProfile(restaurantId, body, auth.token);
      writeProfileCache(updated);
    } catch (error) {
      console.error("Failed to persist restaurant details:", error);
      toast.error(parseError(error) || "Could not save your restaurant details.");
    }

    if (r.logoUrl || r.coverUrl) {
      try {
        const formData = new FormData();
        if (r.logoUrl) formData.append("logo", await dataUrlToFile(r.logoUrl));
        if (r.coverUrl)
          formData.append("cover_image", await dataUrlToFile(r.coverUrl));
        const updated = await patchRestaurantProfile(restaurantId, formData, auth.token);
        writeProfileCache(updated);
      } catch (error) {
        console.error("Failed to upload restaurant images:", error);
        toast.error(parseError(error) || "Could not upload your images.");
      }
    }
  };

/** Step 2 — create the chosen categories, then the menu items. */
const DEFAULT_PREP_TIME = "00:15:00";

const persistMenu = async (
    menu?: MenuData,
    onProgress?: (done: number, total: number) => void
  ) => {
    if (!restaurantId || !auth.token) return;
    if (!menu || menu.mode === "later" || menu.items.length === 0) return;

    const categoryIds = new Map<string, string>();
    const labels = [
      ...new Set(menu.items.map((i) => i.category.trim()).filter(Boolean)),
    ];
    const total = labels.length + menu.items.length;
    let done = 0;
    const tick = () => {
      done += 1;
      onProgress?.(done, total);
    };

    for (const label of labels) {
      try {
        const formData = new FormData();
        formData.append("name", label);
        formData.append("description", "");
        const res = await createCategory(restaurantId, formData, auth.token);
        categoryIds.set(label, String(res.id));
      } catch (error) {
        console.error(`Failed to create category "${label}":`, error);
        toast.error(parseError(error) || `Could not create category "${label}".`);
      } finally {
        tick();
      }
    }

    let created = 0;
    // Fresh restaurants have no inventory, but the menu-items endpoint
    // rejects an empty ingredients_data list. Create one placeholder stock
    // item and link every onboarding dish to it — the owner replaces it with
    // real ingredients later in Menu.
    let placeholderIngredientId: number | null = null;
    try {
      const placeholder = await createInventoryItem(
        {
          name: "General ingredient",
          is_allergen: false,
          unit: "portion",
          threshold: 0,
          restaurant: restaurantId,
        },
        auth.token
      );
      placeholderIngredientId = placeholder?.id ?? null;
    } catch (error) {
      console.error("Failed to create placeholder ingredient:", error);
      toast.error(
        parseError(error) ||
          "Could not set up ingredients, so menu items were skipped. Categories were saved."
      );
    }
    const ingredientsPayload =
      placeholderIngredientId != null
        ? JSON.stringify([
            { inventory_item: placeholderIngredientId, quantity: 1 },
          ])
        : null;

    for (const item of menu.items) {
      const categoryId = categoryIds.get(item.category.trim());
      if (!categoryId || !ingredientsPayload) {
        tick();
        continue;
      }
      try {
        const parsed = parseFloat(String(item.price).replace(/[^\d.]/g, ""));
        const formData = new FormData();
        formData.append("name", item.name.trim());
        formData.append("price", String(Number.isFinite(parsed) ? parsed : ""));
        if (item.description) formData.append("description", item.description.trim());
        formData.append("category_id", categoryId);
        // The menu-items endpoint requires prep_time and is_special alongside
        // the quartet named in its validation error (see AddDish + debug probe).
        // Onboarding has no prep-time input, so send a sensible default.
        formData.append("prep_time", DEFAULT_PREP_TIME);
        formData.append("is_special", "false");
        formData.append("available", item.available ? "true" : "false");
        if (item.image_url) formData.append("image", item.image_url);
        formData.append("ingredients_data", ingredientsPayload);
        await createMenuItem(restaurantId, formData, auth.token);
        created++;
      } catch (error) {
        console.error(`Failed to create menu item "${item.name}":`, error);
        toast.error(parseError(error) || `Could not add "${item.name}".`);
      } finally {
        tick();
      }
    }

    if (created > 0) {
      toast.success(`${created} menu item${created > 1 ? "s" : ""} added.`);
    }
  };

  /** Step 4 — invite each drafted team member. */
  const persistTeam = async (team?: TeamData) => {
    const members = team?.members ?? [];
    if (!restaurantId || !auth.token || members.length === 0) return;

    let invited = 0;
    for (const member of members) {
      const body = {
        first_name: member.firstName.trim(),
        last_name: member.lastName.trim(),
        email: member.contact.trim(),
        phone: "",
        role: member.role,
      };
      try {
        await inviteStaff(restaurantId, body, auth.token);
        invited++;
      } catch (error) {
        console.error("Failed to invite team member:", error);
        toast.error(
          parseError(error) ||
            `Could not invite ${member.firstName} ${member.lastName}.`
        );
      }
    }

    if (invited > 0) {
      toast.success(`${invited} team invite${invited > 1 ? "s" : ""} sent.`);
    }
  };

  /** Advance the backend onboarding step tracker. */
  const persistStep = async (nextStep: number) => {
    if (!restaurantId || !auth.token) return;
    try {
      await updateRestaurantOnboardingStep(restaurantId, nextStep, auth.token);
      queryClient.setQueryData<RestaurantProfile>(
        restaurantProfileKeys.detail(restaurantId),
        (old) => (old ? { ...old, current_onboarding_step: nextStep } : old)
      );
    } catch (error) {
      console.error("Failed to persist onboarding step:", error);
      toast.error(parseError(error) || "Could not save your progress.");
    }
  };

  const next = async (payload?: Partial<OnboardingData>) => {
    if (saving || skipping) return;
    if (payload) setData((prev) => ({ ...prev, ...payload }));

    setSaving(true);
    try {
      const nextStep = nextVisibleStep(step);
      if (step === 1) {
        if (payload?.restaurant) {
          await persistRestaurant(payload.restaurant, nextStep);
        } else {
          await persistStep(nextStep);
        }
      } else if (step === 2) {
        setMenuProgress(null);
        await persistMenu(payload?.menu ?? data.menu, (done, total) =>
          setMenuProgress({ done, total })
        );
        await persistStep(nextStep);
      } else if (step === 4) {
        await persistTeam(payload?.team ?? data.team);
        await persistStep(nextStep);
      }

      setStep(nextStep);
    } finally {
      setSaving(false);
      setMenuProgress(null);
    }
  };

  /** Skip the current step without running its writes (no invites/menu). */
  const skip = async (payload?: Partial<OnboardingData>) => {
    if (saving || skipping) return;
    if (payload) setData((prev) => ({ ...prev, ...payload }));

    setSkipping(true);
    try {
      const nextStep = nextVisibleStep(step);
      await persistStep(nextStep);
      setStep(nextStep);
    } finally {
      setSkipping(false);
    }
  };

  const finish = async () => {
    if (finishingRef.current) return;
    finishingRef.current = true;

    try {
      if (!restaurantId || !auth.token) throw new Error("Missing restaurant session");
      await completeRestaurantOnboarding(restaurantId, auth.token);
      localStorage.removeItem(DRAFT_KEY);
      queryClient.setQueryData<RestaurantProfile>(
        restaurantProfileKeys.detail(restaurantId),
        (old) =>
          old
            ? { ...old, current_onboarding_step: 5, onboarding_complete: true }
            : old
      );
      await queryClient.invalidateQueries({ queryKey: restaurantProfileKeys.all });
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      toast.error(parseError(error) || "Could not complete onboarding.");
    } finally {
      finishingRef.current = false;
    }
  };

  const isFirst = step === VISIBLE_STEPS[0];
  const backStep = prevVisibleStep(step);

  return (
    <div className="w-full px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-[920px]">
        {/* Top utility row */}
        <div className="mb-6 flex items-center justify-between">
          {!isFirst ? (
            <button
              type="button"
              onClick={() => setStep(backStep)}
              className="inline-flex h-9 items-center gap-1.5 rounded-2xl px-3 text-sm font-medium text-ink-muted transition-colors hover:bg-line-subtle hover:text-ink"
            >
              <ArrowLeft className="h-4 w-4" />
              {STEP_LABEL[backStep]}
            </button>
          ) : (
            <span />
          )}
          <span />
        </div>

        {/* Progress indicator */}
        <div className="mb-8 rounded-[20px] border border-line bg-surface px-4 py-5 shadow-sm sm:px-6">
          <StepProgress current={step} />
        </div>

        {/* Active step */}
        <div className={`${obPanel} overflow-hidden px-5 py-7 sm:px-10 sm:py-10`}>
          {step === 1 && (
            <Step1Restaurant
              saving={saving}
              onContinue={(d) => next({ restaurant: d })}
            />
          )}
          {step === 2 && (
            <Step2Menu
              saving={saving}
              skipping={skipping}
              progress={menuProgress}
              onContinue={(d) => next({ menu: d })}
              onSkip={() =>
                skip({ menu: { mode: "later", categories: [], items: [] } })
              }
            />
          )}
          {step === 4 && (
            <Step4Team
              ownerEmail={ownerEmail}
              saving={saving}
              skipping={skipping}
              onContinue={(d) => next({ team: d })}
              onSkip={() => skip({ team: { members: [] } })}
            />
          )}
          {step === 5 && (
            <Step5Payments
              restaurantName={restaurantName}
              onExit={() => setStep(prevVisibleStep(step))}
              onComplete={finish}
            />
          )}
        </div>
      </div>
    </div>
  );
}
