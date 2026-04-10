"use client";

import { useTransition, useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { resendVerificationEmailAction } from "@/server/actions/auth";
import { Button } from "@nlt-invoice/ui";

export function EmailVerificationBanner({ email }: { email: string }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>();
  const [success, setSuccess] = useState(false);

  const handleResend = () => {
    startTransition(async () => {
      setMessage(undefined);
      try {
        const result = await resendVerificationEmailAction({ email });
        setSuccess(result.success);
        setMessage(result.message);
      } catch (error) {
        console.error("[email-verification-banner] Resend verification failed:", error);
        setSuccess(false);
        setMessage("We couldn't send the email right now. Please try again in a minute.");
      }
    });
  };

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
            {message || "We need to verify your email address to ensure the security of your account and guarantee deliverability of your invoices."}
          </p>
        </div>
      </div>
      {!success && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleResend}
          disabled={isPending}
          className="shrink-0 bg-white border-amber-300 text-amber-800 hover:bg-amber-100 hover:text-amber-900"
        >
          {isPending ? "Sending..." : "Resend email"}
        </Button>
      )}
    </div>
  );
}
