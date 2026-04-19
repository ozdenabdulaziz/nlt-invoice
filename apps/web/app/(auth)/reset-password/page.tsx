import Link from "next/link";
import { ResetPasswordForm } from "@/components/forms/auth/reset-password-form";

export const metadata = {
  title: "Set New Password | NLT Invoice",
  description: "Set a new password for your NLT Invoice account.",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const token = typeof searchParams?.token === "string" ? searchParams.token : undefined;

  if (!token || typeof token !== "string") {
    return (
      <div className="mx-auto w-full max-w-md space-y-5 text-center">
        <div className="rounded-md bg-destructive/15 p-4 text-destructive border border-destructive/20">
          <p className="font-medium">Invalid or missing reset token.</p>
        </div>
        <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
          Request a new password reset link
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-5">
      <ResetPasswordForm token={token} />
    </div>
  );
}
