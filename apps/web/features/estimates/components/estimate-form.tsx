"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { DiscountType, EstimateStatus } from "@prisma/client";
import { useState, useTransition } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";

import { StatusBanner } from "@/components/shared/status-banner";
import {
  createEstimateAction,
  updateEstimateAction,
} from "@/features/estimates/server/actions";
import type { EstimateCustomerOption } from "@/features/estimates/server/queries";
import { calculateDocumentTotals, calculateLineTotal } from "@/lib/calculations";
import {
  estimateFormSchema,
  type EstimateFormInput,
} from "@/lib/validations/estimate";
import {
  Button,
  buttonVariants,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
} from "@nlt-invoice/ui";

type EstimateFormProps = {
  mode: "create" | "edit";
  estimateId?: string;
  customers: EstimateCustomerOption[];
  defaultValues: EstimateFormInput;
  cancelHref: string;
};

function createEmptyLineItem(sortOrder = 0) {
  return {
    name: "",
    description: "",
    quantity: 1,
    unitPrice: 0,
    taxRate: 0,
    sortOrder,
  };
}

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getDefaultIssueDate() {
  return new Date();
}

function getDefaultExpiryDate() {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 30);
  return expiryDate;
}

export function getEmptyEstimateFormValues(): EstimateFormInput {
  return {
    customerId: "",
    issueDate: formatDateInput(getDefaultIssueDate()),
    expiryDate: formatDateInput(getDefaultExpiryDate()),
    status: EstimateStatus.DRAFT,
    currency: "CAD",
    notes: "",
    terms: "",
    discountType: null,
    discountValue: undefined,
    items: [createEmptyLineItem()],
  };
}

export function mapEstimateToFormValues(estimate: {
  customerId: string;
  issueDate: Date;
  expiryDate: Date;
  status: EstimateStatus;
  currency: string;
  notes: string | null;
  terms: string | null;
  discountType: DiscountType | null;
  discountValue: { toString(): string } | null;
  items: Array<{
    name: string;
    description: string | null;
    quantity: { toString(): string };
    unitPrice: { toString(): string };
    taxRate: { toString(): string };
    sortOrder: number;
  }>;
}): EstimateFormInput {
  return {
    customerId: estimate.customerId,
    issueDate: formatDateInput(estimate.issueDate),
    expiryDate: formatDateInput(estimate.expiryDate),
    status: estimate.status,
    currency: estimate.currency,
    notes: estimate.notes ?? "",
    terms: estimate.terms ?? "",
    discountType: estimate.discountType,
    discountValue: estimate.discountValue
      ? Number(estimate.discountValue.toString())
      : undefined,
    items: estimate.items.map((item, index) => ({
      name: item.name,
      description: item.description ?? "",
      quantity: Number(item.quantity.toString()),
      unitPrice: Number(item.unitPrice.toString()),
      taxRate: Number(item.taxRate.toString()),
      sortOrder: item.sortOrder ?? index,
    })),
  };
}

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
  }).format(value);
}

function toRequiredNumber(value: string) {
  return value === "" ? Number.NaN : Number(value);
}

function toOptionalNumber(value: string) {
  return value === "" ? undefined : Number(value);
}

function toNullableDiscountType(value: string) {
  return value === "" ? null : (value as DiscountType);
}

