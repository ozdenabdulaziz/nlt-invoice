import { z } from "zod";

/**
 * Runtime validation for required environment variables.
 *
 * Called once during module initialization (Next.js server startup).
 * Throws immediately if any required variable is missing or invalid,
 * preventing the app from serving requests with a broken configuration.
 */

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  AUTH_SECRET: z
    .string()
    .min(16, "AUTH_SECRET must be at least 16 characters"),
  STRIPE_SECRET_KEY: z
    .string()
    .startsWith("sk_", "STRIPE_SECRET_KEY must start with sk_"),
  STRIPE_WEBHOOK_SECRET: z
    .string()
    .startsWith("whsec_", "STRIPE_WEBHOOK_SECRET must start with whsec_"),
  RESEND_API_KEY: z
    .string()
    .startsWith("re_", "RESEND_API_KEY must start with re_"),
  EMAIL_FROM: z.string().min(1, "EMAIL_FROM cannot be empty").optional(),

  // Optional but recommended for production
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Next.js / NextAuth
  AUTH_URL: z.string().url().optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_URL: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let _validated = false;

export function validateEnv(): ServerEnv {
  if (_validated) return serverEnvSchema.parse(process.env);

  const result = serverEnvSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    console.error(
      `\n[env] Missing or invalid environment variables:\n${formatted}\n`,
    );

    throw new Error(
      "Server cannot start: invalid environment configuration. See logs above.",
    );
  }

  if (process.env.NODE_ENV === "production" && !result.data.EMAIL_FROM?.trim()) {
    throw new Error(
      "Server cannot start: EMAIL_FROM is required in production.",
    );
  }

  _validated = true;
  return result.data;
}
