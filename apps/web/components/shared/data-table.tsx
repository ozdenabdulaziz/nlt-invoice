import * as React from "react";
import { cn } from "@nlt-invoice/ui/src/lib/utils";

export function DataTable({ children, className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className={cn("min-w-full text-left text-sm", className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function DataTableHeader({ children, className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cn("border-b border-slate-200 bg-[#F8FAFC]", className)} {...props}>
      {children}
    </thead>
  );
}

export function DataTableHead({ children, className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function DataTableBody({ children, className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={cn("bg-white", className)} {...props}>
      {children}
    </tbody>
  );
}

export function DataTableRow({ children, className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        "border-b border-slate-100 last:border-b-0",
        "odd:bg-white even:bg-[#FAFBFC]",
        "transition-colors duration-150 hover:bg-[#F1F5F9]",
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export function DataTableCell({ children, className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn("px-6 py-4 align-top", className)} {...props}>
      {children}
    </td>
  );
}
