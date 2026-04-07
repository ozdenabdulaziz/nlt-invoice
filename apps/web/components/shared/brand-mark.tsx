import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center transition hover:opacity-80",
        className,
      )}
    >
      <Image
        src="/logo.png"
        alt="NLT Invoice logo"
        width={386}
        height={233}
        priority
        className="h-[28px] w-auto object-contain md:h-[34px]"
      />
    </Link>
  );
}
