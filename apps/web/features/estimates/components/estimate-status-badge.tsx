import { EstimateStatus } from "@prisma/client";
import { Badge } from "@nlt-invoice/ui";

function getVariant(status: EstimateStatus) {
  switch (status) {
    case EstimateStatus.REJECTED:
      return "destructive" as const;
    case EstimateStatus.DRAFT:
    case EstimateStatus.EXPIRED:
      return "outline" as const;
    case EstimateStatus.SENT:
      return "secondary" as const;
    case EstimateStatus.VIEWED:
    case EstimateStatus.ACCEPTED:
    default:
      return "default" as const;
  }
}

function getLabel(status: EstimateStatus) {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/^\w/, (value) => value.toUpperCase());
}

export function EstimateStatusBadge({
  status,
}: {
  status: EstimateStatus;
}) {
  return <Badge variant={getVariant(status)}>{getLabel(status)}</Badge>;
}
