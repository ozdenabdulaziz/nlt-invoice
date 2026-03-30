import { CompanySetupForm } from "@/components/forms/company/company-setup-form";
import { PageHeader } from "@/components/shared/page-header";
import { requireCompanyContext } from "@/lib/auth/session";

export default async function SettingsPage() {
  const context = await requireCompanyContext();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Settings"
        title="Manage company profile and document defaults."
        description="This page keeps company details editable after onboarding and preserves the same data source that powers invoices and estimates."
      />
      <CompanySetupForm
        eyebrow="Company settings"
        title="Business details"
        submitLabel="Save settings"
        defaultValues={{
          companyName: context.company.companyName ?? "",
          legalName: context.company.legalName ?? "",
          email: context.company.email ?? context.user.email,
          phone: context.company.phone ?? "",
          website: context.company.website ?? "",
          addressLine1: context.company.addressLine1 ?? "",
          addressLine2: context.company.addressLine2 ?? "",
          city: context.company.city ?? "",
          province: context.company.province ?? "",
          postalCode: context.company.postalCode ?? "",
          country: context.company.country ?? "Canada",
          taxNumber: context.company.taxNumber ?? "",
          currency: context.company.currency,
        }}
      />
    </div>
  );
}
