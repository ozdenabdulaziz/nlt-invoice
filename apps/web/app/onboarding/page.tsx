import { redirect } from "next/navigation";

import { CompanySetupForm } from "@/components/forms/company/company-setup-form";
import { PageHeader } from "@/components/shared/page-header";
import { getCurrentUserContext } from "@/lib/auth/session";

export default async function OnboardingPage() {
  const context = await getCurrentUserContext();

  if (context.hasCompletedOnboarding) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full gap-10 lg:grid-cols-[0.92fr,1.08fr]">
        <section className="rounded-[2.5rem] border border-border/70 bg-card px-6 py-8 shadow-[0_36px_100px_-58px_rgba(15,23,42,0.55)] md:px-8">
          <PageHeader
            eyebrow="Company onboarding"
            title="Set up the company once and unlock the dashboard."
            description="Onboarding creates the company, membership, numbering sequence defaults, and Free subscription in a single step."
          />
        </section>
        <section>
          <CompanySetupForm
            eyebrow="Onboarding"
            title="Create your company profile"
            defaultValues={{
              companyName: "",
              legalName: "",
              email: context.user.email,
              phone: "",
              website: "",
              addressLine1: "",
              addressLine2: "",
              city: "",
              province: "",
              postalCode: "",
              country: "Canada",
              taxNumber: "",
              currency: "CAD",
            }}
          />
        </section>
      </div>
    </div>
  );
}
