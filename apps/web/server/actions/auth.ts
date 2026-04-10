"use server";

import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";

import crypto from "crypto";
import { render } from "@react-email/components";
import {
  getResend,
  getEmailFrom,
  getEmailReplyTo,
} from "@/lib/email/resend";
import { PasswordResetEmail } from "@/features/auth/email/password-reset-email";
import { VerificationEmail } from "@/features/auth/email/verification-email";
import { getAppUrl } from "@/lib/app-url";

import { globalRateLimiter, getClientIp } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma/client";
import { 
  registerSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema 
} from "@/lib/validations/auth";
import type { ActionResult } from "@/types/actions";

const REGISTER_RATE_LIMIT = 5; // 5 registrations per IP per hour
const REGISTER_RATE_WINDOW = 60 * 60 * 1000;
const VERIFICATION_EMAIL_SUBJECT = "Verify your email – NLT Invoice";
const PASSWORD_RESET_SUBJECT = "Reset your password – NLT Invoice";
const RESEND_VERIFICATION_COOLDOWN_MS = 60 * 1000;

function isMissingEmailVerificationTokensTableError(error: unknown) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return false;
  }

  if (error.code !== "P2021") {
    return false;
  }

  const tableName = typeof error.meta?.table === "string" ? error.meta.table.toLowerCase() : "";
  return tableName.includes("email_verification_tokens");
}

function canFallbackEmailVerificationInCurrentEnv() {
  return process.env.NODE_ENV !== "production";
}

type EmailDispatchContext = {
  flow: "register_verification" | "resend_verification" | "forgot_password";
  to: string;
  from: string;
  replyTo: string;
};

function logEmailDispatchAttempt(context: EmailDispatchContext) {
  if (process.env.NODE_ENV !== "production") {
    console.info("[auth] Sending email:", context);
  }
}

function logEmailDispatchSuccess(context: EmailDispatchContext, messageId?: string) {
  if (process.env.NODE_ENV !== "production") {
    console.info("[auth] Email sent:", { ...context, messageId });
  }
}

function logEmailDispatchFailure(context: EmailDispatchContext, error: unknown) {
  console.error("[auth] Email dispatch failed:", { ...context, error });
}

function logDebugEvent(message: string, payload?: Record<string, unknown>) {
  if (process.env.NODE_ENV !== "production") {
    console.log(message, payload ?? {});
  }
}

