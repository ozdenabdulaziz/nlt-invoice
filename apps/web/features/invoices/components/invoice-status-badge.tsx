import { InvoiceStatus } from "@prisma/client";
import { Badge } from "@nlt-invoice/ui";

export function InvoiceStatusBadge({
  status,
}: {
  status: InvoiceStatus;
}) {
  const label = status.toLowerCase().replace(/_/g, " ");
  const variant =
    status === InvoiceStatus.OVERDUE
      ? "destructive"
      : status === InvoiceStatus.DRAFT || status === InvoiceStatus.VOID
        ? "outline"
        : status === InvoiceStatus.SENT || status === InvoiceStatus.PARTIAL
          ? "secondary"
          : "default";

  return (
    <Badge variant={variant}>
      {label.charAt(0).toUpperCase()}
      {label.slice(1)}
    </Badge>
  );
}
