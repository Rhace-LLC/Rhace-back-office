import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"; // Added DialogDescription import for better structure
import { Button } from "@/components/ui/button";
import { SubscriptionPlan } from "@/api-services/subscriptiions.service";

interface PlanSelectionModalProps {
  open: boolean;
  plan?: SubscriptionPlan;
  onClose: () => void;
  onProceed: (plan: SubscriptionPlan) => void;
}

export const PlanSelectionModal: React.FC<PlanSelectionModalProps> = ({
  open,
  plan,
  onClose,
  onProceed,
}) => {
  if (!plan) return null;

  // Helper for formatting currency (assuming 'plan.base_price' is a number)
  const formatCurrency = (price: string | number) =>
    `₦${Number(price).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  // --- Start of Presentation Changes ---
  return (
    <Dialog open={open} onOpenChange={onClose}>
      {/* Increased max-width slightly for better desktop feel, made width relative */}
      <DialogContent className="w-[90%] max-w-lg rounded-xl p-6 sm:p-8">
        <DialogHeader className="mb-4 border-b pb-4 !text-center">
          {/* Enhanced title style */}
          <DialogTitle className="text-2xl font-bold tracking-tight text-gray-900">
            Confirm Subscription Choice
          </DialogTitle>
          {/* Added description for context */}
          <DialogDescription className="pt-1 text-lg font-medium text-indigo-600">
            {plan.name} Plan
          </DialogDescription>
        </DialogHeader>

        {/* Plan Details Section: Clean, structured layout */}
        <div className="space-y-4">
          {/* Detail Item Component */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <span className="font-medium text-gray-500">Base Price</span>
            <span className="text-xl font-bold text-gray-800">
              {formatCurrency(plan.base_price)}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <span className="font-medium text-gray-500">Staff Threshold</span>
            <span className="font-semibold text-gray-700">
              {plan.staff_threshold} Staff
            </span>
          </div>

          {Number(plan.surcharge_percentage) > 0 && (
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <span className="font-medium text-gray-500">
                Over-Limit Surcharge
              </span>
              <span className="font-semibold text-red-500">
                {plan.surcharge_percentage}%
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-500">Grace Period</span>
            <span className="text-gray-700">{plan.grace_period_days} days</span>
          </div>

          {plan.description && (
            <div className="mt-4 border-t pt-4">
              <h4 className="mb-1 font-semibold text-gray-700">Description:</h4>
              <p className="text-sm text-gray-500 italic">{plan.description}</p>
            </div>
          )}
        </div>

        {/* Footer: Uses Shadcn/UI default styling, which is minimal */}
        <DialogFooter className="mt-8 border-t pt-4">
          {/* Used destructive variant for Cancel for better separation from primary action */}
          <Button variant="outline" className="mr-3" onClick={onClose}>
            Cancel
          </Button>
          {/* Proceed button remains primary */}
          <Button onClick={() => onProceed(plan)}>Proceed to Checkout</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
  // --- End of Presentation Changes ---
};