export async function registerUserAction(
  input: unknown,
): Promise<ActionResult<{ redirectTo: string }>> {
  const ip = await getClientIp();
  const rateLimitResult = await globalRateLimiter.check({
    id: `register_ip_${ip}`,
    limit: REGISTER_RATE_LIMIT,
    windowMs: REGISTER_RATE_WINDOW,
  });

  if (!rateLimitResult.success) {
    return {
      success: false,
      message: "Too many registration attempts. Please try again later.",
    };
  }

  const parsedInput = registerSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: parsedInput.error.flatten().fieldErrors,
    };
  }

  const { confirmPassword, ...validatedInput } = parsedInput.data;
  void confirmPassword;
  logDebugEvent("REGISTER START", { email: validatedInput.email });

  const existingUser = await prisma.user.findUnique({
    where: {
      email: validatedInput.email,
    },
    select: {
      id: true,
    },
  });

  if (existingUser) {
    return {
      success: false,
      message: "An account with this email already exists.",
      fieldErrors: {
        email: ["An account with this email already exists."],
      },
    };
  }

  const passwordHash = await bcrypt.hash(validatedInput.password, 12);


  await prisma.user.create({
    data: {
      name: validatedInput.name,
      email: validatedInput.email,
      passwordHash,
    },
  });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  let tokenPersisted = true;
  try {
    const verificationToken = await prisma.emailVerificationToken.create({
      data: {
        email: validatedInput.email,
        token,
        expiresAt,
      },
    });
    logDebugEvent("TOKEN CREATED", {
      email: validatedInput.email,
      tokenId: verificationToken.id,
    });
  } catch (error) {
    console.error("[auth] Failed to create email verification token:", error);
    if (
      canFallbackEmailVerificationInCurrentEnv() &&
      isMissingEmailVerificationTokensTableError(error)
    ) {
      tokenPersisted = false;
      console.warn(
        "[auth] Email verification token table is missing; continuing signup without verification token in non-production environment.",
      );
    } else {
      throw error;
    }
  }

  // Email dispatch is best-effort — never block signup on email failure
  let emailSent = false;
  if (tokenPersisted) {
    const from = getEmailFrom();
    const replyTo = getEmailReplyTo();
    const context: EmailDispatchContext = {
      flow: "register_verification",
      to: validatedInput.email,
      from,
      replyTo,
    };

    try {
      if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.includes("replace_me")) {
        console.error(
          "[auth] RESEND_API_KEY is missing or still a placeholder. Verification email will not be sent.",
        );
      }
      logDebugEvent("EMAIL SENDING STARTED", {
        email: validatedInput.email,
        from: context.from,
        replyTo: context.replyTo,
      });
      const verificationUrl = `${getAppUrl()}/verify-email?token=${token}`;
      const html = await render(VerificationEmail({ verificationUrl }));
      const resend = getResend();
      logEmailDispatchAttempt(context);
      const result = await resend.emails.send({
        from: context.from,
        replyTo: context.replyTo,
        to: validatedInput.email,
        subject: VERIFICATION_EMAIL_SUBJECT,
        html,
      });
      if (process.env.NODE_ENV !== "production") {
        console.log("[auth] Resend response (register verification):", result);
      }

      if (result.error) {
        logEmailDispatchFailure(context, result.error);
      } else {
        emailSent = true;
        logEmailDispatchSuccess(context, result.data?.id);
        logDebugEvent("EMAIL SENT SUCCESS", {
          email: validatedInput.email,
          resendId: result.data?.id,
        });
        logDebugEvent("REGISTER EMAIL SENT", {
          email: validatedInput.email,
          resendId: result.data?.id,
        });
      }
    } catch (err) {
      logEmailDispatchFailure(context, err);
    }
  }

  return {
    success: true,
    message: !tokenPersisted
      ? "Account created. Email verification is temporarily unavailable in local development."
      : emailSent
      ? "Account created. A verification email has been sent."
      : "Account created. You can verify your email later from the dashboard.",
    data: {
      redirectTo: "/onboarding",
    },
  };
}

const FORGOT_RATE_LIMIT = 3; // 3 requests per IP per hour
const FORGOT_RATE_WINDOW = 60 * 60 * 1000;

export async function forgotPasswordAction(
  input: unknown,
): Promise<ActionResult<{ success: boolean }>> {
  const ip = await getClientIp();
  const rateLimitResult = await globalRateLimiter.check({
    id: `forgot_ip_${ip}`,
    limit: FORGOT_RATE_LIMIT,
    windowMs: FORGOT_RATE_WINDOW,
  });

  if (!rateLimitResult.success) {
    return {
      success: false,
      message: "Too many requests. Please try again later.",
    };
  }

  const parsedInput = forgotPasswordSchema.safeParse(input);
  if (!parsedInput.success) {
    return {
      success: false,
      message: "Please enter a valid email address.",
    };
  }

  const { email } = parsedInput.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // Silent success to prevent email enumeration
  if (!user) {
    return {
      success: true,
      message: "If an account exists, a password reset link has been sent.",
    };
  }

  // Generate secure token
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Invalidate previous tokens
  await prisma.passwordResetToken.deleteMany({ where: { email } });

  // Create new token
  await prisma.passwordResetToken.create({
    data: {
      email,
      token,
      expiresAt,
    },
  });

  // Send email — best-effort, never leak user existence
  try {
    const resetUrl = `${getAppUrl()}/reset-password?token=${token}`;
    const html = await render(PasswordResetEmail({ resetUrl }));
    const resend = getResend();
    const context: EmailDispatchContext = {
      flow: "forgot_password",
      to: email,
      from: getEmailFrom(),
      replyTo: getEmailReplyTo(),
    };
    logEmailDispatchAttempt(context);
    const result = await resend.emails.send({
      from: context.from,
      replyTo: context.replyTo,
      to: email,
      subject: PASSWORD_RESET_SUBJECT,
      html,
    });

    if (result.error) {
      logEmailDispatchFailure(context, result.error);
    } else {
      logEmailDispatchSuccess(context, result.data?.id);
    }
  } catch (err) {
    logEmailDispatchFailure(
      {
        flow: "forgot_password",
        to: email,
        from: getEmailFrom(),
        replyTo: getEmailReplyTo(),
      },
      err,
    );
  }

  return {
    success: true,
    message: "If an account exists, a password reset link has been sent.",
  };
}

