import { EstimateStatus } from "@prisma/client";

import {
  canConvertEstimateToInvoice,
  CONVERTIBLE_ESTIMATE_STATUSES,
} from "@/features/estimates/conversion-rules";

describe("estimate conversion rules", () => {
  it("allows conversion for the documented statuses", () => {
    expect(CONVERTIBLE_ESTIMATE_STATUSES).toEqual([
      EstimateStatus.SENT,
      EstimateStatus.VIEWED,
      EstimateStatus.ACCEPTED,
    ]);
  });

  it("returns true only for convertible statuses", () => {
    expect(canConvertEstimateToInvoice(EstimateStatus.SENT)).toBe(true);
    expect(canConvertEstimateToInvoice(EstimateStatus.VIEWED)).toBe(true);
    expect(canConvertEstimateToInvoice(EstimateStatus.ACCEPTED)).toBe(true);

    expect(canConvertEstimateToInvoice(EstimateStatus.DRAFT)).toBe(false);
    expect(canConvertEstimateToInvoice(EstimateStatus.REJECTED)).toBe(false);
    expect(canConvertEstimateToInvoice(EstimateStatus.EXPIRED)).toBe(false);
  });
});
