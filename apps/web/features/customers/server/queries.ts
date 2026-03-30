import { requireCompanyContext } from "@/lib/auth/session";
import {
  getCustomerByIdForCompany,
  listCustomersForCompany,
  type CustomerDetailRecord,
  type CustomerListItem,
} from "@/features/customers/server/service";

export type { CustomerListItem, CustomerDetailRecord };

export async function listCustomersQuery(search?: string) {
  const context = await requireCompanyContext();

  return listCustomersForCompany(context.company.id, search);
}

export async function getCustomerByIdQuery(customerId: string) {
  const context = await requireCompanyContext();

  return getCustomerByIdForCompany(customerId, context.company.id);
}
