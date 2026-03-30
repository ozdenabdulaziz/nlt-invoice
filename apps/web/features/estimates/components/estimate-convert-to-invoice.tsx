"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { StatusBanner } from "@/components/shared/status-banner";
import {
  canConvertEstimateToInvoice,
  getEstimateConversionRuleDescription,
} from "@/features/estimates/conversion-rules";
import { convertEstimateToInvoiceAction } from "@/features/estimates/server/actions";
import { buttonVariants, Button } from "@nlt-invoice/ui";
import { EstimateStatus } from "@prisma/client";

type EstimateConvertToInvoiceProps = {
  estimateId: string;
  status: EstimateStatus;
  linkedInvoice?: {
    id: string;
    invoiceNumber: string;
  } | null;
};

export function EstimateConvertToInvoice({
  estimateId,
  status,
  linkedInvoice,
}: EstimateConvertToInvoiceProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>();

  if (linkedInvoice) {
    return (
      <div className="flex flex-col gap-3">
        <Link
          href={`/dashboard/invoices/${linkedInvoice.id}`}
          className={buttonVariants({
            variant: "secondary",
            className: "rounded-full px-6",
          })}
        >
          View invoice {linkedInvoice.invoiceNumber}
        </Link>
        <p className="text-sm text-muted-foreground">
          This estimate is already linked to an invoice.
        </p>
      </div>
    );
  }

  if (!canConvertEstimateToInvoice(status)) {
    return (
      <div className="max-w-xs text-sm text-muted-foreground">
        {getEstimateConversionRuleDescription()}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Button
        type="button"
        variant="secondary"
        className="rounded-full px-6"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            setMessage(undefined);
            const result = await convertEstimateToInvoiceAction(estimateId);

            if (!result.success) {
              setMessage(result.message);
              return;
            }

            router.push(result.data?.redirectTo ?? "/dashboard/invoices");
            router.refresh();
          })
        }
      >
        {isPending ? "Converting..." : "Convert to invoice"}
      </Button>
      <StatusBanner message={message} />
    </div>
  );
}
