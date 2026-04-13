import Link from "next/link";
import { buttonVariants, Card, CardContent, CardHeader, CardTitle } from "@nlt-invoice/ui";

const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for freelancers just getting started",
    features: [
      "1 user, 1 company",
      "Up to 5 customers",
      "Up to 10 invoices per month",
      "Up to 10 estimates",
      "Public links and PDF access",
    ],
    cta: "Start invoicing for free",
    href: "/register",
    popular: false,
    extraLine: null,
  },
  {
    name: "Pro",
    price: "$29.99/month",
    description: "For businesses that invoice regularly and want to get paid faster",
    features: [
      "Unlimited customers",
      "Unlimited invoices",
      "Unlimited estimates",
      "Public links and PDF access",
    ],
    cta: "Upgrade to Pro",
    href: "/register",
    popular: true,
    extraLine: "No limits. No friction. Just send and get paid.",
  },
  {
    name: "Business",
    price: "Custom pricing",
    description: "For teams and growing businesses",
    features: [
      "Multi-user access",
      "Team workflows",
      "Advanced billing features",
      "Priority support",
    ],
    cta: "Contact sales",
    href: "/support",
    popular: false,
    extraLine: null,
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-4 pb-24 pt-16 sm:px-6 lg:px-8">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col items-center space-y-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Simple pricing. Get paid faster.
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
          Create invoices, send them to customers, and get paid — all in one simple tool built for Canadian businesses.
        </p>
        <p className="flex flex-col items-center justify-center gap-1 text-sm font-medium text-foreground/80 sm:flex-row sm:gap-3">
          <span>No credit card required</span>
          <span className="hidden sm:inline">&middot;</span>
          <span>Cancel anytime</span>
          <span className="hidden sm:inline">&middot;</span>
          <span>CAD support 🇨🇦</span>
        </p>
      </div>

      {/* 2. PRICING CARDS */}
      <div className="grid gap-8 lg:grid-cols-3 lg:items-center">
        {pricingTiers.map((tier) => (
          <Card
            key={tier.name}
            className={`relative flex h-full flex-col overflow-hidden backdrop-blur transition-all duration-300 hover:-translate-y-1 ${
              tier.popular
                ? "z-10 scale-100 border-primary/50 bg-card shadow-2xl lg:scale-105"
                : "border-border/40 bg-card/50 shadow-sm hover:shadow-md"
            }`}
          >
            {tier.popular && (
              <div className="absolute top-0 w-full bg-primary py-1.5 text-center text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                Most popular
              </div>
            )}
            <CardHeader className={`space-y-4 pb-6 ${tier.popular ? "pt-10" : ""}`}>
              <div>
                <CardTitle className="text-xl font-bold tracking-tight text-foreground/90">{tier.name}</CardTitle>
                <p className="mt-2 min-h-[40px] text-sm leading-relaxed text-muted-foreground">{tier.description}</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold tracking-tight">{tier.price.split('/')[0]}</span>
                {tier.price.includes('/') && <span className="text-sm font-medium text-muted-foreground">/month</span>}
              </div>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col gap-6">
              <ul className="space-y-4 text-sm leading-6 text-muted-foreground/90">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <svg className={`mt-0.5 size-5 shrink-0 ${tier.popular ? "text-primary" : "text-primary/60"}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-4 flex flex-col gap-6">
                {tier.extraLine && (
                  <div className="rounded-xl bg-primary/5 px-4 py-3 text-sm font-medium leading-relaxed text-primary/80">
                    {tier.extraLine}
                  </div>
                )}
                <Link
                  href={tier.href}
                  className={buttonVariants({
                    size: "lg",
                    variant: tier.popular ? "default" : "outline",
                    className: `h-14 w-full rounded-full font-semibold ${tier.popular ? "shadow-lg hover:shadow-xl" : "bg-transparent transition-opacity hover:opacity-100 opacity-80"}`,
                  })}
                >
                  {tier.cta}
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 3. TESTIMONIAL & TRUST */}
      <div className="mt-12 flex flex-col items-center gap-12">
        <div className="flex flex-col items-center justify-center gap-4 text-sm font-medium text-muted-foreground/80 sm:flex-row sm:gap-8">
          <div className="flex items-center gap-2">
            <svg className="size-5 text-primary/70" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            No hidden fees
          </div>
          <div className="flex items-center gap-2">
            <svg className="size-5 text-primary/70" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Cancel anytime
          </div>
          <div className="flex items-center gap-2">
            <svg className="size-5 text-primary/70" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Built for Canadian businesses 🇨🇦
          </div>
        </div>

        <div className="max-w-3xl rounded-[2.5rem] border border-border/40 bg-card/40 px-6 py-12 text-center shadow-sm backdrop-blur sm:px-12">
          <p className="text-xl italic leading-relaxed text-foreground/90 md:text-2xl">
            &quot;Simple, clean, and actually saves me time. I got paid faster in my first week.&quot;
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">N</div>
            <div className="text-left text-sm">
              <p className="font-semibold text-foreground">Small business owner</p>
              <p className="text-muted-foreground/80">Toronto, ON</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
