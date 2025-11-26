import { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "@/contexts/AuthContext";
import { RootState } from "@/store/store";

import {
  getSubscriptionDetails,
  getSubscriptionPlans,
  getSubscriptionStatus,
  initiateRenewalPayment,
  initiateSubscriptionPayment,
  SubscriptionPlan,
} from "@/api-services/subscriptiions.service";

import {
  setSubscriptionDetails,
  setSubscriptionPlans,
  setSubscriptionStatus,
} from "@/store/subscriptions.slice";

import { parseError } from "@/api-services/utils/parseError";
import { toast } from "sonner";
import { ContentHOC } from "@/components/nocontent";
import { PlanCard } from "./plans";
import { PlanSelectionModal } from "./planModal";
import { useLoading } from "@/contexts/LoadingContext";
import { PaystackCheckoutDialog } from "./paymentModal";
import { SubscriptionDetails } from "./CurrentPlan";

export default function BillingPage() {
  const dispatch = useDispatch();
  const auth = useAuth();
  const { setLoading, setLoadingText } = useLoading();
  const [loading, setDataLoading] = useState(false);
  const [error, setError] = useState("");

  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState("");

  const [isSubscription, setIsSubscription] = useState(true);
  const [proceedModalOpen, setProceedModalOpen] = useState(false);

  const dataStore = useSelector((state: RootState) => state.subscriptions);
  const details = dataStore.details;
  const plans = dataStore.plans;

  //const status = dataStore.status;
  //const history = dataStore.paymentHistory;

  const [selectedPlan, setSlectedPlan] = useState<SubscriptionPlan>();
  const [paystack_url, setPaystackUrl] = useState("");
  const [paystackRef, setPaystackRef] = useState("");
  const [openPaystackDialog, setOpenPaystackDialog] = useState(false);

  const fetchAllData = async () => {
    try {
      setDataLoading(true);
      setIsSubscription(true);
      setError("");
      const res = await getSubscriptionDetails(auth.token);
      dispatch(setSubscriptionDetails(res));
    } catch (err) {
      let message = parseError(err);
      if (message == "No Subscription Found") {
        setIsSubscription(false);
      }
      toast.info(
        "No Subscription Found For this account, you have to Subscribe to Continue Using this account."
      );
    } finally {
      setDataLoading(false);
    }
  };

  const fetchStatus = async () => {
    try {
      setDataLoading(true);
      setError("");
      const res = await getSubscriptionStatus(auth.token);
      dispatch(setSubscriptionStatus(res));
      auth.setHasSubscribed(true);
    } catch (err) {
      let message = parseError(err);
      if (message == "No subscription found") {
        setIsSubscription(false);
      }
      toast.info(
        "No Subscription Found For this account, you have to Subscribe to Continue Using this account."
      );
    } finally {
      setDataLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      setPlansLoading(true);
      setPlansError("");
      const res = await getSubscriptionPlans(auth.token);
      dispatch(setSubscriptionPlans(res));
    } catch (err) {
      setPlansError(parseError(err) || "Failed to fetch inventory.");
    } finally {
      setPlansLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    fetchStatus();
  }, []);

  useEffect(() => {
    if (!isSubscription) {
      fetchPlans();
    }
  }, [isSubscription]);

  // if no subscription is found, then load the plans and render the UI for subscription plans

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSlectedPlan(plan);
    setProceedModalOpen(true);
  };

  const handleProceed = async (plan: SubscriptionPlan) => {
    console.log("User confirmed plan:", plan);
    setProceedModalOpen(false);

    try {
      setLoading(true);
      setLoadingText("Initializing Subscription Transaction...");

      // Call your API to initiate subscription payment
      const res = await initiateSubscriptionPayment(auth.token);
      setPaystackUrl(res.authorization_url);
      setPaystackRef(res.metadata.paystack_full_response.reference);
      setOpenPaystackDialog(true);

      // You can handle success here, e.g., toast success or redirect
      toast.success("Subscription transaction initialized successfully!");
    } catch (error: any) {
      const message = parseError(error);
      toast.error(message || "Failed to initiate subscription transaction.");
    } finally {
      setLoading(false);
      setLoadingText(""); // Reset loading text
    }
  };

  const handleRenew = async () => {
    try {
      setLoading(true);
      setLoadingText("Initializing Subscription Renewal...");

      // Call your API to initiate subscription payment
      const res = await initiateRenewalPayment(auth.token);
      setPaystackUrl(res.authorization_url);
      setPaystackRef(res.metadata.paystack_full_response.reference);
      setOpenPaystackDialog(true);
      toast.success("Subscription renewal initialized successfully!");
    } catch (error: any) {
      const message = parseError(error);
      toast.error(message || "Failed to initiate subscription transaction.");
    } finally {
      setLoading(false);
      setLoadingText(""); // Reset loading text
    }
  };

  return (
    <div className="mx-auto px-5 py-10">
      <h1 className="mb-6 text-3xl font-semibold">Billing & Subscription</h1>
      {isSubscription && (
        <ContentHOC
          loading={loading}
          error={!!error}
          noContent={false}
          loadingText="Fetching Subscription Details..."
          noContentMessage="No Subscription Found"
          noContentBtnText="Reload"
          noContentAction={fetchAllData}
          errMessage={error}
          actionFn={fetchAllData}
        >
          {/* Here we render subscription and billing informations as well as transaction history.*/}
          {details && (
            <SubscriptionDetails
              onRenew={handleRenew}
              details={details}
            ></SubscriptionDetails>
          )}
        </ContentHOC>
      )}

      {!isSubscription && (
        <div className="mx-auto rounded-xl border border-gray-200 bg-white/70 p-8 text-center shadow-sm transition duration-300">
          {/* Icon Placeholder (Optional: Add a cool icon like a sparkle or a lock here) */}
          <svg
            className="mx-auto mb-4 h-12 w-12 text-indigo-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-4a2 2 0 00-2-2H6a2 2 0 00-2 2v4a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v3h8z"
            ></path>
          </svg>

          <h2 className="mb-2 text-2xl font-bold tracking-tight text-gray-800">
            Unlock The Full Experience
          </h2>

          <p className="mt-4 text-lg text-gray-500">
            It looks like{" "}
            <span className="font-semibold">
              you don't have an active subscription
            </span>{" "}
            yet.
          </p>

          <div className="mt-6 space-y-3">
            <p className="text-sm text-gray-600">
              Choosing a plan grants full access
            </p>
            <p className="text-sm font-medium text-indigo-600">
              Select a plan below to get started immediately.
            </p>
          </div>
        </div>
      )}

      <div className="py-3" />

      {!isSubscription && (
        <ContentHOC
          loading={plansLoading}
          error={!!plansError}
          noContent={false}
          loadingText="Fetching Subscription Plans..."
          noContentMessage="No Subscription Plans"
          noContentBtnText="Reload"
          noContentAction={fetchPlans}
          errMessage={plansError}
          actionFn={fetchPlans}
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onSelect={handleSelectPlan} // use your handler
              />
            ))}
          </div>
          <div className="py-3" />
        </ContentHOC>
      )}

      {/* Modal */}
      <PlanSelectionModal
        open={proceedModalOpen}
        plan={selectedPlan}
        onClose={() => setProceedModalOpen(false)}
        onProceed={handleProceed}
      />

      <PaystackCheckoutDialog
        open={openPaystackDialog}
        url={paystack_url}
        plan={selectedPlan}
        reference={paystackRef}
        onClose={() => {
          setOpenPaystackDialog(false);
          //handleVerifyPayment(selectedPlan!); // Verify on close
        }}
        onVerified={() => {
          // Refresh subscription details
          fetchAllData();
          fetchStatus();
        }}
      />
    </div>
  );
}
