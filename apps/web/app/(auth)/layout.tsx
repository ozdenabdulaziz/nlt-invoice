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
    <div className="mx-auto flex min-h-screen w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex w-full flex-col gap-9">
        <div className="grid w-full items-start gap-8 lg:grid-cols-[0.92fr,1.08fr] lg:gap-10">
          <section className="rounded-[2.5rem] border border-border/70 bg-card/90 px-6 py-8 shadow-[0_36px_100px_-58px_rgba(15,23,42,0.55)] backdrop-blur md:px-8">
            <div className="space-y-6">
              <BrandMark />
              <PageHeader
                eyebrow="Get started"
                title="Start invoicing in minutes."
                description="Create your account once, then send clean invoices and estimates without setup friction."
              />
              <div className="grid gap-3">
                {[
                  "Simple setup built for small businesses.",
                  "No credit card required to create your account.",
                  "Clear onboarding so you can send your first invoice fast.",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.25rem] border border-border/65 bg-background/80 px-4 py-3 text-sm leading-6 text-muted-foreground"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </section>
          <section className="mx-auto w-full max-w-xl">{children}</section>
        </div>
        <section className="mx-auto w-full max-w-2xl rounded-[1.75rem] border border-border/70 bg-card/70 px-6 py-6 text-center shadow-[0_30px_80px_-60px_rgba(15,23,42,0.55)] backdrop-blur">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Secure and reliable
          </h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
            {[
              "Your data is securely protected",
              "We use modern authentication standards",
              "Your account stays safe at all times",
            ].map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
