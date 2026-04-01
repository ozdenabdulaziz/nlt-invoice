"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { StatusBanner } from "@/components/shared/status-banner";
import { resetPasswordAction } from "@/server/actions/auth";
import { Button } from "@nlt-invoice/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@nlt-invoice/ui";
import { Input } from "@nlt-invoice/ui";
import { Label } from "@nlt-invoice/ui";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validations/auth";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>();

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  return (
    <Card className="border-border/70 bg-card/90 shadow-[0_35px_95px_-58px_rgba(15,23,42,0.55)] backdrop-blur">
      <CardHeader className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary/80">
          Security
        </p>
        <CardTitle className="text-2xl tracking-tight">Set new password</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <StatusBanner message={message} tone="error" />
        <form
          className="space-y-5"
          onSubmit={form.handleSubmit((values) =>
            startTransition(async () => {
              setMessage(undefined);
              const result = await resetPasswordAction(token, values);

              if (!result.success) {
                setMessage(result.message);
                return;
              }

              // On success, redirect to login page with success param
              if (result.data?.redirectTo) {
                router.push(result.data.redirectTo);
              }
            }),
          )}
        >
          <div className="space-y-2">
            <Label htmlFor="reset-password">New Password</Label>
            <Input
              id="reset-password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              {...form.register("password")}
            />
            <p className="text-sm text-destructive">{form.formState.errors.password?.message}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reset-confirm">Confirm Password</Label>
            <Input
              id="reset-confirm"
              type="password"
              autoComplete="new-password"
              placeholder="Confirm your new password"
              {...form.register("confirmPassword")}
            />
            <p className="text-sm text-destructive">{form.formState.errors.confirmPassword?.message}</p>
          </div>
          <Button type="submit" className="w-full rounded-full" disabled={isPending}>
            {isPending ? "Updating..." : "Reset password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
