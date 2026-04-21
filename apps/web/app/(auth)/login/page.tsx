import Link from "next/link";

import { LoginForm } from "@/components/forms/auth/login-form";
import { BrandMark } from "@/components/shared/brand-mark";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; reset?: string; verified?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const callbackUrl =
    typeof resolvedSearchParams.callbackUrl === "string"
      ? resolvedSearchParams.callbackUrl
      : "/dashboard";
  const resetSuccess = resolvedSearchParams.reset === "success";
  const verifiedSuccess = resolvedSearchParams.verified === "success";

  return (
    <div className="mx-auto w-full max-w-[680px] py-5 sm:py-7">
      <section className="relative overflow-hidden rounded-[1.9rem] border border-border/70 bg-card p-5 shadow-[0_52px_120px_-78px_rgba(15,23,42,0.55)] sm:p-7">
        <div className="relative space-y-5">
          <div className="space-y-4">
            <BrandMark className="origin-left scale-110 sm:scale-[1.18]" />
            <div className="rounded-xl border border-border/70 bg-background/82 px-4 py-3">
              <p className="text-sm font-medium text-foreground/80">
                Trusted by small businesses across Canada
              </p>
            </div>
          </div>

          <LoginForm
            callbackUrl={callbackUrl}
            resetSuccess={resetSuccess}
            verifiedSuccess={verifiedSuccess}
          />

          <p className="text-sm text-muted-foreground">
            Need an account?{" "}
            <Link href="/register" className="font-semibold text-primary underline-offset-4 hover:underline">
              Create one
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
