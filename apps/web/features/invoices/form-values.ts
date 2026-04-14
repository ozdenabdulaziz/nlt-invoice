import { DiscountType, InvoiceStatus } from "@/lib/constants/enums";
import type { InvoiceFormInput } from "@/lib/validations/invoice";

export function createEmptyInvoiceLineItem(sortOrder = 0) {
  return {
    savedItemId: undefined,
    name: "",
    description: "",
    unitType: "each",
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

function getDefaultDueDate() {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);
  return dueDate;
}

function toEditableInvoiceStatus(status: InvoiceStatus): "DRAFT" | "SENT" {
  return status === InvoiceStatus.DRAFT ? InvoiceStatus.DRAFT : InvoiceStatus.SENT;
}

export function getEmptyInvoiceFormValues(customerId = ""): InvoiceFormInput {
  return {
    customerId,
    issueDate: formatDateInput(getDefaultIssueDate()),
    dueDate: formatDateInput(getDefaultDueDate()),
    status: InvoiceStatus.DRAFT,
    currency: "CAD",
    notes: "",
    terms: "",
    discountType: null,
    discountValue: undefined,
    amountPaid: 0,
    items: [createEmptyInvoiceLineItem()],
  };
}

export function mapInvoiceToFormValues(invoice: {
  customerId: string;
  issueDate: Date;
  dueDate: Date;
  status: InvoiceStatus;
  currency: string;
  notes: string | null;
  terms: string | null;
  discountType: DiscountType | null;
  discountValue: { toString(): string } | null;
  amountPaid: { toString(): string };
  items: Array<{
    savedItemId?: string | null;
    name: string;
    description: string | null;
    unitType: string | null;
    quantity: { toString(): string };
    unitPrice: { toString(): string };
    taxRate: { toString(): string };
    sortOrder: number;
  }>;
}): InvoiceFormInput {
  return {
    customerId: invoice.customerId,
    issueDate: formatDateInput(invoice.issueDate),
    dueDate: formatDateInput(invoice.dueDate),
    status: toEditableInvoiceStatus(invoice.status),
    currency: invoice.currency,
    notes: invoice.notes ?? "",
    terms: invoice.terms ?? "",
    discountType: invoice.discountType,
    discountValue: invoice.discountValue
      ? Number(invoice.discountValue.toString())
      : undefined,
    amountPaid: Number(invoice.amountPaid.toString()),
    items: invoice.items.map((item, index) => ({
      savedItemId: item.savedItemId ?? undefined,
      name: item.name,
      description: item.description ?? "",
      unitType: item.unitType ?? "each",
      quantity: Number(item.quantity.toString()),
      unitPrice: Number(item.unitPrice.toString()),
      taxRate: Number(item.taxRate.toString()),
      sortOrder: item.sortOrder ?? index,
    })),
  };
}
