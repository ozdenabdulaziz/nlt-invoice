"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { StatusBanner } from "@/components/shared/status-banner";
import { deleteCustomerAction } from "@/features/customers/server/actions";
import { Button } from "@nlt-invoice/ui";

export function CustomerDeleteButton({
  customerId,
  customerName,
}: {
  customerId: string;
  customerName: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>();

  return (
    <div className="space-y-3">
      <StatusBanner message={message} />
      <Button
        type="button"
        variant="destructive"
        className="rounded-full px-6"
        disabled={isPending}
        onClick={() => {
          if (
            !window.confirm(
              `Delete ${customerName}? This action cannot be undone.`,
            )
          ) {
            return;
          }

          startTransition(async () => {
            setMessage(undefined);
            const result = await deleteCustomerAction(customerId);

            if (!result.success) {
              setMessage(result.message);
              return;
            }

            router.push(result.data?.redirectTo ?? "/dashboard/customers");
            router.refresh();
          });
        }}
      >
        {isPending ? "Deleting..." : "Delete customer"}
      </Button>
    </div>
  );
}
