import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

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
  const { token } = await searchParams;

  if (!token || typeof token !== "string") {
    return (
      <div className="mx-auto mt-10 w-full max-w-lg space-y-5 rounded-lg border border-border bg-card p-8 text-center shadow-sm">
        <XCircle className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="text-xl font-semibold tracking-tight">Invalid Verification Link</h1>
        <p className="text-muted-foreground">
          This email verification link is invalid or missing.
        </p>
        <div className="pt-4">
          <Link href="/login" className="text-sm font-medium text-primary hover:underline">
            Return to login
          </Link>
        </div>
      </div>
    );
  }

  const result = await verifyEmailAction(token);

  if (!result.success) {
    return (
      <div className="mx-auto mt-10 w-full max-w-lg space-y-5 rounded-lg border border-border bg-card p-8 text-center shadow-sm">
        <XCircle className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="text-xl font-semibold tracking-tight">Verification Failed</h1>
        <p className="text-muted-foreground">{result.message}</p>
        <div className="pt-4">
          <Link href="/login" className="text-sm font-medium text-primary hover:underline">
            Return to login
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
        Your email address has been successfully verified.
      </p>
      <div className="pt-4">
        <Link href="/login" className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
          Log in to continue
        </Link>
      </div>
    </div>
  );
}
