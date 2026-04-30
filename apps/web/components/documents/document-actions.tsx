"use client";

import { useState } from "react";
import { buttonVariants } from "@nlt-invoice/ui";

type DocumentActionsProps = {
  pdfUrl?: string;
  publicUrl?: string;
};

function triggerPrint() {
  window.setTimeout(() => {
    window.print();
  }, 150);
}

export function DocumentActions({ pdfUrl, publicUrl }: DocumentActionsProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const shareUrl = publicUrl || window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url: shareUrl,
        });
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }

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
          className={buttonVariants({ variant: "outline" }) + " rounded-full"}
        >
          Download PDF
        </a>
      ) : null}
      <button
        type="button"
        className={buttonVariants({ variant: "default" }) + " rounded-full min-w-[100px]"}
        onClick={handleShare}
      >
        {copied ? "Link copied!" : "Share"}
      </button>
    </div>
  );
}
