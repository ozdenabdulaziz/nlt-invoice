import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

import { verifyEmailAction } from "@/server/actions/auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Verify Email | NLT Invoice",
  description: "Verify your email address.",
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const token =
    typeof searchParams?.token === "string"
      ? searchParams.token
      : undefined;

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
    console.error("VERIFY EMAIL ERROR:", err);
    return (
      <div className="mx-auto mt-10 w-full max-w-lg space-y-5 rounded-lg border border-border bg-card p-8 text-center shadow-sm">
        <XCircle className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="text-xl font-semibold tracking-tight">Verification Error</h1>
        <p className="text-muted-foreground">
          Something went wrong during verification.
        </p>
        <div className="pt-4 space-y-2">
          <Link href="/login" className="block text-sm font-medium text-primary hover:underline">
            Return to sign in
          </Link>
        </div>
      </div>
    );
  }

  if (!result?.success) {
    return (
      <div className="mx-auto mt-10 w-full max-w-lg space-y-5 rounded-lg border border-border bg-card p-8 text-center shadow-sm">
        <XCircle className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="text-xl font-semibold tracking-tight">Verification Failed</h1>
        <p className="text-muted-foreground">
          {result.message || "Verification failed or token expired."}
        </p>
        <div className="pt-4 space-y-2">
          <Link
            href="/login?callbackUrl=%2Fdashboard%2Fverify-email"
            className="block text-sm font-medium text-primary hover:underline"
          >
            Sign in to request a new verification email
          </Link>
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
        You can now sign in and continue to your dashboard.
      </p>
      <div className="pt-4">
        <Link href="/login?verified=success" className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
          Continue to sign in
        </Link>
      </div>
    </div>
  );
}

