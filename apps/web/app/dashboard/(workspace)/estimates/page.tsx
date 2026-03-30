import { EstimateList } from "@/features/estimates/components/estimate-list";
import { listEstimatesQuery } from "@/features/estimates/server/queries";

export default async function EstimatesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;
  const estimates = await listEstimatesQuery(search);

  return <EstimateList estimates={estimates} search={search} />;
}
