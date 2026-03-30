import type { ReactNode } from "react";

import { requireCompanyContext } from "@/lib/auth/session";

export default async function WorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireCompanyContext();

  return children;
}
