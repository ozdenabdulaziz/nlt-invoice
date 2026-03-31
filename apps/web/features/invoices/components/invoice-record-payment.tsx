"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { StatusBanner } from "@/components/shared/status-banner";
import { recordInvoicePaymentAction } from "@/features/invoices/server/actions";
import { InvoiceStatus } from "@/lib/constants/enums";
import { Button, Card, CardContent, CardHeader, CardTitle, Label, Textarea } from "@nlt-invoice/ui";

function formatCurrency(value: string | number, currency: string) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
  }).format(Number(value));
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function InvoiceRecordPayment({
  invoiceId,
  status,
  currency,
  balanceDue,
  paidAt,
  paymentMethod,
  paymentNote,
}: {
  invoiceId: string;
  status: InvoiceStatus;
  currency: string;
  balanceDue: string;
  paidAt?: string | null;
  paymentMethod?: string | null;
  paymentNote?: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>();
  const [paymentMethodValue, setPaymentMethodValue] = useState(paymentMethod ?? "");
  const [paymentNoteValue, setPaymentNoteValue] = useState(paymentNote ?? "");
  const remainingBalance = Number(balanceDue);
  const isPaid = status === InvoiceStatus.PAID || remainingBalance <= 0;
  const canRecordPayment = !isPaid && status !== InvoiceStatus.VOID;

  if (!canRecordPayment) {
    return (
      <Card className="border-border/70 bg-card/90">
        <CardHeader>
          <CardTitle>Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            {isPaid
              ? "This invoice is marked as paid."
              : "Void invoices cannot be marked as paid."}
          </p>
          {paidAt ? <p>Paid on {formatDate(new Date(paidAt))}.</p> : null}
          {paymentMethod ? <p>Method: {paymentMethod}</p> : null}
          {paymentNote ? <p>Note: {paymentNote}</p> : null}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/70 bg-card/90">
      <CardHeader>
        <CardTitle>Record payment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Mark the remaining balance of {formatCurrency(remainingBalance, currency)} as paid.
        </p>
        <StatusBanner message={message} />
        <div className="space-y-2">
          <Label htmlFor="invoice-payment-method">Payment method</Label>
          <select
            id="invoice-payment-method"
            className="flex h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            value={paymentMethodValue}
            onChange={(event) => setPaymentMethodValue(event.target.value)}
          >
            <option value="">Select a method</option>
            <option value="Bank transfer">Bank transfer</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="Cheque">Cheque</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="invoice-payment-note">Payment note</Label>
          <Textarea
            id="invoice-payment-note"
            rows={3}
            placeholder="Optional internal note"
            value={paymentNoteValue}
            onChange={(event) => setPaymentNoteValue(event.target.value)}
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          className="rounded-full px-6"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              setMessage(undefined);

              const result = await recordInvoicePaymentAction(invoiceId, {
                paymentMethod: paymentMethodValue,
                paymentNote: paymentNoteValue,
              });

              if (!result.success) {
                setMessage(result.message);
                return;
              }

              router.push(result.data?.redirectTo ?? `/dashboard/invoices/${invoiceId}`);
              router.refresh();
            })
          }
        >
          {isPending ? "Recording..." : "Mark as paid"}
        </Button>
      </CardContent>
    </Card>
  );
}
