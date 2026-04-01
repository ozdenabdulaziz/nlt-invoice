"use server";

import bcrypt from "bcryptjs";

import crypto from "crypto";
import { render } from "@react-email/components";
import { getResend } from "@/lib/email/resend";
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

export async function registerUserAction(
  input: unknown,
): Promise<ActionResult<{ redirectTo: string }>> {
  const ip = await getClientIp();
  const rateLimitResult = globalRateLimiter.check({
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

  await prisma.emailVerificationToken.create({
    data: {
      email: validatedInput.email,
      token,
      expiresAt,
    },
  });

  const verificationUrl = `${getAppUrl()}/verify-email?token=${token}`;
  const html = await render(VerificationEmail({ verificationUrl }));
  const resend = getResend();
  
  try {
    const result = await resend.emails.send({
      from: "NLT Invoice <onboarding@resend.dev>",
      to: validatedInput.email,
      subject: "Verify your email address",
      html,
    });

    if (result.error) {
      console.error("[auth] Failed to send verification email:", result.error);
    }
  } catch (err) {
    console.error("[auth] Exception sending verification email:", err);
  }

  return {
    success: true,
    message: "Account created. Redirecting to onboarding.",
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
  const rateLimitResult = globalRateLimiter.check({
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

  // Send email
  const resetUrl = `${getAppUrl()}/reset-password?token=${token}`;
  const html = await render(PasswordResetEmail({ resetUrl }));
  const resend = getResend();
  
  try {
    const result = await resend.emails.send({
      from: "NLT Invoice Security <security@resend.dev>",
      to: email,
      subject: "Reset your NLT Invoice password",
      html,
    });

    if (result.error) {
      console.error("[auth] Failed to send reset email:", result.error);
    }
  } catch (err) {
    console.error("[auth] Exception sending reset email:", err);
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
  const rateLimitResult = globalRateLimiter.check({
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

const RESEND_RATE_LIMIT = 2; // VERY STRICT: 2 per hour
const RESEND_RATE_WINDOW = 60 * 60 * 1000;

export async function resendVerificationEmailAction(
  input: { email: string },
): Promise<{ success: boolean; message: string }> {
  const ip = await getClientIp();
  const rateLimitResult = globalRateLimiter.check({
    id: `resend_ip_${ip}`,
    limit: RESEND_RATE_LIMIT,
    windowMs: RESEND_RATE_WINDOW,
  });

  if (!rateLimitResult.success) {
    return {
      success: false,
      message: "Too many requests. Please try again later.",
    };
  }

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

  await prisma.emailVerificationToken.deleteMany({
    where: { email: user.email },
  });

  await prisma.emailVerificationToken.create({
    data: {
      email: user.email,
      token,
      expiresAt,
    },
  });

  const verificationUrl = `${getAppUrl()}/verify-email?token=${token}`;
  const html = await render(VerificationEmail({ verificationUrl }));
  const resend = getResend();
  
  try {
    await resend.emails.send({
      from: "NLT Invoice <onboarding@resend.dev>",
      to: user.email,
      subject: "Verify your email address",
      html,
    });
  } catch (err) {
    console.error("[auth] Check resend error:", err);
  }

  return {
    success: true,
    message: "A new verification link has been sent to your email.",
  };
}

const VERIFY_RATE_LIMIT = 5;
const VERIFY_RATE_WINDOW = 60 * 60 * 1000;

export async function verifyEmailAction(
  token: string,
): Promise<ActionResult<{ redirectTo: string }>> {
  const ip = await getClientIp();
  const rateLimitResult = globalRateLimiter.check({
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

  const verifyToken = await prisma.emailVerificationToken.findUnique({
    where: { token },
  });

  if (!verifyToken || verifyToken.expiresAt < new Date()) {
    return {
      success: false,
      message: "Invalid or expired verification link.",
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
