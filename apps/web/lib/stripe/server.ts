import Stripe from "stripe";

const STRIPE_API_VERSION = "2026-03-25.dahlia";

function createStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("stripe:missing-secret-key");
  }

  return new Stripe(secretKey, {
    apiVersion: STRIPE_API_VERSION,
  });
}

const globalForStripe = globalThis as typeof globalThis & {
  stripe?: Stripe;
};

export function getStripe() {
  if (process.env.NODE_ENV === "production") {
    return createStripeClient();
  }

  globalForStripe.stripe ??= createStripeClient();
  return globalForStripe.stripe;
}

const zeroDecimalCurrencies = new Set([
  "bif",
  "clp",
  "djf",
  "gnf",
  "jpy",
  "kmf",
  "krw",
  "mga",
  "pyg",
  "rwf",
  "ugx",
  "vnd",
  "vuv",
  "xaf",
  "xof",
  "xpf",
]);

export function toStripeAmountMinorUnits(amount: string | number, currency: string) {
  const normalizedCurrency = currency.toLowerCase();
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new Error("stripe:invalid-amount");
  }

  if (zeroDecimalCurrencies.has(normalizedCurrency)) {
    return Math.round(numericAmount);
  }

  return Math.round(numericAmount * 100);
}

export function fromStripeAmountMinorUnits(amount: number, currency: string) {
  const normalizedCurrency = currency.toLowerCase();

  if (zeroDecimalCurrencies.has(normalizedCurrency)) {
    return amount;
  }

  return amount / 100;
}
