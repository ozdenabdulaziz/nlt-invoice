"use server";

import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma/client";
import { registerSchema } from "@/lib/validations/auth";
import type { ActionResult } from "@/types/actions";

export async function registerUserAction(
  input: unknown,
): Promise<ActionResult<{ redirectTo: string }>> {
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

  return {
    success: true,
    message: "Account created. Redirecting to onboarding.",
    data: {
      redirectTo: "/onboarding",
    },
  };
}
