import Link from "next/link";

import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  buttonVariants,
} from "@nlt-invoice/ui";

const trustSignals = [
  {
    title: "Built for Canadian small businesses",
    description: "CAD-first invoicing and straightforward tax handling for day-to-day billing.",
  },
  {
    title: "Simple, no setup required",
    description: "Skip the long onboarding project and get your first invoice out quickly.",
  },
  {
    title: "Real human support",
    description: "Email us when you are stuck and get a useful answer from a person.",
  },
];

const helpTopics = [
  "Getting your first invoice out fast",
  "Sorting out GST/HST questions",
  "Cleaning up customers and invoice details",
  "Keeping payment status easy to follow",
];

const faqItems = [
  {
    question: "How fast can I start invoicing?",
    answer:
      "Usually in minutes. Add your business details, create a customer, and send a clean invoice without wrestling with a bloated setup.",
  },
  {
    question: "Does NLT Invoice work for Canadian taxes like GST and HST?",
    answer:
      "Yes. NLT Invoice is built for Canadian small businesses, so GST/HST stays straightforward and your totals stay clear for both you and your clients.",
  },
  {
    question: "Can I invoice in Canadian dollars?",
    answer:
      "Yes. CAD is the default, so you can bill Canadian clients without awkward workarounds or spreadsheet hacks.",
  },
  {
    question: "Can I keep track of paid and unpaid invoices?",
    answer:
      "Yes. Keep invoice status organized in one place so you can see what is paid, what still needs a follow-up, and where cash flow is getting stuck.",
  },
  {
    question: "Do I need an accountant or developer to use this?",
    answer:
      "No. NLT Invoice is made for founders, freelancers, and small teams who want less admin and faster billing, not a technical project.",
  },
  {
    question: "Can I move off spreadsheets without a painful setup?",
    answer:
      "Yes. Start with your next invoice, move active customers over gradually, and email info@nltinvoice.com if you want help choosing the cleanest path.",
  },
];

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function SupportPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-4 pb-24 pt-10 sm:px-6 lg:px-8">
      <section className="grid gap-8 overflow-hidden rounded-[2.5rem] border border-border/70 bg-card px-6 py-8 shadow-[0_40px_120px_-72px_rgba(15,23,42,0.7)] md:px-10 md:py-12 lg:grid-cols-[1.15fr,0.85fr] lg:gap-10">
        <div className="space-y-8">
          <Badge variant="secondary" className="rounded-full px-4 py-1.5">
            Support
          </Badge>

          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Need help with invoicing? We’ve got you.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
              Get answers, fix issues, or talk to us — usually within a few hours.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {trustSignals.map((signal) => (
              <div
                key={signal.title}
                className="rounded-[1.5rem] border border-border/70 bg-background/80 px-5 py-5"
              >
                <p className="font-medium text-foreground">{signal.title}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {signal.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <Card className="border-border/70 bg-background/85 shadow-none">
          <CardHeader className="space-y-3 border-b border-border/60 pb-5">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary/80">
              Fast Answers
            </p>
            <CardTitle className="text-2xl font-semibold tracking-tight text-foreground">
              Real help, not a support maze
            </CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              We can help with setup, invoicing questions, Canadian tax basics, and the
              fastest way to get unstuck.
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-4">
              {helpTopics.map((topic) => (
                <li key={topic} className="flex items-start gap-3 rounded-[1.25rem] border border-border/60 bg-card/80 px-4 py-4">
                  <CheckIcon className="mt-0.5 size-5 shrink-0 text-primary/75" />
                  <span className="text-sm leading-6 text-muted-foreground">{topic}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm leading-6 text-muted-foreground">
              No ticket queue theater. No handoff chain. Just practical answers that help you move.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.25fr,1fr,1fr]">
        <Card className="border-primary/25 bg-primary/[0.06] shadow-[0_30px_80px_-62px_rgba(15,23,42,0.7)]">
          <CardHeader className="space-y-3">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary/80">
              Best First Step
            </p>
            <CardTitle className="text-2xl font-semibold tracking-tight text-foreground">
              Start invoicing in 30 seconds — free
            </CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              Jump straight into the product, create your first invoice, and see how fast the workflow feels.
            </p>
          </CardHeader>
          <CardContent className="pt-2">
            <Link
              href="/register"
              className={buttonVariants({
                size: "lg",
                className:
                  "h-14 rounded-full px-8 text-base font-semibold shadow-lg transition-all duration-300 hover:scale-[1.01] hover:shadow-primary/25",
              })}
            >
              Start invoicing in 30 seconds — free
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/80 shadow-none">
          <CardHeader className="space-y-3">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary/80">
              Talk To Us
            </p>
            <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
              Email us at info@nltinvoice.com
            </CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              Ask about setup, tax questions, migration, or anything blocking you right now.
            </p>
          </CardHeader>
          <CardContent className="pt-2">
            <a
              href="mailto:info@nltinvoice.com"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "h-14 w-full rounded-full bg-background/70 px-6 text-sm font-medium",
              })}
            >
              Email us at info@nltinvoice.com
            </a>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/80 shadow-none">
          <CardHeader className="space-y-3">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary/80">
              Self-Serve
            </p>
            <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
              View help guides
            </CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              Read the common questions around invoicing, GST/HST, payments, and getting started.
            </p>
          </CardHeader>
          <CardContent className="pt-2">
            <Link
              href="/guides"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "h-14 w-full rounded-full bg-background/70 px-6 text-sm font-medium",
              })}
            >
              View help guides
            </Link>
          </CardContent>
        </Card>
      </section>

      <section id="faq" className="scroll-mt-24 space-y-8">
        <div className="space-y-3">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary/80">
            Help Guides
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Common questions, answered clearly
          </h2>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            Straight answers on setup, Canadian taxes, payment tracking, and what to expect when you get started.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {faqItems.map((item) => (
            <Card key={item.question} className="border-border/70 bg-card/75 shadow-none">
              <CardHeader className="space-y-3">
                <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
                  {item.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-7 text-muted-foreground">{item.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