const RESET_RATE_LIMIT = 5;
const RESET_RATE_WINDOW = 60 * 60 * 1000;

export async function resetPasswordAction(
  token: string,
  input: unknown,
): Promise<ActionResult<{ redirectTo: string }>> {
  const ip = await getClientIp();
  const rateLimitResult = await globalRateLimiter.check({
    id: `reset_ip_${ip}`,
    limit: RESET_RATE_LIMIT,
    windowMs: RESET_RATE_WINDOW,
  });

  if (!rateLimitResult.success) {
    return {
      success: false,
      message: "Too many attempts. Please try again later.",
    };
  }

  const parsedInput = resetPasswordSchema.safeParse(input);
  if (!parsedInput.success) {
    return {
      success: false,
      message: "Please check your input.",
      fieldErrors: parsedInput.error.flatten().fieldErrors,
    };
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetToken || resetToken.expiresAt < new Date()) {
    return {
      success: false,
      message: "Invalid or expired password reset token.",
    };
  }

  const passwordHash = await bcrypt.hash(parsedInput.data.password, 12);

  await prisma.user.update({
    where: { email: resetToken.email },
    data: { passwordHash },
  });

  await prisma.passwordResetToken.delete({
    where: { id: resetToken.id },
  });

  return {
    success: true,
    message: "Your password has been reset successfully.",
    data: {
      redirectTo: "/login?reset=success",
    },
  };
}

