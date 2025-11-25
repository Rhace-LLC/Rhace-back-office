import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

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
        } // Verify on close
      }}
    >
      <DialogContent className="h-[600px] w-[80%] max-w-[600px] overflow-auto rounded-2xl p-0">
        {/* Header */}
        <DialogHeader className="flex flex-col items-center justify-center border-b bg-gray-50">
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            Complete Payment <CheckCircle className="h-5 w-5 text-green-500" />
          </DialogTitle>
          <DialogDescription className="mt-1 text-center text-gray-600">
            Follow the steps below to complete your subscription payment for{" "}
            <span className="font-medium">{plan?.name}</span> plan.
          </DialogDescription>
        </DialogHeader>
        <div className="h-[600px] w-full overflow-auto">
          <iframe
            src={url}
            title="Paystack Checkout"
            className="h-full w-full border-0"
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        </div>

        {/* Footer actions */}
        <DialogFooter className="flex justify-center gap-3 border-t bg-gray-50 px-4 pt-4">
          <Button
            variant="outline"
            onClick={handleVerifyPayment}
            disabled={verifying}
          >
            {verifying ? "Verifying..." : "I've Completed Payment"}
          </Button>
          <Button variant="destructive" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
