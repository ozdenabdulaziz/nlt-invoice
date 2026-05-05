import type { ReactNode } from "react";

import { DocumentActions } from "@/components/documents/document-actions";
import { BrandMark } from "@/components/shared/brand-mark";
import { StatusBanner } from "@/components/shared/status-banner";

type PublicDocumentShellProps = {
  kind: "invoice" | "estimate";
  publicId: string;
  pdfUrl?: string;
  statusMessage?: {
    message: string;
    tone?: "error" | "success";
  };
  paymentAction?: ReactNode;
  children: ReactNode;
};

export function PublicDocumentShell({
  kind,
  publicId,
  pdfUrl,
  statusMessage,
  paymentAction,
  children,
}: PublicDocumentShellProps) {
  return (
    <div className="document-print-shell invoice-container mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 bg-slate-50/50">
      <div className="document-print-topbar flex flex-col gap-4 md:flex-row md:items-center md:justify-between w-full max-w-[850px] mx-auto">
        <BrandMark />
        <DocumentActions
          pdfUrl={pdfUrl ?? ""}
          publicUrl={kind === "invoice" ? `/i/${publicId}` : `/e/${publicId}`}
        />
      </div>

      <div className="flex flex-col items-center gap-6 w-full">
        {statusMessage?.message ? (
          <div className="w-full max-w-[850px]">
            <StatusBanner
              message={statusMessage.message}
              tone={statusMessage.tone}
            />
          </div>
        ) : null}

        {paymentAction && (
          <div className="w-full max-w-[850px] bg-white shadow-sm border border-border/70 rounded-2xl p-6">
            {paymentAction}
          </div>
        )}

        <div className="bg-transparent w-full max-w-[850px] flex justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}
