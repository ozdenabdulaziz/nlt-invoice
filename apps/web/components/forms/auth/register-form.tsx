"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import { StatusBanner } from "@/components/shared/status-banner";
import { Button } from "@nlt-invoice/ui";
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
    <div className="space-y-6">
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
            className="h-11 px-3"
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
            className="h-11 px-3"
            {...form.register("email")}
          />
          <p className="text-sm text-destructive">{form.formState.errors.email?.message}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="register-password">Password</Label>
          <div className="relative">
            <Input
              id="register-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Create a secure password"
              className="h-11 px-3 pr-11"
              {...form.register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
          <p className="text-sm text-destructive">{form.formState.errors.password?.message}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="register-confirm-password">Confirm password</Label>
          <div className="relative">
            <Input
              id="register-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Re-enter password"
              className="h-11 px-3 pr-11"
              {...form.register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            >
              {showConfirmPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
            </button>
          </div>
          <p className="text-sm text-destructive">{form.formState.errors.confirmPassword?.message}</p>
        </div>
        <Button type="submit" className="h-11 w-full rounded-full text-sm font-semibold" disabled={isPending}>
          {isPending ? "Creating account..." : "Create free account"}
        </Button>
      </form>
    </div>
  );
}
