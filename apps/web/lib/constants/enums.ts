// Plain TypeScript constants mirroring Prisma enums.
// Safe to import in both server and "use client" components.
// Never import @prisma/client enums directly in client components.

export const CustomerType = {
  INDIVIDUAL: "INDIVIDUAL",
  BUSINESS: "BUSINESS",
} as const;
export type CustomerType = (typeof CustomerType)[keyof typeof CustomerType];

export const DiscountType = {
  PERCENTAGE: "PERCENTAGE",
  FIXED: "FIXED",
} as const;
export type DiscountType = (typeof DiscountType)[keyof typeof DiscountType];

export const InvoiceStatus = {
  DRAFT: "DRAFT",
  SENT: "SENT",
  VIEWED: "VIEWED",
  PARTIAL: "PARTIAL",
  PAID: "PAID",
  OVERDUE: "OVERDUE",
  VOID: "VOID",
} as const;
export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];

export const EstimateStatus = {
  DRAFT: "DRAFT",
  SENT: "SENT",
  VIEWED: "VIEWED",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  EXPIRED: "EXPIRED",
} as const;
export type EstimateStatus = (typeof EstimateStatus)[keyof typeof EstimateStatus];
