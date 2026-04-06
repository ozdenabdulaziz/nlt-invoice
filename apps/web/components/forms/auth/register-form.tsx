"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

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
    <Card className="border-border/70 bg-card/90 shadow-[0_35px_95px_-58px_rgba(15,23,42,0.55)] backdrop-blur">
      <CardHeader className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary/80">
          Get started
        </p>
        <CardTitle className="text-2xl tracking-tight">
          Create your NLT Invoice account
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <StatusBanner message={message} />
        <StatusBanner message={successMessage} tone="success" />
        <form
          className="space-y-5"
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
              {...form.register("name")}
            />
            <p className="text-sm text-destructive">{form.formState.errors.name?.message}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-email">Email</Label>
            <Input
              id="register-email"
              type="email"
              autoComplete="email"
              placeholder="owner@company.ca"
              {...form.register("email")}
            />
            <p className="text-sm text-destructive">{form.formState.errors.email?.message}</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="register-password">Password</Label>
              <Input
                id="register-password"
                type="password"
                autoComplete="new-password"
                placeholder="Create a secure password"
                {...form.register("password")}
              />
              <p className="text-sm text-destructive">
                {form.formState.errors.password?.message}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-confirm-password">Confirm password</Label>
              <Input
                id="register-confirm-password"
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter password"
                {...form.register("confirmPassword")}
              />
              <p className="text-sm text-destructive">
                {form.formState.errors.confirmPassword?.message}
              </p>
            </div>
          </div>
          <Button type="submit" className="w-full rounded-full" disabled={isPending}>
            {isPending ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
