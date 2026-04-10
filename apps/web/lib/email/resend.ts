import { Resend } from "resend";

// ---------------------------------------------------------------------------
// Resend email client – centralised singleton
// ---------------------------------------------------------------------------

let resendInstance: Resend | null = null;

function isPlaceholderResendApiKey(value: string) {
  return value.includes("replace_me");
}

/**
 * Returns a lazily-initialised Resend client.
 *
 * Throws if `RESEND_API_KEY` is not set so callers can catch and degrade
 * gracefully (e.g. log instead of crashing the signup flow).
 */
export function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error(
      "[email] RESEND_API_KEY is missing.",
      { hasValue: Boolean(apiKey) },
    );
    throw new Error(
      "RESEND_API_KEY is missing. Email sending is unavailable.",
    );
  }

  if (isPlaceholderResendApiKey(apiKey)) {
    console.error(
      "[email] RESEND_API_KEY appears to be a placeholder value. Email API calls may fail until a real key is set.",
    );
  }

  if (!resendInstance) {
    resendInstance = new Resend(apiKey);
  }

  return resendInstance;
}

// ---------------------------------------------------------------------------
// Sender address helper
// ---------------------------------------------------------------------------

const PRODUCTION_FROM = "NLT Invoice <noreply@mail.nltinvoice.com>";
const SUPPORT_REPLY_TO = "info@nltinvoice.com";

/**
 * Returns the production sender address for outbound emails.
 */
export function getEmailFrom(): string {
  return PRODUCTION_FROM;
}

/**
 * Returns support inbox for reply-to headers on outbound emails.
 */
export function getEmailReplyTo(): string {
  return SUPPORT_REPLY_TO;
}