export function EstimateForm({
  mode,
  estimateId,
  customers,
  defaultValues,
  cancelHref,
}: EstimateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string>();
  const form = useForm<EstimateFormInput>({
    resolver: zodResolver(estimateFormSchema),
    defaultValues,
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = useWatch({
    control: form.control,
    name: "items",
  }) ?? [];
  const watchedCurrency =
    useWatch({
      control: form.control,
      name: "currency",
    }) || "CAD";
  const watchedDiscountType = useWatch({
    control: form.control,
    name: "discountType",
  });
  const watchedDiscountValue = useWatch({
    control: form.control,
    name: "discountValue",
  });

  const previewTotals = calculateDocumentTotals({
    items: watchedItems.map((item) => ({
      quantity: Number.isFinite(item.quantity) ? item.quantity : 0,
      unitPrice: Number.isFinite(item.unitPrice) ? item.unitPrice : 0,
      taxRate: Number.isFinite(item.taxRate) ? item.taxRate : 0,
    })),
    discountType: watchedDiscountType ?? null,
    discountValue: watchedDiscountValue ?? null,
  });

  return (
    <Card className="border-border/70 bg-card/90 shadow-[0_35px_95px_-58px_rgba(15,23,42,0.55)] backdrop-blur">
      <CardHeader className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary/80">
          {mode === "create" ? "New estimate" : "Edit estimate"}
        </p>
        <CardTitle className="text-2xl tracking-tight">
          {mode === "create" ? "Estimate builder" : "Update estimate"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <StatusBanner message={message} />
        <StatusBanner message={successMessage} tone="success" />
        <form
          className="space-y-8"
          onSubmit={form.handleSubmit((values) =>
            startTransition(async () => {
              setMessage(undefined);
              setSuccessMessage(undefined);

              const result =
                mode === "create"
                  ? await createEstimateAction(values)
                  : await updateEstimateAction(estimateId ?? "", values);

              if (!result.success) {
                setMessage(result.message);

                if (result.fieldErrors) {
                  Object.entries(result.fieldErrors).forEach(([fieldName, errors]) => {
                    if (!errors?.length) {
                      return;
                    }

                    form.setError(fieldName as keyof EstimateFormInput, {
                      type: "server",
                      message: errors[0],
                    });
                  });
                }

                return;
              }

              setSuccessMessage(result.message);
              router.push(result.data?.redirectTo ?? "/dashboard/estimates");
              router.refresh();
            }),
          )}
        >
          <section className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="estimate-customer">Customer</Label>
              <select
                id="estimate-customer"
                className="flex h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                {...form.register("customerId")}
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.companyName
                      ? `${customer.name} · ${customer.companyName}`
                      : customer.name}
                  </option>
                ))}
              </select>
              <p className="text-sm text-destructive">
                {form.formState.errors.customerId?.message}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimate-issue-date">Issue date</Label>
              <Input id="estimate-issue-date" type="date" {...form.register("issueDate")} />
              <p className="text-sm text-destructive">
                {form.formState.errors.issueDate?.message}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimate-expiry-date">Expiry date</Label>
              <Input id="estimate-expiry-date" type="date" {...form.register("expiryDate")} />
              <p className="text-sm text-destructive">
                {form.formState.errors.expiryDate?.message}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimate-status">Status</Label>
              <select
                id="estimate-status"
                className="flex h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                {...form.register("status")}
              >
                {Object.values(EstimateStatus).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <p className="text-sm text-destructive">
                {form.formState.errors.status?.message}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimate-currency">Currency</Label>
              <Input id="estimate-currency" {...form.register("currency")} />
              <p className="text-sm text-destructive">
                {form.formState.errors.currency?.message}
              </p>
            </div>
          </section>

          <section className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Line items</h2>
                <p className="text-sm text-muted-foreground">
                  Keep it simple. Add the items you want to quote in this estimate.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => append(createEmptyLineItem(fields.length))}
              >
                Add line item
              </Button>
            </div>
            <div className="space-y-4">
              {fields.map((field, index) => {
                const lineItem = watchedItems[index];
                const lineTotal = calculateLineTotal(
                  Number.isFinite(lineItem?.quantity) ? lineItem.quantity : 0,
                  Number.isFinite(lineItem?.unitPrice) ? lineItem.unitPrice : 0,
                );

                return (
                  <Card key={field.id} className="border-border/70 bg-background/80">
                    <CardContent className="space-y-5 p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm font-medium text-foreground">
                          Line item {index + 1}
                        </p>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">
                            Line total: {formatCurrency(lineTotal, watchedCurrency)}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            className="rounded-full"
                            disabled={fields.length === 1}
                            onClick={() => remove(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>

                      <div className="grid gap-5 md:grid-cols-2">
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor={`estimate-item-name-${index}`}>Item name</Label>
                          <Input
                            id={`estimate-item-name-${index}`}
                            placeholder="Website design"
                            {...form.register(`items.${index}.name`)}
                          />
                          <p className="text-sm text-destructive">
                            {form.formState.errors.items?.[index]?.name?.message}
                          </p>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor={`estimate-item-description-${index}`}>Description</Label>
                          <Textarea
                            id={`estimate-item-description-${index}`}
                            placeholder="Short scope or deliverable details"
                            rows={3}
                            {...form.register(`items.${index}.description`)}
                          />
                          <p className="text-sm text-destructive">
                            {form.formState.errors.items?.[index]?.description?.message}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`estimate-item-quantity-${index}`}>Quantity</Label>
                          <Input
                            id={`estimate-item-quantity-${index}`}
                            type="number"
                            step="0.01"
                            {...form.register(`items.${index}.quantity`, {
                              setValueAs: toRequiredNumber,
                            })}
                          />
                          <p className="text-sm text-destructive">
                            {form.formState.errors.items?.[index]?.quantity?.message}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`estimate-item-unit-price-${index}`}>Unit price</Label>
                          <Input
                            id={`estimate-item-unit-price-${index}`}
                            type="number"
                            step="0.01"
                            {...form.register(`items.${index}.unitPrice`, {
                              setValueAs: toRequiredNumber,
                            })}
                          />
                          <p className="text-sm text-destructive">
                            {form.formState.errors.items?.[index]?.unitPrice?.message}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`estimate-item-tax-rate-${index}`}>Tax rate</Label>
                          <Input
                            id={`estimate-item-tax-rate-${index}`}
                            type="number"
                            step="0.01"
                            {...form.register(`items.${index}.taxRate`, {
                              setValueAs: toRequiredNumber,
                            })}
                          />
                          <p className="text-sm text-destructive">
                            {form.formState.errors.items?.[index]?.taxRate?.message}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1fr,0.9fr]">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="estimate-notes">Notes</Label>
                <Textarea
                  id="estimate-notes"
                  placeholder="Optional note for the customer"
                  rows={4}
                  {...form.register("notes")}
                />
                <p className="text-sm text-destructive">{form.formState.errors.notes?.message}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimate-terms">Terms</Label>
                <Textarea
                  id="estimate-terms"
                  placeholder="Payment terms or validity notes"
                  rows={4}
                  {...form.register("terms")}
                />
                <p className="text-sm text-destructive">{form.formState.errors.terms?.message}</p>
              </div>
            </div>

            <Card className="border-border/70 bg-background/80">
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="estimate-discount-type">Discount type</Label>
                  <select
                    id="estimate-discount-type"
                    className="flex h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    {...form.register("discountType", {
                      setValueAs: toNullableDiscountType,
                    })}
                  >
                    <option value="">No discount</option>
                    <option value={DiscountType.PERCENTAGE}>Percentage</option>
                    <option value={DiscountType.FIXED}>Fixed</option>
                  </select>
                  <p className="text-sm text-destructive">
                    {form.formState.errors.discountType?.message}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimate-discount-value">Discount value</Label>
                  <Input
                    id="estimate-discount-value"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    {...form.register("discountValue", {
                      setValueAs: toOptionalNumber,
                    })}
                  />
                  <p className="text-sm text-destructive">
                    {form.formState.errors.discountValue?.message}
                  </p>
                </div>

                <div className="space-y-3 rounded-2xl border border-border/70 bg-card px-4 py-4 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(previewTotals.subtotal, watchedCurrency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Tax total</span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(previewTotals.taxTotal, watchedCurrency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(previewTotals.discountTotal, watchedCurrency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-t border-border/70 pt-3">
                    <span className="font-medium text-foreground">Total</span>
                    <span className="text-lg font-semibold text-foreground">
                      {formatCurrency(previewTotals.total, watchedCurrency)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" className="rounded-full px-6" disabled={isPending}>
              {isPending
                ? mode === "create"
                  ? "Creating..."
                  : "Saving..."
                : mode === "create"
                  ? "Create estimate"
                  : "Save changes"}
            </Button>
            <Link
              href={cancelHref}
              className={buttonVariants({
                variant: "outline",
                className: "rounded-full px-6",
              })}
            >
              Cancel
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
