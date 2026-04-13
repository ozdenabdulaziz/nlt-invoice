import "server-only";
import { Resend } from "resend";

function createResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    console.warn(
      "[email] RESEND_API_KEY is not configured. Email sends will fail until a real key is set.",
    );

    return {
      emails: {
        send: async () => {
          throw new Error("Missing RESEND_API_KEY");
        },
      },
    } as unknown as Resend;
  }

  if (apiKey.includes("replace_me")) {
    console.warn(
      "[email] RESEND_API_KEY appears to be a placeholder value. Email API calls may fail until a real key is set.",
    );
  }

  return new Resend(apiKey);
}

export const resend = createResendClient();

// ---------------------------------------------------------------------------
// Sender address helper
// ---------------------------------------------------------------------------

const DEFAULT_EMAIL_FROM = "NLT Invoice <noreply@mail.nltinvoice.com>";
const DEFAULT_EMAIL_REPLY_TO = "info@nltinvoice.com";

/**
 * Returns the production sender address for outbound emails.
 */
export function getEmailFrom(): string {
  const configuredFrom = process.env.EMAIL_FROM?.trim();
  if (configuredFrom) {
    return configuredFrom;
  }

  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "[email] EMAIL_FROM is not set. Falling back to default sender address.",
    );
  }

  return DEFAULT_EMAIL_FROM;
}

/**
 * Returns support inbox for reply-to headers on outbound emails.
 */
export function getEmailReplyTo(): string {
  return process.env.EMAIL_REPLY_TO?.trim() || DEFAULT_EMAIL_REPLY_TO;
}
