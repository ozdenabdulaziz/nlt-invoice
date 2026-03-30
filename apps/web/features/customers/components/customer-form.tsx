"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { CustomerType } from "@prisma/client";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { StatusBanner } from "@/components/shared/status-banner";
import {
  createCustomerAction,
  updateCustomerAction,
} from "@/features/customers/server/actions";
import {
  customerSchema,
  type CustomerInput,
} from "@/lib/validations/customer";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
  buttonVariants,
} from "@nlt-invoice/ui";

type CustomerFormProps = {
  mode: "create" | "edit";
  customerId?: string;
  defaultValues: CustomerInput;
  cancelHref: string;
};

export function getEmptyCustomerFormValues(): CustomerInput {
  return {
    type: CustomerType.BUSINESS,
    name: "",
    companyName: "",
    email: "",
    phone: "",
    billingAddressLine1: "",
    billingAddressLine2: "",
    billingCity: "",
    billingProvince: "",
    billingPostalCode: "",
    billingCountry: "Canada",
    shippingSameAsBilling: true,
    shippingAddressLine1: "",
    shippingAddressLine2: "",
    shippingCity: "",
    shippingProvince: "",
    shippingPostalCode: "",
    shippingCountry: "Canada",
    notes: "",
  };
}

export function mapCustomerToFormValues(customer: {
  type: CustomerType;
  name: string;
  companyName: string | null;
  email: string | null;
  phone: string | null;
  billingAddressLine1: string | null;
  billingAddressLine2: string | null;
  billingCity: string | null;
  billingProvince: string | null;
  billingPostalCode: string | null;
  billingCountry: string | null;
  shippingSameAsBilling: boolean;
  shippingAddressLine1: string | null;
  shippingAddressLine2: string | null;
  shippingCity: string | null;
  shippingProvince: string | null;
  shippingPostalCode: string | null;
  shippingCountry: string | null;
  notes: string | null;
}): CustomerInput {
  return {
    type: customer.type,
    name: customer.name,
    companyName: customer.companyName ?? "",
    email: customer.email ?? "",
    phone: customer.phone ?? "",
    billingAddressLine1: customer.billingAddressLine1 ?? "",
    billingAddressLine2: customer.billingAddressLine2 ?? "",
    billingCity: customer.billingCity ?? "",
    billingProvince: customer.billingProvince ?? "",
    billingPostalCode: customer.billingPostalCode ?? "",
    billingCountry: customer.billingCountry ?? "Canada",
    shippingSameAsBilling: customer.shippingSameAsBilling,
    shippingAddressLine1: customer.shippingAddressLine1 ?? "",
    shippingAddressLine2: customer.shippingAddressLine2 ?? "",
    shippingCity: customer.shippingCity ?? "",
    shippingProvince: customer.shippingProvince ?? "",
    shippingPostalCode: customer.shippingPostalCode ?? "",
    shippingCountry: customer.shippingCountry ?? "Canada",
    notes: customer.notes ?? "",
  };
}

