"use client";

import { useTransition } from "react";
import { Button } from "@nlt-invoice/ui";
import { createStripeCheckoutSessionAction } from "@/features/billing/server/actions";
import { StatusBanner } from "@/components/shared/status-banner";
import { useState } from "react";

export function UpgradeButton() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  return (
    <div className="flex flex-col gap-2">
      <StatusBanner message={error} />
      <Button
        className="rounded-full w-max"
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            setError(undefined);
            const result = await createStripeCheckoutSessionAction();
            if (!result?.success) {
              setError(result?.message || "Failed to start checkout process");
            }
          });
        }}
      >
        {isPending ? "Connecting to Stripe..." : "Upgrade to Pro"}
      </Button>
    </div>
  );
}
