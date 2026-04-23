"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type NavLinkProps = {
  href: string;
  label: string;
};

export function NavLink({ href, label }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;
  const isParentActive = !isActive && href !== "/dashboard" && pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center rounded-xl px-4 py-2.5 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isActive
          ? "border border-primary/30 bg-primary/10 text-primary font-medium shadow-sm"
          : isParentActive
          ? "text-foreground font-semibold"
          : "text-muted-foreground font-medium hover:bg-muted/70 hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}
