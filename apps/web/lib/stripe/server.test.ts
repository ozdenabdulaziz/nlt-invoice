/** @jest-environment node */

import { fromStripeAmountMinorUnits, toStripeAmountMinorUnits } from "@/lib/stripe/server";

describe("stripe money helpers", () => {
  it("converts decimal currencies to minor units", () => {
    expect(toStripeAmountMinorUnits("123.45", "CAD")).toBe(12345);
    expect(fromStripeAmountMinorUnits(12345, "CAD")).toBe(123.45);
  });

  it("handles zero-decimal currencies", () => {
    expect(toStripeAmountMinorUnits("5000", "JPY")).toBe(5000);
    expect(fromStripeAmountMinorUnits(5000, "JPY")).toBe(5000);
  });
});
