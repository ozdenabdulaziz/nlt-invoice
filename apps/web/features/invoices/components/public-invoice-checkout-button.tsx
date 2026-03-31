"use client";

import { useState, useTransition } from "react";

import { StatusBanner } from "@/components/shared/status-banner";
import { Button } from "@nlt-invoice/ui";

export function PublicInvoiceCheckoutButton({
  publicId,
  isDisabled,
}: {
  publicId: string;
  isDisabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>();

  if (isDisabled) {
    return null;
  }

  return (
    <div className="space-y-3">
      <StatusBanner message={message} />
      <Button
        type="button"
        className="rounded-full px-6"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            setMessage(undefined);

            const response = await fetch("/api/stripe/checkout", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ publicId }),
            });

            const payload = (await response.json()) as {
              url?: string;
              message?: string;
            };

            if (!response.ok || !payload.url) {
              setMessage(payload.message ?? "Unable to start checkout.");
              return;
            }

            window.location.href = payload.url;
          })
        }
      >
        {isPending ? "Redirecting..." : "Pay now"}
      </Button>
    </div>
  );
}
