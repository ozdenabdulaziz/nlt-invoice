import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { BrandMark } from "@/components/shared/brand-mark";
import { PageHeader } from "@/components/shared/page-header";
import { getAuthenticatedHomePath } from "@/lib/auth/redirects";
import { getCurrentSession } from "@/lib/auth/session";

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getCurrentSession();

  if (session?.user?.id) {
    redirect(getAuthenticatedHomePath(session.user.hasCompletedOnboarding));
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full gap-10 lg:grid-cols-[0.92fr,1.08fr]">
        <section className="rounded-[2.5rem] border border-border/70 bg-card/90 px-6 py-8 shadow-[0_36px_100px_-58px_rgba(15,23,42,0.55)] backdrop-blur md:px-8">
          <div className="space-y-6">
            <BrandMark />
            <PageHeader
              eyebrow="Protected foundation"
              title="Auth is narrow on purpose."
              description="Phase 1 focuses on credentials auth, JWT sessions, and a mandatory onboarding flow. Password reset, social auth, and team roles stay out until later."
            />
            <div className="grid gap-4">
              {[
                "Auth.js uses credentials login with JWT sessions and cookie auth.",
                "Registration creates the user only. Company, membership, and subscription are created in onboarding.",
                "Protected dashboard routes stay gated until onboarding is complete.",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[1.75rem] border border-border/70 bg-background/80 px-4 py-4 text-sm leading-6 text-muted-foreground"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
        <section>{children}</section>
      </div>
    </div>
  );
}
