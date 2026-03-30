import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@nlt-invoice/ui";

const featureGroups = [
  {
    title: "Core workflow",
    items: [
      "Create invoices and estimates in the same dashboard.",
      "Share public invoice and estimate links with customers.",
      "Keep customer records company-scoped from day one.",
    ],
  },
  {
    title: "Canada-first defaults",
    items: [
      "English-only UI",
      "CAD as the default currency",
      "Simple tax inputs without complex automation",
    ],
  },
  {
    title: "MVP guardrails",
    items: [
      "Single user and single company",
      "No online payment collection yet",
      "Backend-enforced limits for the Free plan",
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Feature scope"
        title="Focused invoicing software, not a bloated back office."
        description="NLT Invoice keeps the MVP narrow so setup, document creation, and public sharing are fast to ship and easy to maintain."
      />
      <div className="grid gap-6 lg:grid-cols-3">
        {featureGroups.map((group) => (
          <Card
            key={group.title}
            className="border-border/70 bg-card/85 shadow-[0_28px_90px_-58px_rgba(15,23,42,0.55)] backdrop-blur"
          >
            <CardHeader>
              <CardTitle className="text-2xl">{group.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-2xl border border-border/70 bg-background/75 px-4 py-3"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
