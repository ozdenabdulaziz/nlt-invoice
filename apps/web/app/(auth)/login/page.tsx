import Link from "next/link";

import { LoginForm } from "@/components/forms/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; reset?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const callbackUrl =
    typeof resolvedSearchParams.callbackUrl === "string"
      ? resolvedSearchParams.callbackUrl
      : "/dashboard";
  const resetSuccess = resolvedSearchParams.reset === "success";

  return (
    <div className="mx-auto w-full max-w-md space-y-5">
      <LoginForm callbackUrl={callbackUrl} resetSuccess={resetSuccess} />
      <p className="text-center text-sm text-muted-foreground">
        Need an account?{" "}
        <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
          Create one
        </Link>
        .
      </p>
    </div>
  );
}
