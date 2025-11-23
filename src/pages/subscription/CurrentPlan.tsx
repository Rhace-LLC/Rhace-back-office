import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SubscriptionDetails as SubscriptionDetailsType } from "@/api-services/subscriptiions.service";

interface SubscriptionDetailsProps {
  details: SubscriptionDetailsType;
  onRenew?: (details: SubscriptionDetailsType) => void;
}

export const SubscriptionDetails: React.FC<SubscriptionDetailsProps> = ({
  details,
  onRenew,
}) => {
  const formatCurrency = (num: string) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(Number(num));

  const formatDate = (dateStr: string | null) =>
    dateStr ? new Date(dateStr).toLocaleDateString() : "—";

  // Determine if subscription needs renewal (e.g., within 5 days of next billing)
  const showRenew = details.next_billing_date
    ? new Date(details.next_billing_date).getTime() - new Date().getTime() <=
      5 * 24 * 60 * 60 * 1000
    : false;

  return (
    <Card className="mx-auto shadow-lg">
      <CardContent className="space-y-4 p-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          {details.plan_name}
        </h2>
        <p className="text-gray-600">
          Restaurant:{" "}
          <span className="font-medium">{details.restaurant_name}</span>
        </p>
        <p className="text-gray-600">
          Status:{" "}
          <span
            className={`font-medium ${details.is_active ? "text-green-600" : "text-red-600"}`}
          >
            {details.status}
          </span>
        </p>
        <p className="text-gray-600">
          Current Price:{" "}
          <span className="font-medium">
            {formatCurrency(details.current_price)}
          </span>
        </p>
        <p className="text-gray-600">
          Staff Count at Billing:{" "}
          <span className="font-medium">{details.staff_count_at_billing}</span>
        </p>

        <div className="grid grid-cols-2 gap-4 text-gray-600">
          <div>
            <p>Start Date:</p>
            <p className="font-medium">{formatDate(details.start_date)}</p>
          </div>
          <div>
            <p>Next Billing Date:</p>
            <p className="font-medium">
              {formatDate(details.next_billing_date)}
            </p>
          </div>
          <div>
            <p>Last Payment Date:</p>
            <p className="font-medium">
              {formatDate(details.last_payment_date)}
            </p>
          </div>
          <div>
            <p>Days Until Next Billing:</p>
            <p className="font-medium">{details.days_until_billing}</p>
          </div>
        </div>

        {details.failed_payment_attempts > 0 && (
          <p className="font-medium text-red-600">
            Failed Payment Attempts: {details.failed_payment_attempts}
          </p>
        )}

        {showRenew && onRenew && (
          <div className="mt-10 flex justify-center">
            <Button
              className="h-12 w-full cursor-pointer rounded-[12px]"
              onClick={() => onRenew(details)}
            >
              Renew Subscription
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
