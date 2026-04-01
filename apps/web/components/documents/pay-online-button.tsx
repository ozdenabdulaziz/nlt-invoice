"use client";

import { useState } from "react";

import { Button } from "@nlt-invoice/ui";

type PayOnlineButtonProps = {
  publicId: string;
  balanceDue: string;
  currency: string;
};

function formatCurrency(value: string, currency: string) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
  }).format(Number(value));
}

export function PayOnlineButton({
  publicId,
  balanceDue,
  currency,
}: PayOnlineButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePayment() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ publicId }),
      });

      const data = (await response.json()) as {
        url?: string;
        message?: string;
      };

      if (!response.ok) {
        setError(data.message ?? "Something went wrong. Please try again.");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Unable to connect to payment service. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        className="w-full rounded-full"
        onClick={handlePayment}
        disabled={loading}
      >
        {loading
          ? "Redirecting to payment…"
          : `Pay ${formatCurrency(balanceDue, currency)} online`}
      </Button>
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