export async function resendVerificationEmailAction(
  input: { email: string },
): Promise<{ success: boolean; message: string }> {
  logDebugEvent("RESEND ATTEMPT", { email: input.email });

  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user || user.emailVerified) {
    return {
      success: true,
      message: "If an unverified account exists, a link has been sent.",
    };
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  try {
    const latestToken = await prisma.emailVerificationToken.findFirst({
      where: { email: user.email },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    if (latestToken) {
      const elapsedMs = Date.now() - latestToken.createdAt.getTime();
      if (elapsedMs < RESEND_VERIFICATION_COOLDOWN_MS) {
        const remainingSeconds = Math.max(
          1,
          Math.ceil((RESEND_VERIFICATION_COOLDOWN_MS - elapsedMs) / 1000),
        );
        logDebugEvent("COOLDOWN BLOCKED", {
          email: user.email,
          remainingSeconds,
        });
        return {
          success: false,
          message: `Please wait ${remainingSeconds} seconds before requesting another verification email.`,
        };
      }
    }

    await prisma.emailVerificationToken.deleteMany({
      where: { email: user.email },
    });

    const verificationToken = await prisma.emailVerificationToken.create({
      data: {
        email: user.email,
        token,
        expiresAt,
      },
    });

    if (process.env.NODE_ENV !== "production") {
      console.info("[auth] Created email verification token during resend:", {
        email: user.email,
        tokenId: verificationToken.id,
      });
    }
  } catch (error) {
    if (
      canFallbackEmailVerificationInCurrentEnv() &&
      isMissingEmailVerificationTokensTableError(error)
    ) {
      console.warn(
        "[auth] Email verification token table is missing; skipping resend flow in non-production environment.",
      );
      return {
        success: true,
        message: "Email verification is temporarily unavailable in local development.",
      };
    }

    console.error("[auth] Failed to persist email verification token for resend:", error);
    return {
      success: false,
      message: "We couldn't prepare a verification link right now. Please try again later.",
    };
  }

  let emailSent = false;
  const context: EmailDispatchContext = {
    flow: "resend_verification",
    to: user.email,
    from: getEmailFrom(),
    replyTo: getEmailReplyTo(),
  };
  try {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.includes("replace_me")) {
      console.error(
        "[auth] RESEND_API_KEY is missing or still a placeholder. Verification email resend will fail.",
      );
    }
    logDebugEvent("[auth] Resend verification email dispatch started:", {
      email: user.email,
      from: context.from,
      replyTo: context.replyTo,
    });
    const verificationUrl = `${getAppUrl()}/verify-email?token=${token}`;
    const html = await render(VerificationEmail({ verificationUrl }));
    const resend = getResend();
    logEmailDispatchAttempt(context);
    const result = await resend.emails.send({
      from: context.from,
      replyTo: context.replyTo,
      to: user.email,
      subject: VERIFICATION_EMAIL_SUBJECT,
      html,
    });
    if (process.env.NODE_ENV !== "production") {
      console.log("[auth] Resend response (resend verification):", result);
    }

    if (result.error) {
      logEmailDispatchFailure(context, result.error);
    } else {
      emailSent = true;
      logEmailDispatchSuccess(context, result.data?.id);
      logDebugEvent("RESEND EMAIL SENT", {
        email: user.email,
        resendId: result.data?.id,
      });
    }
  } catch (err) {
    logEmailDispatchFailure(context, err);
  }

  return {
    success: emailSent,
    message: emailSent
      ? "A new verification link has been sent to your email."
      : "We couldn't send the email right now. Please try again later.",
  };
}

const VERIFY_RATE_LIMIT = 5;
const VERIFY_RATE_WINDOW = 60 * 60 * 1000;

export async function verifyEmailAction(
  token: string,
): Promise<ActionResult<{ redirectTo: string }>> {
  const ip = await getClientIp();
  const rateLimitResult = await globalRateLimiter.check({
    id: `verify_ip_${ip}`,
    limit: VERIFY_RATE_LIMIT,
    windowMs: VERIFY_RATE_WINDOW,
  });

  if (!rateLimitResult.success) {
    return {
      success: false,
      message: "Too many attempts. Please try again later.",
    };
  }

  let verifyToken: Awaited<
    ReturnType<typeof prisma.emailVerificationToken.findUnique>
  >;
  try {
    verifyToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
    });
  } catch (error) {
    if (
      canFallbackEmailVerificationInCurrentEnv() &&
      isMissingEmailVerificationTokensTableError(error)
    ) {
      console.warn(
        "[auth] Email verification token table is missing; verification flow is unavailable in non-production environment.",
      );
      return {
        success: false,
        message: "Email verification is temporarily unavailable in local development.",
      };
    }
    throw error;
  }

  if (!verifyToken) {
    return {
      success: false,
      message: "This verification link is invalid.",
    };
  }

  if (verifyToken.expiresAt < new Date()) {
    await prisma.emailVerificationToken.deleteMany({
      where: { email: verifyToken.email },
    });

    return {
      success: false,
      message: "This verification link has expired. Please request a new verification email.",
    };
  }

  await prisma.user.update({
    where: { email: verifyToken.email },
    data: { emailVerified: new Date() },
  });

  await prisma.emailVerificationToken.deleteMany({
    where: { email: verifyToken.email },
  });

  return {
    success: true,
    message: "Email successfully verified.",
    data: {
      redirectTo: "/dashboard?verified=true",
    },
  };
}
