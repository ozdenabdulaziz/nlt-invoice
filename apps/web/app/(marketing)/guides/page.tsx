import Link from "next/link";

import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  buttonVariants,
} from "@nlt-invoice/ui";

const guideCards = [
  {
    eyebrow: "Start Fast",
    title: "Create your first invoice without overthinking it",
    description:
      "The fastest path is simple: add your business details once, create a customer, and send a clean invoice right away.",
    points: [
      "Set up your business profile in minutes",
      "Create a customer and line items quickly",
      "Send a professional invoice without extra setup",
    ],
  },
  {
    eyebrow: "Canada",
    title: "Handle GST/HST cleanly from the start",
    description:
      "Keep tax handling simple so your invoice looks clear, your totals make sense, and you avoid spreadsheet math mistakes.",
    points: [
      "Add straightforward tax rates to invoice items",
      "Keep totals easy for clients to review",
      "Stay aligned with common Canadian billing workflows",
    ],
  },
  {
    eyebrow: "Payments",
    title: "Keep paid and unpaid invoices easy to follow",
    description:
      "When invoicing stays organized, follow-ups get easier and you spend less time wondering what still needs attention.",
    points: [
      "See invoice status in one place",
      "Spot what still needs a follow-up",
      "Keep payment details easier to manage",
    ],
  },
  {
    eyebrow: "Migration",
    title: "Move off spreadsheets with less friction",
    description:
      "You do not need a giant migration project. Start with your next invoice, then move active customers over as you go.",
    points: [
      "Start fresh with new invoices first",
      "Bring over active customers gradually",
      "Ask for help if you want a clean migration plan",
    ],
  },
];

const quickAnswers = [
  {
    question: "Is NLT Invoice built for Canadian small businesses?",
    answer:
      "Yes. The product is designed around CAD-first invoicing and simple tax handling for Canadian businesses that want less admin.",
  },
  {
    question: "Do I need setup or training before I can use it?",
    answer:
      "No. The product is meant to feel fast on day one, so you can sign up and start invoicing without a complicated onboarding flow.",
  },
  {
    question: "What if I want help from a real person?",
    answer:
      "Email info@nltinvoice.com and you’ll get a human response. The goal is to help you move quickly, not send you into a support maze.",
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

export default function GuidesPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-4 pb-24 pt-10 sm:px-6 lg:px-8">
      <section className="grid gap-8 overflow-hidden rounded-[2.5rem] border border-border/70 bg-card px-6 py-8 shadow-[0_40px_120px_-72px_rgba(15,23,42,0.7)] md:px-10 md:py-12 lg:grid-cols-[1.15fr,0.85fr] lg:gap-10">
        <div className="space-y-8">
          <Badge variant="secondary" className="rounded-full px-4 py-1.5">
            Help Guides
          </Badge>

          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Quick help for getting invoices out faster
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
              Short, practical guidance for Canadian small businesses that want less friction and fewer billing headaches.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
            <Link
              href="/support"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "h-14 rounded-full bg-background/70 px-6 text-sm font-medium",
              })}
            >
              Contact support
            </Link>
          </div>
        </div>

        <Card className="border-border/70 bg-background/85 shadow-none">
          <CardHeader className="space-y-3 border-b border-border/60 pb-5">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary/80">
              Most Requested
            </p>
            <CardTitle className="text-2xl font-semibold tracking-tight text-foreground">
              What people usually need help with
            </CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              The common blockers are usually setup speed, GST/HST clarity, payment tracking, and getting off spreadsheets.
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-4">
              {guideCards.map((guide) => (
                <li
                  key={guide.title}
                  className="flex items-start gap-3 rounded-[1.25rem] border border-border/60 bg-card/80 px-4 py-4"
                >
                  <CheckIcon className="mt-0.5 size-5 shrink-0 text-primary/75" />
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{guide.title}</p>
                    <p className="text-sm leading-6 text-muted-foreground">{guide.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {guideCards.map((guide) => (
          <Card key={guide.title} className="border-border/70 bg-card/75 shadow-none">
            <CardHeader className="space-y-3">
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary/80">
                {guide.eyebrow}
              </p>
              <CardTitle className="text-2xl font-semibold tracking-tight text-foreground">
                {guide.title}
              </CardTitle>
              <p className="text-sm leading-6 text-muted-foreground">{guide.description}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {guide.points.map((point) => (
                  <li key={point} className="flex items-start gap-3 rounded-[1.1rem] border border-border/60 bg-background/70 px-4 py-4">
                    <CheckIcon className="mt-0.5 size-5 shrink-0 text-primary/70" />
                    <span className="text-sm leading-6 text-muted-foreground">{point}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="space-y-8">
        <div className="space-y-3">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary/80">
            Quick Answers
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            A few things people want to know before they start
          </h2>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            Clear answers, short enough to skim, practical enough to help you decide quickly.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {quickAnswers.map((item) => (
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

      <section className="rounded-[2rem] border border-border/60 bg-primary/[0.05] px-6 py-14 text-center md:px-12">
        <div className="mx-auto max-w-3xl space-y-5">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Want the fastest route?
          </h2>
          <p className="text-base leading-7 text-muted-foreground md:text-lg">
            Start free if you want to see the workflow immediately, or email us if you want a real answer before you commit.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row sm:items-center">
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
            <a
              href="mailto:info@nltinvoice.com"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "h-14 rounded-full bg-background/70 px-6 text-sm font-medium",
              })}
            >
              Email us at info@nltinvoice.com
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
