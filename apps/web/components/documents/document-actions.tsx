"use client";

import { Button } from "@nlt-invoice/ui";

function triggerPrint() {
  window.setTimeout(() => {
    window.print();
  }, 150);
}

export function DocumentActions() {
  return (
    <div className="document-print-toolbar flex flex-wrap gap-3">
      <Button
        type="button"
        variant="outline"
        className="rounded-full"
        onClick={triggerPrint}
      >
        Print
      </Button>
      <Button
        type="button"
        className="rounded-full"
        onClick={triggerPrint}
      >
        Download PDF
      </Button>
    </div>
  );
}
