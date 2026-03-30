import { EstimateStatus } from "@prisma/client";

export const CONVERTIBLE_ESTIMATE_STATUSES: EstimateStatus[] = [
  EstimateStatus.SENT,
  EstimateStatus.VIEWED,
  EstimateStatus.ACCEPTED,
];

export function canConvertEstimateToInvoice(status: EstimateStatus) {
  return CONVERTIBLE_ESTIMATE_STATUSES.includes(status);
}

export function getEstimateConversionRuleDescription() {
  return "Conversion is available for sent, viewed, or accepted estimates.";
}
