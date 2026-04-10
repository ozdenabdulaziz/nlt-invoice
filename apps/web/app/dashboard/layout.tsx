import type { ReactNode } from "react";

import { AppHeaderSlot } from "@/components/app-shell/app-header-slot";
import { AppSidebar } from "@/components/app-shell/app-sidebar";
import { EmailVerificationBanner } from "@/components/app-shell/email-verification-banner";
import { requireCompanyContext } from "@/lib/auth/session";

export default async function ProtectedAppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const context = await requireCompanyContext({ allowUnverified: true });

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:gap-6 lg:px-8">
      <AppSidebar
        plan={context.subscription.plan}
        companyName={context.company.companyName}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <AppHeaderSlot
          userName={context.user.name}
          companyName={context.company.companyName}
          hasCompletedOnboarding={context.hasCompletedOnboarding}
        />
        {!context.user.emailVerified && <EmailVerificationBanner email={context.user.email} />}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
