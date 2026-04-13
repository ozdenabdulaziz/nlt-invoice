"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import { StatusBanner } from "@/components/shared/status-banner";
import { Button } from "@nlt-invoice/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@nlt-invoice/ui";
import { Input } from "@nlt-invoice/ui";
import { Label } from "@nlt-invoice/ui";
import {
  registerSchema,
  type RegisterInput,
} from "@/lib/validations/auth";
import { registerUserAction } from "@/server/actions/auth";

export function RegisterForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  return (
    <Card className="rounded-[1.8rem] border-border/75 bg-card shadow-[0_40px_110px_-64px_rgba(15,23,42,0.55)]">
      <CardHeader className="space-y-3 pb-5">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary/80">
          Create account
        </p>
        <CardTitle className="text-3xl tracking-tight">
          Create your workspace
        </CardTitle>
        <p className="text-sm leading-6 text-muted-foreground">
          Use your business email to get started. Verification email is sent instantly
          after signup.
        </p>
      </CardHeader>
      <CardContent className="space-y-7">
        <StatusBanner message={message} />
        <StatusBanner message={successMessage} tone="success" />
        <form
          className="space-y-6"
          onSubmit={form.handleSubmit((values) =>
            startTransition(async () => {
              setMessage(undefined);
              setSuccessMessage(undefined);

              const result = await registerUserAction(values);

              if (!result.success) {
                setMessage(result.message);
                const fieldErrors = result.fieldErrors;

                if (fieldErrors) {
                  Object.entries(fieldErrors).forEach(([fieldName, errors]) => {
                    if (!errors?.length) {
                      return;
                    }

                    form.setError(fieldName as keyof RegisterInput, {
                      type: "server",
                      message: errors[0],
                    });
                  });
                }

                return;
              }

              setSuccessMessage(result.message);

              const signInResult = await signIn("credentials", {
                email: values.email,
                password: values.password,
                redirect: false,
                callbackUrl: result.data?.redirectTo ?? "/onboarding",
              });

              if (signInResult?.error) {
                setMessage("Account created. Please log in manually.");
                return;
              }

              router.push(result.data?.redirectTo ?? "/onboarding");
              router.refresh();
            }),
          )}
        >
          <div className="space-y-2">
            <Label htmlFor="register-name">Full name</Label>
            <Input
              id="register-name"
              autoComplete="name"
              placeholder="Full name"
              className="h-12 rounded-xl bg-background/90 px-3.5"
              {...form.register("name")}
            />
            {form.formState.errors.name?.message ? (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-email">Email</Label>
            <Input
              id="register-email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              className="h-12 rounded-xl bg-background/90 px-3.5"
              {...form.register("email")}
            />
            {form.formState.errors.email?.message ? (
              <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
            ) : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="register-password">Password</Label>
              <div className="relative">
                <Input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Create a secure password"
                  className="h-12 rounded-xl bg-background/90 px-3.5 pr-10"
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
              <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
              {form.formState.errors.password?.message ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.password.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-confirm-password">Confirm password</Label>
              <div className="relative">
                <Input
                  id="register-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Re-enter password"
                  className="h-12 rounded-xl bg-background/90 px-3.5 pr-10"
                  {...form.register("confirmPassword")}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center text-muted-foreground transition hover:text-foreground focus-visible:text-foreground"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  aria-pressed={showConfirmPassword}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-4" aria-hidden="true" />
                  ) : (
                    <Eye className="size-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              {form.formState.errors.confirmPassword?.message ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.confirmPassword.message}
                </p>
              ) : null}
            </div>
          </div>
          <Button
            type="submit"
            className="h-12 w-full rounded-xl text-base font-semibold"
            disabled={isPending}
          >
            {isPending ? "Creating free account..." : "Create free account"}
          </Button>
          <p className="text-xs leading-5 text-muted-foreground">
            By creating an account, you agree to receive account and verification emails.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
