"use client";

import { useEffect, useTransition, useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { resendVerificationEmailAction } from "@/server/actions/auth";
import { Button } from "@nlt-invoice/ui";

const COOLDOWN_MESSAGE_PATTERN =
  /^Please wait (\d+) seconds before requesting another verification email\.$/;

function extractCooldownSeconds(message: string) {
  const match = message.match(COOLDOWN_MESSAGE_PATTERN);

  if (!match) {
    return null;
  }

  const seconds = Number.parseInt(match[1], 10);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : null;
}

export function EmailVerificationBanner({ email }: { email: string }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>();
  const [success, setSuccess] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (cooldownSeconds === null) {
      return;
    }

    const timer = window.setInterval(() => {
      setCooldownSeconds((current) => {
        if (current === null) {
          return null;
        }

        return current <= 1 ? null : current - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [cooldownSeconds]);

  useEffect(() => {
    if (
      cooldownSeconds === null &&
      message &&
      extractCooldownSeconds(message) !== null
    ) {
      setMessage("You can request a new verification email now.");
    }
  }, [cooldownSeconds, message]);

  const handleResend = () => {
    if (cooldownSeconds !== null) {
      return;
    }

    startTransition(async () => {
      setMessage(undefined);
      try {
        const result = await resendVerificationEmailAction({ email });
        setSuccess(result.success);
        setMessage(result.message);
        setCooldownSeconds(extractCooldownSeconds(result.message));
      } catch (error) {
        console.error("[email-verification-banner] Resend verification failed:", error);
        setSuccess(false);
        setCooldownSeconds(null);
        setMessage("We couldn't send the email right now. Please try again in a minute.");
      }
    });
  };

  const displayedMessage =
    cooldownSeconds !== null
      ? `Please wait ${cooldownSeconds} seconds before requesting another verification email.`
      : message;

  return (
    <div className={`mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border p-4 shadow-sm ${success ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
      <div className="flex items-start sm:items-center gap-3">
        {success ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 sm:mt-0" />
        ) : (
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 sm:mt-0" />
        )}
        <div>
          <h3 className={`font-medium ${success ? 'text-emerald-800' : 'text-amber-800'}`}>
            {success ? "Verification email sent" : "Please verify your email"}
          </h3>
          <p className={`text-sm mt-1 sm:mt-0 ${success ? 'text-emerald-700' : 'text-amber-700'}`}>
            {displayedMessage || "We need to verify your email address to ensure the security of your account and guarantee deliverability of your invoices."}
          </p>
        </div>
      </div>
      {!success && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleResend}
          disabled={isPending || cooldownSeconds !== null}
          className="shrink-0 bg-white border-amber-300 text-amber-800 hover:bg-amber-100 hover:text-amber-900"
        >
          {isPending
            ? "Sending..."
            : cooldownSeconds !== null
            ? `Retry in ${cooldownSeconds}s`
            : "Resend email"}
        </Button>
      )}
    </div>
  );
}
