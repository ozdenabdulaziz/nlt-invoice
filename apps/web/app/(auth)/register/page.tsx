import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { RegisterForm } from "@/components/forms/auth/register-form";
import { BrandMark } from "@/components/shared/brand-mark";

const benefits = [
  "Create invoices in minutes",
  "Track paid and unpaid invoices",
  "Built for Canadian businesses",
  "Keep your billing organized",
];

export default function RegisterPage() {
  return (
    <div className="grid w-full gap-6 lg:grid-cols-[1fr_1fr] lg:gap-10">
      <section className="rounded-[2.25rem] border border-border/70 bg-card/90 px-6 py-8 shadow-[0_36px_100px_-58px_rgba(15,23,42,0.55)] backdrop-blur sm:px-8 sm:py-9">
        <div className="space-y-8">
          <div className="space-y-6">
            <div className="flex items-center">
              <BrandMark />
            </div>
            <div className="space-y-3">
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary/80">Get started</p>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                Create your NLT Invoice account
              </h1>
              <p className="max-w-xl text-base leading-7 text-muted-foreground">
                Start sending professional invoices, tracking payments, and managing your business in one simple platform.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <RegisterForm />
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
                Log in
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[2.25rem] border border-border/70 bg-card/60 px-6 py-8 shadow-[0_30px_90px_-65px_rgba(15,23,42,0.55)] backdrop-blur sm:px-8 sm:py-9">
        <div className="flex h-full flex-col justify-between gap-8">
          <div className="space-y-5">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Why businesses choose NLT Invoice
            </h2>
            <ul className="space-y-3">
              {benefits.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm font-medium text-foreground/80">No credit card required</p>
          </div>

          <p className="text-sm font-medium leading-6 text-foreground/80">
            Less admin. Faster payments. More focus on your business.
          </p>
        </div>
      </section>
    </div>
  );
}
