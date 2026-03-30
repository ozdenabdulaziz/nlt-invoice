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
    <header className="relative z-10">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <BrandMark />
        <nav className="hidden items-center gap-6 md:flex">
          {marketingLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className={buttonVariants({
              variant: "ghost",
              className: "hidden sm:inline-flex",
            })}
          >
            Log in
          </Link>
          <Link
            href="/register"
            className={buttonVariants({
              className: "rounded-full px-5",
            })}
          >
            Start free
          </Link>
        </div>
      </div>
    </header>
  );
}
