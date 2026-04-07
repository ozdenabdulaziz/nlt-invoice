import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, buttonVariants } from "@nlt-invoice/ui";

const featureGroups = [
  {
    title: "Create and send invoices",
    items: [
      "Create invoices and estimates in minutes",
      "Share invoice links with your customers",
      "Keep all customer details in one place",
    ],
  },
  {
    title: "Built for Canadian businesses",
    items: [
      "CAD as the default currency",
      "Simple tax handling (GST/HST)",
      "Clean invoicing flow designed for local businesses",
    ],
  },
  {
    title: "Simple and fast",
    items: [
      "No complex setup required",
      "Designed for solo businesses and small teams",
      "Fast, distraction-free workflow",
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-4 pb-24 pt-12 sm:px-6 lg:px-8">
      <PageHeader
        title="Everything you need to invoice your clients"
        description="Create invoices, send them to customers, and manage everything in one simple place."
      />
      <div className="grid gap-8 lg:grid-cols-3">
        {featureGroups.map((group) => (
          <Card
            key={group.title}
            className="border-border/50 bg-card/60 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
          >
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold tracking-tight text-foreground/90">{group.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 text-sm leading-6 text-muted-foreground/90">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3"
                  >
                    <svg className="mt-0.5 size-5 shrink-0 text-primary/70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="mt-8 flex flex-col items-center gap-8 rounded-[2rem] border border-border/50 bg-primary/5 px-6 py-16 text-center md:px-12 md:py-20 lg:mt-12">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Start invoicing in minutes</h2>
          <p className="text-lg text-muted-foreground">
            No setup, no complexity. Just create and send your first invoice.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/register"
            className={buttonVariants({
              size: "lg",
              className: "h-14 rounded-full px-8 text-base font-semibold shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-primary/25",
            })}
          >
            Start free
          </Link>
          <Link
            href="/pricing"
            className={buttonVariants({
              variant: "outline",
              size: "lg",
              className: "h-12 rounded-full bg-transparent px-6 opacity-80 transition-opacity hover:opacity-100 sm:h-14",
            })}
          >
            See pricing
          </Link>
        </div>
      </section>
    </div>
  );
}
