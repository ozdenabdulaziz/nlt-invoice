import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function apiValidationError(error: ZodError) {
  return NextResponse.json(
    {
      error: "Validation failed.",
      fieldErrors: error.flatten().fieldErrors,
    },
    { status: 400 },
  );
}
