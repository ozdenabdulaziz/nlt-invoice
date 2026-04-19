export const dynamic = "force-dynamic";

import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

import { getCurrentSession } from "@/lib/auth/session";
import { verifyEmailAction } from "@/server/actions/auth";

export const metadata = {
  title: "Verify Email | NLT Invoice",
  description: "Verify your email address.",
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  let token: string | undefined;
  try {
    const sp = await searchParams;
    token = typeof sp?.token === "string" ? sp.token : undefined;
  } catch (err) {
    console.error("[VerifyEmailPage] Error parsing searchParams:", err);
  }

  let session: Awaited<ReturnType<typeof getCurrentSession>> | null = null;
  try {
    session = await getCurrentSession();
  } catch (err) {
    console.error("[VerifyEmailPage] Error getting session:", err);
  }

  const isAuthenticated = Boolean(session?.user?.id);

  if (!token) {
    return (
      <div className="mx-auto mt-10 w-full max-w-lg space-y-5 rounded-lg border border-border bg-card p-8 text-center shadow-sm">
        <XCircle className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="text-xl font-semibold tracking-tight">Invalid Verification Link</h1>
        <p className="text-muted-foreground">
          This verification link is missing or malformed.
        </p>
        <div className="pt-4">
          <Link href="/login" className="text-sm font-medium text-primary hover:underline">
            Return to login
          </Link>
        </div>
      </div>
    );
  }

  let result;
  try {
    result = await verifyEmailAction(token);
  } catch (err) {
    console.error("[VerifyEmailPage] Unexpected error executing verifyEmailAction:", err);
    result = { success: false, message: "A critical server error occurred during verification." };
  }
  const continueHref = isAuthenticated ? "/dashboard" : "/login?verified=success";
  const continueLabel = isAuthenticated ? "Continue to dashboard" : "Continue to sign in";

  if (!result.success) {
    return (
      <div className="mx-auto mt-10 w-full max-w-lg space-y-5 rounded-lg border border-border bg-card p-8 text-center shadow-sm">
        <XCircle className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="text-xl font-semibold tracking-tight">Verification Failed</h1>
        <p className="text-muted-foreground">{result.message}</p>
        <div className="pt-4 space-y-2">
          {isAuthenticated ? (
            <Link href="/dashboard/verify-email" className="block text-sm font-medium text-primary hover:underline">
              Request a new verification email
            </Link>
          ) : (
            <Link
              href="/login?callbackUrl=%2Fdashboard%2Fverify-email"
              className="block text-sm font-medium text-primary hover:underline"
            >
              Sign in to request a new verification email
            </Link>
          )}
          <Link href="/login" className="block text-sm font-medium text-primary hover:underline">
            Return to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-10 w-full max-w-lg space-y-5 rounded-lg border border-border bg-card p-8 text-center shadow-sm">
      <CheckCircle2 className="mx-auto h-12 w-12 text-success text-emerald-500" />
      <h1 className="text-xl font-semibold tracking-tight">Email Verified!</h1>
      <p className="text-muted-foreground">
        Your email address has been verified successfully.
      </p>
      <p className="text-sm text-muted-foreground">
        {isAuthenticated ? "Your access is now fully unlocked." : "You can now sign in and continue to your dashboard."}
      </p>
      <div className="pt-4">
        <Link href={continueHref} className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
          {continueLabel}
        </Link>
      </div>
    </div>
  );
}
