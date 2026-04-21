import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { SiteHeader } from "@/components/marketing/site-header";
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
    <div className="relative min-h-screen bg-background">
      <div className="relative z-10">
        <SiteHeader />
        <main className="mx-auto w-full max-w-7xl px-4 pb-8 pt-5 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );

}
