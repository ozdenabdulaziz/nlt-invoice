import Link from "next/link";
import { BadgeCheck, Building2, ShieldCheck } from "lucide-react";

import { RegisterForm } from "@/components/forms/auth/register-form";

const benefits = [
  {
    label: "No credit card required",
    Icon: BadgeCheck,
  },
  {
    label: "Secure authentication",
    Icon: ShieldCheck,
  },
  {
    label: "Built for small businesses",
    Icon: Building2,
  },
];

export default function RegisterPage() {
  return (
    <div className="space-y-10">
      <RegisterForm />
      <div className="grid gap-7 pt-1 md:grid-cols-2 md:items-start">
        <div className="md:pt-1">
          <p className="text-left text-sm text-muted-foreground md:text-[0.95rem]">
            Already using NLT Invoice?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
        <div className="space-y-3 md:justify-self-end md:text-right">
          {benefits.map(({ label, Icon }) => (
            <div
              key={label}
              className="flex items-center gap-2.5 text-sm text-muted-foreground md:justify-end"
            >
              <Icon className="size-4 shrink-0 text-primary/85" aria-hidden="true" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-border/60 pt-6 text-center">
        <p className="text-lg font-medium tracking-tight text-foreground/90">
          Send your first invoice in minutes, not hours.
        </p>
      </div>
    </div>
  );
}
