import type { ReactNode } from "react";

import { AppHeader } from "@/components/app-shell/app-header";
import { AppSidebar } from "@/components/app-shell/app-sidebar";
import { EmailVerificationBanner } from "@/components/app-shell/email-verification-banner";
import { requireCompanyContext } from "@/lib/auth/session";

export default async function ProtectedAppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const context = await requireCompanyContext();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-6 px-4 py-4 sm:px-6 lg:flex-row lg:px-8">
      <AppSidebar plan={context.subscription.plan} />
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <AppHeader
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
