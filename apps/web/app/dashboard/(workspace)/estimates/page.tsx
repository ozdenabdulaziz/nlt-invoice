import { EstimateList } from "@/features/estimates/components/estimate-list";
import { listEstimatesQuery } from "@/features/estimates/server/queries";

export default async function EstimatesPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const search = typeof searchParams?.search === "string" ? searchParams.search : undefined;
  const estimates = await listEstimatesQuery(search);

  return <EstimateList estimates={estimates} search={search} />;
}
