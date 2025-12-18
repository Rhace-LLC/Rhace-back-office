import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { parseError } from "@/api-services/utils/parseError";
import { verifySubscriptionPayment } from "@/api-services/subscriptiions.service";
import { SubscriptionPlan } from "@/api-services/subscriptiions.service";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle } from "lucide-react";

interface PaystackCheckoutDialogProps {
  open: boolean;
  url: string;
  plan?: SubscriptionPlan;
  reference: string;
  onClose: () => void;
  onVerified: () => void; // Callback when payment is verified
}

export const PaystackCheckoutDialog: React.FC<PaystackCheckoutDialogProps> = ({
  open,
  url,
  plan,
  reference,
  onClose,
  onVerified,
}) => {
  const [verifying, setVerifying] = useState(false);
  const auth = useAuth();

  const handleVerifyPayment = async () => {
    setVerifying(true);
    try {
      await verifySubscriptionPayment(
        { reference: reference || "" },
        auth.token
      );
      toast.success("Subscription payment verified successfully!");
      onVerified();
      onClose();
    } catch (error: any) {
      const message = parseError(error);
      toast.error(message || "Failed to verify payment.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose();
          handleVerifyPayment();
        }
      }}
    >
      <DialogContent
        className="flex h-[500px] w-[80%] max-w-[600px] flex-col overflow-auto rounded-2xl p-0"
        onInteractOutside={(e) => e.preventDefault()} // Prevent closing on outside click
      >
        {/* Compact Header */}
        <div className="border-b px-4 py-2 text-center">
          <h2 className="text-md flex items-center justify-center gap-1 font-semibold">
            Complete Payment{" "}
            <CheckCircle className="inline h-5 w-5 text-green-500" />
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Follow the steps below to complete your subscription payment for{" "}
            <span className="font-medium">{plan?.name}</span> plan.
          </p>
        </div>

        {/* Iframe */}
        <div className="flex-1">
          <iframe
            src={url}
            title="Paystack Checkout"
            className="h-full w-full border-0"
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        </div>

        {/* Compact Footer */}
        <div className="flex justify-center gap-2 border-t bg-gray-50 px-4 py-2">
          <Button
            variant="outline"
            onClick={handleVerifyPayment}
            disabled={verifying}
            className="px-3 py-1 text-sm"
          >
            {verifying ? "Verifying..." : "I've Completed Payment"}
          </Button>
          <Button
            variant="destructive"
            onClick={onClose}
            className="px-3 py-1 text-sm"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
