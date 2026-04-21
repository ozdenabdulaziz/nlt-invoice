import Link from "next/link";

import { BrandMark } from "@/components/shared/brand-mark";
import { buttonVariants } from "@nlt-invoice/ui";

const marketingLinks = [
  {
    href: "/features",
    label: "Features",
  },
  {
    href: "/pricing",
    label: "Pricing",
  },
  {
    href: "/support",
    label: "Support",
  },
];

export function SiteHeader() {
  return (
    <header className="relative z-30 pt-4 sm:pt-5">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 rounded-2xl border border-border/70 bg-card px-4 py-3 shadow-[0_24px_70px_-56px_rgba(15,23,42,0.45)] supports-[backdrop-filter]:bg-card sm:px-5">
          <BrandMark />
          <nav className="hidden items-center gap-8 md:flex">
          {marketingLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[0.96rem] font-semibold tracking-tight text-muted-foreground transition hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          </nav>
          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "hidden rounded-full px-5 text-[0.95rem] font-semibold sm:inline-flex",
              })}
            >
              Log in
            </Link>
            <Link
              href="/register"
              className={buttonVariants({
                size: "lg",
                className: "rounded-full px-6 text-[0.95rem] font-semibold",
              })}
            >
              Start free
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