export function CustomerForm({
  mode,
  customerId,
  defaultValues,
  cancelHref,
}: CustomerFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string>();
  const form = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues,
  });

  const shippingSameAsBilling = form.watch("shippingSameAsBilling");

  return (
    <Card className="border-border/70 bg-card/90 shadow-[0_35px_95px_-58px_rgba(15,23,42,0.55)] backdrop-blur">
      <CardHeader className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary/80">
          {mode === "create" ? "New customer" : "Edit customer"}
        </p>
        <CardTitle className="text-2xl tracking-tight">
          {mode === "create"
            ? "Customer information"
            : "Update customer information"}
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
                  ? await createCustomerAction(values)
                  : await updateCustomerAction(customerId ?? "", values);

              if (!result.success) {
                setMessage(result.message);

                if (result.fieldErrors) {
                  Object.entries(result.fieldErrors).forEach(([fieldName, errors]) => {
                    if (!errors?.length) {
                      return;
                    }

                    form.setError(fieldName as keyof CustomerInput, {
                      type: "server",
                      message: errors[0],
                    });
                  });
                }

                return;
              }

              setSuccessMessage(result.message);
              router.push(result.data?.redirectTo ?? "/dashboard/customers");
              router.refresh();
            }),
          )}
        >
          <section className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customer-type">Customer type</Label>
              <select
                id="customer-type"
                className="flex h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                {...form.register("type")}
              >
                <option value={CustomerType.BUSINESS}>Business</option>
                <option value={CustomerType.INDIVIDUAL}>Individual</option>
              </select>
              <p className="text-sm text-destructive">{form.formState.errors.type?.message}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-name">Customer name</Label>
              <Input
                id="customer-name"
                placeholder="Jordan Lee"
                {...form.register("name")}
              />
              <p className="text-sm text-destructive">{form.formState.errors.name?.message}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-company-name">Company name</Label>
              <Input
                id="customer-company-name"
                placeholder="Maple Studio Ltd."
                {...form.register("companyName")}
              />
              <p className="text-sm text-destructive">
                {form.formState.errors.companyName?.message}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-email">Email</Label>
              <Input
                id="customer-email"
                type="email"
                placeholder="billing@maplestudio.ca"
                {...form.register("email")}
              />
              <p className="text-sm text-destructive">{form.formState.errors.email?.message}</p>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="customer-phone">Phone</Label>
              <Input
                id="customer-phone"
                placeholder="+1 (555) 123-4567"
                {...form.register("phone")}
              />
              <p className="text-sm text-destructive">{form.formState.errors.phone?.message}</p>
            </div>
          </section>

          <section className="space-y-5">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Billing address</h2>
              <p className="text-sm text-muted-foreground">
                This address appears on invoices and estimates.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="billing-address-line-1">Address line 1</Label>
                <Input
                  id="billing-address-line-1"
                  placeholder="123 Front Street West"
                  {...form.register("billingAddressLine1")}
                />
                <p className="text-sm text-destructive">
                  {form.formState.errors.billingAddressLine1?.message}
                </p>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="billing-address-line-2">Address line 2</Label>
                <Input
                  id="billing-address-line-2"
                  placeholder="Suite 800"
                  {...form.register("billingAddressLine2")}
                />
                <p className="text-sm text-destructive">
                  {form.formState.errors.billingAddressLine2?.message}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="billing-city">City</Label>
                <Input id="billing-city" placeholder="Toronto" {...form.register("billingCity")} />
                <p className="text-sm text-destructive">
                  {form.formState.errors.billingCity?.message}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="billing-province">Province</Label>
                <Input
                  id="billing-province"
                  placeholder="Ontario"
                  {...form.register("billingProvince")}
                />
                <p className="text-sm text-destructive">
                  {form.formState.errors.billingProvince?.message}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="billing-postal-code">Postal code</Label>
                <Input
                  id="billing-postal-code"
                  placeholder="M5J 2N8"
                  {...form.register("billingPostalCode")}
                />
                <p className="text-sm text-destructive">
                  {form.formState.errors.billingPostalCode?.message}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="billing-country">Country</Label>
                <Input
                  id="billing-country"
                  placeholder="Canada"
                  {...form.register("billingCountry")}
                />
                <p className="text-sm text-destructive">
                  {form.formState.errors.billingCountry?.message}
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-5">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Shipping address</h2>
              <p className="text-sm text-muted-foreground">
                Use a separate shipping address when goods are delivered somewhere else.
              </p>
            </div>
            <label className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm text-foreground">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border border-border"
                {...form.register("shippingSameAsBilling")}
              />
              <span>
                Shipping address is the same as the billing address
              </span>
            </label>

            {!shippingSameAsBilling ? (
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="shipping-address-line-1">Address line 1</Label>
                  <Input
                    id="shipping-address-line-1"
                    placeholder="45 King Street East"
                    {...form.register("shippingAddressLine1")}
                  />
                  <p className="text-sm text-destructive">
                    {form.formState.errors.shippingAddressLine1?.message}
                  </p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="shipping-address-line-2">Address line 2</Label>
                  <Input
                    id="shipping-address-line-2"
                    placeholder="Warehouse 2"
                    {...form.register("shippingAddressLine2")}
                  />
                  <p className="text-sm text-destructive">
                    {form.formState.errors.shippingAddressLine2?.message}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipping-city">City</Label>
                  <Input
                    id="shipping-city"
                    placeholder="Toronto"
                    {...form.register("shippingCity")}
                  />
                  <p className="text-sm text-destructive">
                    {form.formState.errors.shippingCity?.message}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipping-province">Province</Label>
                  <Input
                    id="shipping-province"
                    placeholder="Ontario"
                    {...form.register("shippingProvince")}
                  />
                  <p className="text-sm text-destructive">
                    {form.formState.errors.shippingProvince?.message}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipping-postal-code">Postal code</Label>
                  <Input
                    id="shipping-postal-code"
                    placeholder="M5J 2N8"
                    {...form.register("shippingPostalCode")}
                  />
                  <p className="text-sm text-destructive">
                    {form.formState.errors.shippingPostalCode?.message}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipping-country">Country</Label>
                  <Input
                    id="shipping-country"
                    placeholder="Canada"
                    {...form.register("shippingCountry")}
                  />
                  <p className="text-sm text-destructive">
                    {form.formState.errors.shippingCountry?.message}
                  </p>
                </div>
              </div>
            ) : null}
          </section>

          <section className="space-y-2">
            <Label htmlFor="customer-notes">Notes</Label>
            <Textarea
              id="customer-notes"
              placeholder="Internal notes, delivery preferences, or contact reminders."
              rows={5}
              {...form.register("notes")}
            />
            <p className="text-sm text-destructive">{form.formState.errors.notes?.message}</p>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button type="submit" className="rounded-full px-6" disabled={isPending}>
              {isPending
                ? mode === "create"
                  ? "Creating customer..."
                  : "Saving changes..."
                : mode === "create"
                  ? "Create customer"
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
