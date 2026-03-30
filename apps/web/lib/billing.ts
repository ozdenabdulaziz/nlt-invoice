import { Plan } from "@prisma/client";

export type PlanConfig = {
  name: string;
  monthlyPriceCad: number | null;
  description: string;
  ctaLabel: string;
  selfServe: boolean;
  limits: {
    maxCustomers: number | null;
    maxInvoicesPerMonth: number | null;
    maxEstimatesPerMonth: number | null;
  };
};

export const PLAN_CONFIG: Record<Plan, PlanConfig> = {
  FREE: {
    name: "Free",
    monthlyPriceCad: 0,
    description: "Best for testing the workflow with a small customer list.",
    ctaLabel: "Start free",
    selfServe: true,
    limits: {
      maxCustomers: 5,
      maxInvoicesPerMonth: 5,
      maxEstimatesPerMonth: 3,
    },
  },
  PRO: {
    name: "Pro",
    monthlyPriceCad: 29.99,
    description: "Unlimited core invoicing for a single user and company.",
    ctaLabel: "Upgrade to Pro",
    selfServe: true,
    limits: {
      maxCustomers: null,
      maxInvoicesPerMonth: null,
      maxEstimatesPerMonth: null,
    },
  },
  BUSINESS: {
    name: "Business",
    monthlyPriceCad: null,
    description: "Contact us for multi-user and advanced requirements.",
    ctaLabel: "Contact us",
    selfServe: false,
    limits: {
      maxCustomers: null,
      maxInvoicesPerMonth: null,
      maxEstimatesPerMonth: null,
    },
  },
};

export function getPlanConfig(plan: Plan) {
  return PLAN_CONFIG[plan];
}
