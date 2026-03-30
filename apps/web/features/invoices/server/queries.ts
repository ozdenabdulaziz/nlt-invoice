import { requireCompanyContext } from "@/lib/auth/session";
import {
  getInvoiceByIdForCompany,
  getInvoiceByPublicId,
  listInvoiceCustomersForCompany,
  listInvoicesForCompany,
  type InvoiceCustomerOption,
  type InvoiceDetailRecord,
  type InvoiceListItem,
  type PublicInvoiceRecord,
} from "@/features/invoices/server/service";

export type {
  InvoiceCustomerOption,
  InvoiceDetailRecord,
  InvoiceListItem,
  PublicInvoiceRecord,
};

export async function listInvoicesQuery(search?: string) {
  const context = await requireCompanyContext();

  return listInvoicesForCompany(context.company.id, search);
}

export async function listInvoiceCustomerOptionsQuery() {
  const context = await requireCompanyContext();

  return listInvoiceCustomersForCompany(context.company.id);
}

export async function getInvoiceByIdQuery(invoiceId: string) {
  const context = await requireCompanyContext();

  return getInvoiceByIdForCompany(invoiceId, context.company.id);
}

export async function getInvoiceByPublicIdQuery(publicId: string) {
  return getInvoiceByPublicId(publicId);
}
