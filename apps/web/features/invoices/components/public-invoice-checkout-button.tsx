"use client";

import { useState, useTransition } from "react";

import { StatusBanner } from "@/components/shared/status-banner";
import { Button } from "@nlt-invoice/ui";

async function readCheckoutResponse(response: Response) {
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    return (await response.json()) as {
      message?: string;
      sessionId?: string;
      url?: string;
    };
  }

  const message = await response.text();

  return {
    message: message || undefined,
  };
}

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
            try {
              setMessage(undefined);

              const response = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ publicId }),
              });

              const payload = await readCheckoutResponse(response);

              if (!response.ok || !payload.url) {
                setMessage(
                  payload.message ??
                    `Checkout could not be started (HTTP ${response.status}).`,
                );
                return;
              }

              window.location.assign(payload.url);
            } catch (error) {
              setMessage(
                error instanceof Error
                  ? error.message
                  : "Unable to start checkout.",
              );
            }
          })
        }
      >
        {isPending ? "Redirecting..." : "Pay now"}
      </Button>
    </div>
  );
}
