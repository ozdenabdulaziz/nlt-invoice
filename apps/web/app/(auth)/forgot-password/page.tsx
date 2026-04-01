import Link from "next/link";
import { ForgotPasswordForm } from "@/components/forms/auth/forgot-password-form";

export const metadata = {
  title: "Forgot Password | NLT Invoice",
  description: "Reset your NLT Invoice password to regain access to your account.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-5">
      <ForgotPasswordForm />
      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Log in
        </Link>
        .
      </p>
    </div>
  );
}
