import { requireCompanyContext } from "@/lib/auth/session";
import {
  getEstimateByIdForCompany,
  getEstimateByPublicId,
  listEstimateCustomersForCompany,
  listEstimatesForCompany,
  type EstimateCustomerOption,
  type EstimateDetailRecord,
  type EstimateListItem,
  type PublicEstimateRecord,
} from "@/features/estimates/server/service";

export type {
  EstimateCustomerOption,
  EstimateDetailRecord,
  EstimateListItem,
  PublicEstimateRecord,
};

export async function listEstimatesQuery(search?: string) {
  const context = await requireCompanyContext();

  return listEstimatesForCompany(context.company.id, search);
}

export async function listEstimateCustomerOptionsQuery() {
  const context = await requireCompanyContext();

  return listEstimateCustomersForCompany(context.company.id);
}

export async function getEstimateByIdQuery(estimateId: string) {
  const context = await requireCompanyContext();

  return getEstimateByIdForCompany(estimateId, context.company.id);
}

export async function getEstimateByPublicIdQuery(publicId: string, trackView = true) {
  return getEstimateByPublicId(publicId, trackView);
}
