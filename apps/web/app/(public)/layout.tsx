import type { ReactNode } from "react";

import { SiteHeader } from "@/components/marketing/site-header";

export default function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl px-4 pb-10 pt-5 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
