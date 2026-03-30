import { requireCompanyContext } from "@/lib/auth/session";

import {
  getBillingUsageSummaryForCompany,
  getPlanUsageSummaryText,
  resolveActiveCompanyPlan,
} from "@/features/billing/server/service";
import { getPlanConfig, listPlanConfigs } from "@/features/billing/server/plans";

export async function getBillingOverviewQuery() {
  const context = await requireCompanyContext();
  const plan = await resolveActiveCompanyPlan(context.company.id);
  const currentPlan = getPlanConfig(plan);
  const usageSummary = await getBillingUsageSummaryForCompany(
    context.company.id,
    plan,
  );

  return {
    companyName: context.company.companyName ?? context.user.name,
    plan,
    currentPlan,
    usageSummary,
    planSummary: getPlanUsageSummaryText(plan),
    planOptions: listPlanConfigs(),
  };
}
