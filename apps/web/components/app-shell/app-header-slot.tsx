"use client";

import { usePathname } from "next/navigation";

import { AppHeader } from "@/components/app-shell/app-header";

type AppHeaderSlotProps = {
  companyName?: string | null;
  userName: string;
  hasCompletedOnboarding: boolean;
};

export function AppHeaderSlot(props: AppHeaderSlotProps) {
  const pathname = usePathname();

  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    return null;
  }

  return <AppHeader {...props} />;
}
