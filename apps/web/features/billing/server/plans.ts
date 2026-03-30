import { Plan } from "@prisma/client";

export type BillingSubject = "customer" | "invoice" | "estimate";

export type BillingPlanConfig = {
  plan: Plan;
  name: string;
  monthlyPriceCad: number | null;
  description: string;
  ctaLabel: string;
  selfServe: boolean;
  limits: Record<BillingSubject, number | null>;
};

const PLAN_ORDER: Plan[] = [Plan.FREE, Plan.PRO, Plan.BUSINESS];

const PLAN_CONFIG: Record<Plan, BillingPlanConfig> = {
  FREE: {
    plan: Plan.FREE,
    name: "Free",
    monthlyPriceCad: 0,
    description: "Best for testing the workflow with a small customer list.",
    ctaLabel: "Upgrade to Pro",
    selfServe: true,
    limits: {
      customer: 5,
      invoice: 10,
      estimate: 10,
    },
  },
  PRO: {
    plan: Plan.PRO,
    name: "Pro",
    monthlyPriceCad: 29.99,
    description: "Unlimited core invoicing for a single user and company.",
    ctaLabel: "Upgrade to Pro",
    selfServe: true,
    limits: {
      customer: null,
      invoice: null,
      estimate: null,
    },
  },
  BUSINESS: {
    plan: Plan.BUSINESS,
    name: "Business",
    monthlyPriceCad: null,
    description: "Contact us for multi-user and advanced requirements.",
    ctaLabel: "Contact us",
    selfServe: false,
    limits: {
      customer: null,
      invoice: null,
      estimate: null,
    },
  },
};

export function getPlanConfig(plan: Plan) {
  return PLAN_CONFIG[plan];
}

export function listPlanConfigs() {
  return PLAN_ORDER.map((plan) => PLAN_CONFIG[plan]);
}

export function getPlanLimit(plan: Plan, subject: BillingSubject) {
  return PLAN_CONFIG[plan].limits[subject];
}

export function formatLimitValue(limit: number | null) {
  return limit === null ? "Unlimited" : limit.toString();
}

export function getUsageLabel(subject: BillingSubject) {
  switch (subject) {
    case "customer":
      return "Customers";
    case "invoice":
      return "Invoices this month";
    case "estimate":
      return "Estimates this month";
  }
}

export function getLimitExceededMessage(plan: Plan, subject: BillingSubject) {
  const planConfig = getPlanConfig(plan);
  const limit = getPlanLimit(plan, subject);

  if (limit === null) {
    return `${planConfig.name} plan allows unlimited ${subject}s in MVP.`;
  }

  switch (subject) {
    case "customer":
      return `Free plan includes up to ${limit} customers. Upgrade to Pro to add more customers.`;
    case "invoice":
      return `Free plan includes up to ${limit} invoices per month. Upgrade to Pro to create more invoices.`;
    case "estimate":
      return `Free plan includes up to ${limit} estimates per month. Upgrade to Pro to create more estimates.`;
  }
}
