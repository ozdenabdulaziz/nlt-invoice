"use client";

import { Button } from "@nlt-invoice/ui";

export function DocumentActions() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        type="button"
        variant="outline"
        className="rounded-full"
        onClick={() => window.print()}
      >
        Print
      </Button>
      <Button
        type="button"
        className="rounded-full"
        onClick={() => window.print()}
      >
        Download PDF
      </Button>
    </div>
  );
}
