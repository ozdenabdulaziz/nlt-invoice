"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { StatusBanner } from "@/components/shared/status-banner";
import { Button } from "@nlt-invoice/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@nlt-invoice/ui";
import { Input } from "@nlt-invoice/ui";
import { Label } from "@nlt-invoice/ui";
import {
  companySetupSchema,
  type CompanySetupInput,
} from "@/lib/validations/company";
import { saveCompanyProfileAction } from "@/server/actions/company";

export function CompanySetupForm({
  defaultValues,
  eyebrow = "Required onboarding",
  title = "Complete your company profile",
  submitLabel = "Save and continue",
  redirectTo = "/dashboard",
}: {
  defaultValues: CompanySetupInput;
  eyebrow?: string;
  title?: string;
  submitLabel?: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const { update } = useSession();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string>();
  const form = useForm<CompanySetupInput>({
    resolver: zodResolver(companySetupSchema),
    defaultValues,
  });

  const logoUrl = form.watch("logoUrl");

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        setMessage("Logo size should be less than 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue("logoUrl", reader.result as string, { shouldDirty: true });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className="border-border/70 bg-card/85 shadow-[0_35px_95px_-58px_rgba(15,23,42,0.55)] backdrop-blur">
      <CardHeader className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary/80">
          {eyebrow}
        </p>
        <CardTitle className="text-2xl tracking-tight">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <StatusBanner message={message} />
        <StatusBanner message={successMessage} tone="success" />
        <form
          className="space-y-6"
          onSubmit={form.handleSubmit((values) =>
            startTransition(async () => {
              setMessage(undefined);
              setSuccessMessage(undefined);

              const result = await saveCompanyProfileAction(values);

              if (!result.success) {
                setMessage(result.message);
                const fieldErrors = result.fieldErrors;

                if (fieldErrors) {
                  Object.entries(fieldErrors).forEach(([fieldName, errors]) => {
                    if (!errors?.length) {
                      return;
                    }

                    form.setError(fieldName as keyof CompanySetupInput, {
                      type: "server",
                      message: errors[0],
                    });
                  });
                }

                return;
              }

              setSuccessMessage(result.message);
              if (result.data?.auth) {
                await update(result.data.auth);
              }
              router.push(result.data?.redirectTo ?? redirectTo);
              router.refresh();
            }),
          )}
        >
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="relative h-24 w-24 overflow-hidden rounded-full border border-border bg-muted">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                  No Logo
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo-upload">Company Logo</Label>
              <Input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="max-w-xs"
              />
              <p className="text-xs text-muted-foreground">
                Square logo (e.g. 256x256), max 1MB.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="company-name">Company name</Label>
              <Input id="company-name" placeholder="NLT Services Inc." {...form.register("companyName")} />
              <p className="text-sm text-destructive">
                {form.formState.errors.companyName?.message}
              </p>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="company-legal-name">Legal name</Label>
              <Input
                id="company-legal-name"
                placeholder="NLT Services Incorporated"
                {...form.register("legalName")}
              />
              <p className="text-sm text-destructive">
                {form.formState.errors.legalName?.message}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-email">Company email</Label>
              <Input id="company-email" type="email" placeholder="billing@nltinvoice.com" {...form.register("email")} />
              <p className="text-sm text-destructive">{form.formState.errors.email?.message}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-phone">Phone</Label>
              <Input id="company-phone" placeholder="+1 (555) 123-4567" {...form.register("phone")} />
              <p className="text-sm text-destructive">{form.formState.errors.phone?.message}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-website">Website</Label>
              <Input id="company-website" placeholder="https://nltinvoice.com" {...form.register("website")} />
              <p className="text-sm text-destructive">{form.formState.errors.website?.message}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-currency">Default currency</Label>
              <select
                id="company-currency"
                className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
                {...form.register("currency")}
              >
                <option value="CAD">CAD - Canadian Dollar</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
              </select>
              <p className="text-sm text-destructive">
                {form.formState.errors.currency?.message}
              </p>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="company-address-1">Address line 1</Label>
              <Input id="company-address-1" placeholder="123 Front Street West" {...form.register("addressLine1")} />
              <p className="text-sm text-destructive">
                {form.formState.errors.addressLine1?.message}
              </p>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="company-address-2">Address line 2</Label>
              <Input id="company-address-2" placeholder="Suite 800" {...form.register("addressLine2")} />
              <p className="text-sm text-destructive">
                {form.formState.errors.addressLine2?.message}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-city">City</Label>
              <Input id="company-city" placeholder="Toronto" {...form.register("city")} />
              <p className="text-sm text-destructive">{form.formState.errors.city?.message}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-province">Province</Label>
              <Input id="company-province" placeholder="Ontario" {...form.register("province")} />
              <p className="text-sm text-destructive">
                {form.formState.errors.province?.message}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-postal-code">Postal code</Label>
              <Input id="company-postal-code" placeholder="M5J 2N8" {...form.register("postalCode")} />
              <p className="text-sm text-destructive">
                {form.formState.errors.postalCode?.message}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-country">Country</Label>
              <Input id="company-country" placeholder="Canada" {...form.register("country")} />
              <p className="text-sm text-destructive">
                {form.formState.errors.country?.message}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-tax-number">Tax number</Label>
              <Input id="company-tax-number" placeholder="123456789 RT0001" {...form.register("taxNumber")} />
              <p className="text-sm text-destructive">
                {form.formState.errors.taxNumber?.message}
              </p>
            </div>
          </div>
          <Button type="submit" className="rounded-full px-6" disabled={isPending}>
            {isPending ? "Saving company profile..." : submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
