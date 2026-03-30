"use client";

import { useTransition } from "react";
import { signOut } from "next-auth/react";

import { Button } from "@nlt-invoice/ui";

export function SignOutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="ghost"
      className="w-full justify-start rounded-2xl px-4"
      onClick={() =>
        startTransition(async () => {
          await signOut({
            callbackUrl: "/",
          });
        })
      }
      disabled={isPending}
    >
      {isPending ? "Signing out..." : "Sign out"}
    </Button>
  );
}
