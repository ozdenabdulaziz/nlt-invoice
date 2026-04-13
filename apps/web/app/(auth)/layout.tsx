import type { ReactNode } from "react";
import { redirect } from "next/navigation";

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
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_hsl(var(--muted))/0.55,_hsl(var(--background))_62%)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,hsl(var(--primary))/0.04_0%,transparent_34%,hsl(var(--primary))/0.06_100%)]" />
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
