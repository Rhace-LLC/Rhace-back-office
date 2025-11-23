import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SubscriptionPlan } from "@/api-services/subscriptiions.service";

interface PlanCardProps {
  plan: SubscriptionPlan;
  onSelect: (plan: SubscriptionPlan) => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({ plan, onSelect }) => {
  const {
    name,
    base_price,
    staff_threshold,
    surcharge_percentage,
    grace_period_days,
    description,
    is_active,
  } = plan;

  return (
    <Card
      className={`rounded-xl border border-gray-200 ${!is_active ? "cursor-not-allowed opacity-50" : "transition-shadow hover:shadow-md"}`}
    >
      <CardContent className="flex h-full flex-col justify-between p-6">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>

        {/* Pricing & features */}
        <div className="mb-6 space-y-1">
          <p className="text-lg font-bold text-gray-800">
            {Number(base_price).toLocaleString("en-NG", {
              style: "currency",
              currency: "NGN",
            })}
            /Month
          </p>
          <p className="text-sm text-gray-600">
            Staff Limit: {staff_threshold}
          </p>
          {Number(surcharge_percentage) > 0 && (
            <p className="text-sm text-orange-500">
              Surcharge: {surcharge_percentage}%
            </p>
          )}
          <p className="text-sm text-gray-600">
            Grace Period: {grace_period_days} days
          </p>
        </div>

        {/* Choose Plan Button */}
        <Button
          size="lg"
          className="mt-auto cursor-pointer"
          onClick={() => onSelect(plan)}
          disabled={!is_active}
        >
          {is_active ? "Choose Plan" : "Unavailable"}
        </Button>
      </CardContent>
    </Card>
  );
};
