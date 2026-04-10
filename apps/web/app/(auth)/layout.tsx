import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getAuthenticatedHomePath } from "@/lib/auth/redirects";
import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getCurrentSession();

  if (session?.user?.id) {
    const userExists = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
      },
    });

    if (userExists) {
      redirect(getAuthenticatedHomePath(session.user.hasCompletedOnboarding));
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full">{children}</div>
    </div>
  );
}
