"use client";

import { useTransition } from "react";
import { Button } from "@nlt-invoice/ui";
import { voidInvoiceAction, deleteDraftInvoiceAction } from "@/features/invoices/server/actions";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { InvoiceStatus } from "@prisma/client";

export function InvoiceManagementActions({
  invoiceId,
  status,
}: {
  invoiceId: string;
  status: InvoiceStatus;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const router = useRouter();

  if (status === "VOID" || status === "PAID") {
    return null;
  }

  const handleVoid = () => {
    startTransition(async () => {
      setError(undefined);
      if (confirm("Are you sure you want to void this invoice? This cannot be undone.")) {
        const result = await voidInvoiceAction(invoiceId);
        if (!result.success) {
          setError(result.message);
        } else if (result.data?.redirectTo) {
          router.push(result.data.redirectTo);
        }
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      setError(undefined);
      if (confirm("Are you sure you want to delete this draft? This cannot be undone.")) {
        const result = await deleteDraftInvoiceAction(invoiceId);
        if (!result.success) {
          setError(result.message);
        } else if (result.data?.redirectTo) {
          router.push(result.data.redirectTo);
        }
      }
    });
  };

  return (
    <div className="flex gap-2 items-center">
      {error && <span className="text-sm text-destructive">{error}</span>}
      {status !== "DRAFT" && (
        <Button
          variant="destructive"
          className="rounded-full px-6"
          disabled={isPending}
          onClick={handleVoid}
        >
          {isPending ? "Processing..." : "Void"}
        </Button>
      )}
      {status === "DRAFT" && (
        <Button
          variant="destructive"
          className="rounded-full px-6"
          disabled={isPending}
          onClick={handleDelete}
        >
          {isPending ? "Processing..." : "Delete"}
        </Button>
      )}
    </div>
  );
}
