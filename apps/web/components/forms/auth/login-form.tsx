"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
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
  verifiedSuccess = false,
}: {
  callbackUrl?: string;
  resetSuccess?: boolean;
  verifiedSuccess?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState<string | undefined>(() => {
    if (verifiedSuccess) {
      return "Your email has been verified successfully. Please log in.";
    }

    if (resetSuccess) {
      return "Your password has been reset successfully. Please log in.";
    }

    return undefined;
  });
  const [messageTone, setMessageTone] = useState<"error" | "success" | undefined>(
    verifiedSuccess || resetSuccess ? "success" : undefined,
  );

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <Card
      className={`rounded-2xl border border-border/70 bg-card/92 shadow-[0_45px_120px_-70px_rgba(15,23,42,0.56)] backdrop-blur transition-all duration-500 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      <CardHeader className="space-y-3 pb-5">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary/80">
          Welcome back
        </p>
        <CardTitle className="text-3xl tracking-tight">Welcome back</CardTitle>
        <p className="text-sm leading-6 text-muted-foreground">
          Log in to manage your invoices and get paid faster.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <StatusBanner message={message} tone={messageTone} />
        <form
          className="space-y-5"
          onSubmit={form.handleSubmit((values) =>
            startTransition(async () => {
              setMessage(undefined);
              setMessageTone(undefined);
              const result = await signIn("credentials", {
                email: values.email,
                password: values.password,
                redirect: false,
                callbackUrl,
              });

              if (result?.error) {
                setMessage("Invalid email or password.");
                setMessageTone("error");
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
              className="h-12 rounded-xl bg-background/90 px-3.5 transition-[border-color,box-shadow,background-color] duration-200 focus-visible:border-primary/60 focus-visible:ring-4 focus-visible:ring-primary/15"
              {...form.register("email")}
            />
            <p className="text-sm text-destructive">{form.formState.errors.email?.message}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                className="h-12 rounded-xl bg-background/90 px-3.5 pr-10 transition-[border-color,box-shadow,background-color] duration-200 focus-visible:border-primary/60 focus-visible:ring-4 focus-visible:ring-primary/15"
                {...form.register("password")}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center text-muted-foreground transition hover:text-foreground focus-visible:text-foreground"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? (
                  <EyeOff className="size-4" aria-hidden="true" />
                ) : (
                  <Eye className="size-4" aria-hidden="true" />
                )}
              </button>
            </div>
            <p className="text-sm text-destructive">
              {form.formState.errors.password?.message}
            </p>
          </div>
          <div className="flex items-center justify-between gap-4">
            <label
              htmlFor="remember-me"
              className="inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground"
            >
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="size-4 rounded border-border bg-background accent-[hsl(var(--primary))]"
              />
              <span>Remember me</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-primary transition hover:text-primary/80 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Button
            type="submit"
            className="h-12 w-full rounded-xl text-base font-semibold shadow-[0_16px_34px_-20px_hsl(var(--primary)/0.9)] transition duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[0_24px_42px_-22px_hsl(var(--primary)/0.88)] active:scale-[0.99]"
            disabled={isPending}
          >
            {isPending ? "Signing in..." : "Log in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
