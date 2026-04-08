import Link from "next/link";

import { RegisterForm } from "@/components/forms/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="space-y-8">
      <RegisterForm />
      <p className="pt-1 text-center text-base text-muted-foreground">
        Already using NLT Invoice?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
