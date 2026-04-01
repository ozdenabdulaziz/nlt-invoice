"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { StatusBanner } from "@/components/shared/status-banner";
import { Button } from "@nlt-invoice/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@nlt-invoice/ui";
import { Input } from "@nlt-invoice/ui";
import { Label } from "@nlt-invoice/ui";
import {
  loginSchema,
  type LoginInput,
} from "@/lib/validations/auth";

export function LoginForm({
  callbackUrl = "/dashboard",
  resetSuccess = false,
}: {
  callbackUrl?: string;
  resetSuccess?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | undefined>(
    resetSuccess ? "Your password has been reset successfully. Please log in." : undefined
  );
  
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <Card className="border-border/70 bg-card/90 shadow-[0_35px_95px_-58px_rgba(15,23,42,0.55)] backdrop-blur">
      <CardHeader className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary/80">
          Secure access
        </p>
        <CardTitle className="text-2xl tracking-tight">Log in to NLT Invoice</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <StatusBanner message={message} tone={resetSuccess && message?.includes("reset") ? "success" : "error"} />
        <form
          className="space-y-5"
          onSubmit={form.handleSubmit((values) =>
            startTransition(async () => {
              setMessage(undefined);
              const result = await signIn("credentials", {
                email: values.email,
                password: values.password,
                redirect: false,
                callbackUrl,
              });

              if (result?.error) {
                setMessage("Invalid email or password.");
                return;
              }

              router.push(result?.url ?? callbackUrl);
              router.refresh();
            }),
          )}
        >
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="owner@company.ca"
              {...form.register("email")}
            />
            <p className="text-sm text-destructive">{form.formState.errors.email?.message}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="login-password">Password</Label>
              <Link 
                href="/forgot-password" 
                className="text-sm font-medium text-primary hover:underline hover:text-primary/80"
                tabIndex={-1}
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              {...form.register("password")}
            />
            <p className="text-sm text-destructive">
              {form.formState.errors.password?.message}
            </p>
          </div>
          <Button type="submit" className="w-full rounded-full" disabled={isPending}>
            {isPending ? "Signing in..." : "Log in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
