import { DiscountType, EstimateStatus } from "@/lib/constants/enums";
import type { EstimateFormInput } from "@/lib/validations/estimate";

export function createEmptyLineItem(sortOrder = 0) {
  return {
    name: "",
    description: "",
    quantity: 1,
    unitPrice: 0,
    taxRate: 0,
    sortOrder,
  };
}

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getDefaultIssueDate() {
  return new Date();
}

function getDefaultExpiryDate() {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 30);
  return expiryDate;
}

export function getEmptyEstimateFormValues(): EstimateFormInput {
  return {
    customerId: "",
    issueDate: formatDateInput(getDefaultIssueDate()),
    expiryDate: formatDateInput(getDefaultExpiryDate()),
    status: EstimateStatus.DRAFT,
    currency: "CAD",
    notes: "",
    terms: "",
    discountType: null,
    discountValue: undefined,
    items: [createEmptyLineItem()],
  };
}

export function mapEstimateToFormValues(estimate: {
  customerId: string;
  issueDate: Date;
  expiryDate: Date;
  status: EstimateStatus;
  currency: string;
  notes: string | null;
  terms: string | null;
  discountType: DiscountType | null;
  discountValue: { toString(): string } | null;
  items: Array<{
    name: string;
    description: string | null;
    quantity: { toString(): string };
    unitPrice: { toString(): string };
    taxRate: { toString(): string };
    sortOrder: number;
  }>;
}): EstimateFormInput {
  return {
    customerId: estimate.customerId,
    issueDate: formatDateInput(estimate.issueDate),
    expiryDate: formatDateInput(estimate.expiryDate),
    status: estimate.status,
    currency: estimate.currency,
    notes: estimate.notes ?? "",
    terms: estimate.terms ?? "",
    discountType: estimate.discountType,
    discountValue: estimate.discountValue
      ? Number(estimate.discountValue.toString())
      : undefined,
    items: estimate.items.map((item, index) => ({
      name: item.name,
      description: item.description ?? "",
      quantity: Number(item.quantity.toString()),
      unitPrice: Number(item.unitPrice.toString()),
      taxRate: Number(item.taxRate.toString()),
      sortOrder: item.sortOrder ?? index,
    })),
  };
}
