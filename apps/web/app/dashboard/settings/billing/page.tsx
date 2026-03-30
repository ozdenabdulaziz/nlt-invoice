import { BillingOverview } from "@/features/billing/components/billing-overview";
import { getBillingOverviewQuery } from "@/features/billing/server/queries";

export default async function BillingPage() {
  const overview = await getBillingOverviewQuery();

  return <BillingOverview overview={overview} />;
}
