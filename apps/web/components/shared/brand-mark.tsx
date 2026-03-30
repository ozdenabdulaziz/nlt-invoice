import Link from "next/link";

import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-3 rounded-full border border-border/70 bg-card/80 px-3 py-2 text-sm font-semibold tracking-[0.18em] text-foreground shadow-sm backdrop-blur-sm transition hover:border-primary/30 hover:text-primary",
        className,
      )}
    >
      <span className="flex size-9 items-center justify-center rounded-full bg-primary text-[0.68rem] text-primary-foreground">
        NLT
      </span>
      <span className="leading-none">
        <span className="block font-mono text-[0.68rem] text-muted-foreground">
          CANADA-FIRST
        </span>
        <span className="block text-sm tracking-[0.14em]">INVOICE</span>
      </span>
    </Link>
  );
}
