"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { CheckCircle2 } from "lucide-react";

import { StatusBanner } from "@/components/shared/status-banner";
import { forgotPasswordAction } from "@/server/actions/auth";
import { Button } from "@nlt-invoice/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@nlt-invoice/ui";
import { Input } from "@nlt-invoice/ui";
import { Label } from "@nlt-invoice/ui";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validations/auth";

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>();
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  if (isSuccess) {
    return (
      <Card className="border-border/70 bg-card/90 shadow-[0_35px_95px_-58px_rgba(15,23,42,0.55)] backdrop-blur text-center">
        <CardContent className="pt-10 pb-10 space-y-4">
          <div className="flex justify-center">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl tracking-tight">Check your email</CardTitle>
          <p className="text-muted-foreground">
            {message}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/70 bg-card/90 shadow-[0_35px_95px_-58px_rgba(15,23,42,0.55)] backdrop-blur">
      <CardHeader className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary/80">
          Account Recovery
        </p>
        <CardTitle className="text-2xl tracking-tight">Reset your password</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <StatusBanner message={message} tone="error" />
        <form
          className="space-y-5"
          onSubmit={form.handleSubmit((values) =>
            startTransition(async () => {
              setMessage(undefined);
              const result = await forgotPasswordAction(values);

              if (!result.success) {
                setMessage(result.message);
                return;
              }

              setIsSuccess(true);
              setMessage(result.message);
            }),
          )}
        >
          <div className="space-y-2">
            <Label htmlFor="forgot-email">Email</Label>
            <Input
              id="forgot-email"
              type="email"
              autoComplete="email"
              placeholder="owner@company.ca"
              {...form.register("email")}
            />
            <p className="text-sm text-destructive">{form.formState.errors.email?.message}</p>
          </div>
          <Button type="submit" className="w-full rounded-full" disabled={isPending}>
            {isPending ? "Sending link..." : "Send reset link"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
