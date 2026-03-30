import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { buttonVariants } from "@nlt-invoice/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@nlt-invoice/ui";

export default function SupportPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Support"
        title="Business plan conversations start here."
        description="The MVP keeps Business non-self-serve. Use this route for sales questions, launch support, and product feedback."
      />
      <Card className="border-border/70 bg-card/85 shadow-[0_28px_90px_-58px_rgba(15,23,42,0.55)] backdrop-blur">
        <CardHeader>
          <CardTitle className="text-2xl">Talk to NLT Invoice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
          <p>
            Reach out at{" "}
            <a href="mailto:hello@nltinvoice.com" className="font-medium text-primary underline-offset-4 hover:underline">
              hello@nltinvoice.com
            </a>{" "}
            for Business requirements, migration questions, or early access discussions.
          </p>
          <Link
            href="/register"
            className={buttonVariants({
              className: "rounded-full px-6",
            })}
          >
            Start with the free plan
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
