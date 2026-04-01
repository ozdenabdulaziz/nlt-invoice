"use client";

import { buttonVariants } from "@nlt-invoice/ui";

type DocumentActionsProps = {
  pdfUrl?: string;
};

function triggerPrint() {
  window.setTimeout(() => {
    window.print();
  }, 150);
}

export function DocumentActions({ pdfUrl }: DocumentActionsProps) {
  return (
    <div className="document-print-toolbar flex flex-wrap gap-3">
      <button
        type="button"
        className={buttonVariants({ variant: "outline" }) + " rounded-full"}
        onClick={triggerPrint}
      >
        Print
      </button>
      {pdfUrl ? (
        <a
          href={pdfUrl}
          target="_blank"
          rel="noreferrer"
          className={buttonVariants({ variant: "default" }) + " rounded-full"}
        >
          Download PDF
        </a>
      ) : null}
    </div>
  );
}
