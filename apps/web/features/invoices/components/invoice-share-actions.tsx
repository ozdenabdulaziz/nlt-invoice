"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { StatusBanner } from "@/components/shared/status-banner";
import { buttonVariants, Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "@nlt-invoice/ui";

export function InvoiceShareActions({
  publicId,
}: {
  publicId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const publicPath = `/i/${publicId}`;

  return (
    <Card className="border-border/70 bg-card/90">
      <CardHeader>
        <CardTitle>Share invoice</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Share the public link manually for MVP. Email sending is still a placeholder.
        </p>
        <StatusBanner message={message} tone="success" />
        <StatusBanner message={errorMessage} />
        <div className="space-y-2">
          <Label htmlFor="invoice-public-link">Public link</Label>
          <Input id="invoice-public-link" readOnly value={publicPath} />
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="secondary"
            className="rounded-full px-6"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                setMessage(undefined);
                setErrorMessage(undefined);

                try {
                  const absoluteUrl = new URL(publicPath, window.location.origin).toString();
                  await navigator.clipboard.writeText(absoluteUrl);
                  setMessage("Public invoice link copied.");
                } catch {
                  setErrorMessage("Copy failed. Open the public link and copy it from the browser.");
                }
              })
            }
          >
            {isPending ? "Copying..." : "Copy public link"}
          </Button>
          <Link
            href={publicPath}
            className={buttonVariants({
              variant: "outline",
              className: "rounded-full px-6",
            })}
          >
            Open public invoice
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
