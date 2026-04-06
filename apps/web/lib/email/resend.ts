import { Resend } from "resend";

// ---------------------------------------------------------------------------
// Resend email client – centralised singleton
// ---------------------------------------------------------------------------

let resendInstance: Resend | null = null;

/**
 * Returns a lazily-initialised Resend client.
 *
 * Throws if `RESEND_API_KEY` is not set so callers can catch and degrade
 * gracefully (e.g. log instead of crashing the signup flow).
 */
export function getResend(): Resend {
  if (!process.env.RESEND_API_KEY) {
    throw new Error(
      "RESEND_API_KEY is not set. Email sending is unavailable.",
    );
  }

  if (!resendInstance) {
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }

  return resendInstance;
}

// ---------------------------------------------------------------------------
// Sender address helper
// ---------------------------------------------------------------------------

const DEFAULT_FROM = "NLT Invoice <info@nltinvoice.com>";

/**
 * Returns the sender address for outbound emails.
 *
 * Priority:
 *  1. `EMAIL_FROM` env var  (e.g. "NLT Invoice <info@nltinvoice.com>")
 *  2. Fallback to Resend's shared dev sender
 *
 * This lets the app work immediately with Resend's free-tier sender while
 * allowing a seamless switch to a verified custom domain later.
 */
export function getEmailFrom(): string {
  return process.env.EMAIL_FROM || DEFAULT_FROM;
}
