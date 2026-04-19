import { notFound } from "next/navigation";

import { EstimateDetail } from "@/features/estimates/components/estimate-detail";
import { getEstimateByIdQuery } from "@/features/estimates/server/queries";

export default async function EstimateDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const { id } = await params;
  const { success } = await searchParams;
  const estimate = await getEstimateByIdQuery(id);

  if (!estimate) {
    notFound();
  }

  return <EstimateDetail estimate={estimate} success={success} />;
}
