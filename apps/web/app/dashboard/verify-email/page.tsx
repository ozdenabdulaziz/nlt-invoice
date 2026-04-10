import Link from "next/link";
import { redirect } from "next/navigation";

import { requireCompanyContext } from "@/lib/auth/session";

export const metadata = {
  title: "Verify Email | Dashboard | NLT Invoice",
};

export default async function DashboardVerifyEmailPage() {
  const context = await requireCompanyContext({ allowUnverified: true });

  if (context.user.emailVerified) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Verify your email to continue</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          We sent a verification link to <span className="font-medium text-foreground">{context.user.email}</span>.
          Open that link to unlock full dashboard access.
        </p>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          If you did not receive the email, use the resend button above. For security, resend requests are
          limited to one request every 60 seconds.
        </p>
        <div className="mt-5">
          <Link href="/dashboard" className="text-sm font-medium text-primary hover:underline">
            I already verified my email, continue
          </Link>
        </div>
      </section>
    </div>
  );
}
