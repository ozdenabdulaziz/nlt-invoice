import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import type { InvoiceDetailRecord } from "@/features/invoices/server/service";
import { paginateInvoiceItems } from "@/features/invoices/print/pagination";

// ---------------------------------------------------------------------------
// Fonts
// ---------------------------------------------------------------------------
Font.register({
  family: "Inter",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiA.woff2",
      fontWeight: 600,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiA.woff2",
      fontWeight: 700,
    },
  ],
});

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const COLORS = {
  text: "#111827",
  muted: "#6b7280",
  border: "#e5e7eb",
  background: "#f9fafb",
};

const s = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    fontSize: 9,
    color: COLORS.text,
    paddingTop: 32,
    paddingBottom: 32,
    paddingHorizontal: 40,
    lineHeight: 1.4,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  eyebrow: {
    fontSize: 7,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: COLORS.muted,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 2,
  },
  invoiceNumber: {
    fontSize: 9,
    color: COLORS.muted,
    marginBottom: 2,
  },
  statusBadge: {
    fontSize: 8,
    fontWeight: 600,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  // Meta grid
  metaGrid: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
    paddingTop: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  metaCol: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 7,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: COLORS.muted,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 9,
    color: COLORS.muted,
    marginBottom: 1,
  },
  metaValueBold: {
    fontSize: 9,
    fontWeight: 600,
    color: COLORS.text,
    marginBottom: 1,
  },
  // Date box
  dateBox: {
    backgroundColor: COLORS.background,
    padding: 10,
    borderRadius: 4,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  dateLabel: {
    fontSize: 8,
    color: COLORS.muted,
  },
  dateValue: {
    fontSize: 8,
    fontWeight: 600,
    color: COLORS.text,
  },
  // Items table
  tableHeader: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  colItem: { flex: 3 },
  colQty: { width: 36, textAlign: "center" },
  colUnit: { width: 56, textAlign: "right" },
  colTax: { width: 36, textAlign: "right" },
  colTotal: { width: 64, textAlign: "right" },
  thText: {
    fontSize: 7,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: COLORS.muted,
  },
  itemName: {
    fontSize: 9,
    fontWeight: 600,
    color: COLORS.text,
    marginBottom: 1,
  },
  itemDesc: {
    fontSize: 8,
    color: COLORS.muted,
  },
  // Totals
  totalsSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  totalsBox: {
    width: 200,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 9,
    color: COLORS.muted,
  },
  totalValue: {
    fontSize: 9,
    color: COLORS.text,
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderColor: COLORS.border,
    paddingTop: 6,
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: COLORS.text,
  },
  grandTotalValue: {
    fontSize: 10,
    fontWeight: 700,
    color: COLORS.text,
  },
  // Notes
  notesSection: {
    marginTop: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    gap: 24,
  },
  notesBlock: {
    flex: 1,
  },
  notesLabel: {
    fontSize: 7,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: COLORS.muted,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 8,
    color: COLORS.muted,
    lineHeight: 1.5,
  },
  // Continuation header
  continuationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  continuationTitle: {
    fontSize: 9,
    fontWeight: 600,
    color: COLORS.muted,
  },
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatCurrency(value: string | number, currency: string) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
  }).format(Number(value));
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function formatAddress(parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(", ");
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type InvoiceItem = {
  id: string;
  name: string;
  description: string | null;
  quantity: { toString(): string };
  unitPrice: { toString(): string };
  taxRate: { toString(): string };
  lineTotal: { toString(): string };
  sortOrder: number;
};

type PdfInvoice = Pick<
  InvoiceDetailRecord,
  | "invoiceNumber"
  | "status"
  | "issueDate"
  | "dueDate"
  | "currency"
  | "subtotal"
  | "taxTotal"
  | "discountTotal"
  | "total"
  | "amountPaid"
  | "balanceDue"
  | "notes"
  | "terms"
  | "companyName"
  | "companyEmail"
  | "companyPhone"
  | "companyWebsite"
  | "companyAddressLine1"
  | "companyAddressLine2"
  | "companyCity"
  | "companyProvince"
  | "companyPostalCode"
  | "companyCountry"
  | "companyTaxNumber"
  | "customerName"
  | "customerCompanyName"
  | "customerEmail"
  | "customerPhone"
  | "customerBillingAddressLine1"
  | "customerBillingAddressLine2"
  | "customerBillingCity"
  | "customerBillingProvince"
  | "customerBillingPostalCode"
  | "customerBillingCountry"
> & {
  items: InvoiceItem[];
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function ItemsTable({ items, currency }: { items: InvoiceItem[]; currency: string }) {
  return (
    <View>
      <View style={s.tableHeader}>
        <Text style={[s.thText, s.colItem]}>Item</Text>
        <Text style={[s.thText, s.colQty]}>Qty</Text>
        <Text style={[s.thText, s.colUnit]}>Unit price</Text>
        <Text style={[s.thText, s.colTax]}>Tax</Text>
        <Text style={[s.thText, s.colTotal]}>Total</Text>
      </View>
      {items.map((item) => (
        <View key={item.id} style={s.tableRow} wrap={false}>
          <View style={s.colItem}>
            <Text style={s.itemName}>{item.name}</Text>
            {item.description ? (
              <Text style={s.itemDesc}>{item.description}</Text>
            ) : null}
          </View>
          <Text style={[s.totalLabel, s.colQty]}>{item.quantity.toString()}</Text>
          <Text style={[s.totalLabel, s.colUnit]}>
            {formatCurrency(item.unitPrice.toString(), currency)}
          </Text>
          <Text style={[s.totalLabel, s.colTax]}>{item.taxRate.toString()}%</Text>
          <Text style={[s.totalValue, s.colTotal]}>
            {formatCurrency(item.lineTotal.toString(), currency)}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main document
// ---------------------------------------------------------------------------
export function InvoicePdfDocument({ invoice }: { invoice: PdfInvoice }) {
  const { currency } = invoice;
  const pages = paginateInvoiceItems(invoice.items);
  const billingAddress = formatAddress([
    invoice.customerBillingAddressLine1,
    invoice.customerBillingAddressLine2,
    invoice.customerBillingCity,
    invoice.customerBillingProvince,
    invoice.customerBillingPostalCode,
    invoice.customerBillingCountry,
  ]);
  const balanceDueNum = Number(invoice.balanceDue.toString());

  return (
    <Document
      title={`Invoice ${invoice.invoiceNumber}`}
      author={invoice.companyName ?? "NLT Invoice"}
    >
      {pages.map((pageItems, pageIndex) => (
        <Page key={pageIndex} size="A4" style={s.page}>
          {/* Header */}
          {pageIndex === 0 ? (
            <View style={s.header}>
              <View style={s.headerLeft}>
                <Text style={s.eyebrow}>Invoice</Text>
                <Text style={s.title}>{invoice.invoiceNumber}</Text>
                <Text style={s.invoiceNumber}>{invoice.companyName ?? "NLT Invoice"}</Text>
              </View>
              <View style={s.headerRight}>
                <Text style={s.statusBadge}>{invoice.status}</Text>
              </View>
            </View>
          ) : (
            <View style={s.continuationHeader}>
              <Text style={s.continuationTitle}>
                Invoice {invoice.invoiceNumber} — continued (page {pageIndex + 1})
              </Text>
              <Text style={s.continuationTitle}>{invoice.companyName ?? ""}</Text>
            </View>
          )}

          {/* Meta grid (first page only) */}
          {pageIndex === 0 ? (
            <View style={s.metaGrid}>
              {/* From */}
              <View style={s.metaCol}>
                <Text style={s.metaLabel}>From</Text>
                <Text style={s.metaValueBold}>{invoice.companyName ?? "NLT Invoice"}</Text>
                {invoice.companyEmail ? <Text style={s.metaValue}>{invoice.companyEmail}</Text> : null}
                {invoice.companyPhone ? <Text style={s.metaValue}>{invoice.companyPhone}</Text> : null}
                {invoice.companyAddressLine1 ? (
                  <Text style={s.metaValue}>
                    {formatAddress([
                      invoice.companyAddressLine1,
                      invoice.companyAddressLine2,
                      invoice.companyCity,
                      invoice.companyProvince,
                      invoice.companyPostalCode,
                      invoice.companyCountry,
                    ])}
                  </Text>
                ) : null}
                {invoice.companyTaxNumber ? (
                  <Text style={s.metaValue}>Tax: {invoice.companyTaxNumber}</Text>
                ) : null}
              </View>

              {/* Bill to */}
              <View style={s.metaCol}>
                <Text style={s.metaLabel}>Bill to</Text>
                <Text style={s.metaValueBold}>{invoice.customerName ?? "Customer"}</Text>
                {invoice.customerCompanyName ? (
                  <Text style={s.metaValue}>{invoice.customerCompanyName}</Text>
                ) : null}
                {invoice.customerEmail ? (
                  <Text style={s.metaValue}>{invoice.customerEmail}</Text>
                ) : null}
                {billingAddress ? (
                  <Text style={s.metaValue}>{billingAddress}</Text>
                ) : null}
              </View>

              {/* Dates */}
              <View style={s.metaCol}>
                <View style={s.dateBox}>
                  <View style={s.dateRow}>
                    <Text style={s.dateLabel}>Issue date</Text>
                    <Text style={s.dateValue}>{formatDate(invoice.issueDate)}</Text>
                  </View>
                  <View style={s.dateRow}>
                    <Text style={s.dateLabel}>Due date</Text>
                    <Text style={s.dateValue}>{formatDate(invoice.dueDate)}</Text>
                  </View>
                  <View style={[s.dateRow, { marginBottom: 0 }]}>
                    <Text style={s.dateLabel}>Status</Text>
                    <Text style={s.dateValue}>{invoice.status}</Text>
                  </View>
                </View>
              </View>
            </View>
          ) : null}

          {/* Items table */}
          <ItemsTable items={pageItems} currency={currency} />

          {/* Totals + notes (last page only) */}
          {pageIndex === pages.length - 1 ? (
            <>
              <View style={s.totalsSection}>
                <View style={s.totalsBox}>
                  <View style={s.totalRow}>
                    <Text style={s.totalLabel}>Subtotal</Text>
                    <Text style={s.totalValue}>{formatCurrency(invoice.subtotal.toString(), currency)}</Text>
                  </View>
                  {Number(invoice.discountTotal.toString()) > 0 ? (
                    <View style={s.totalRow}>
                      <Text style={s.totalLabel}>Discount</Text>
                      <Text style={s.totalValue}>
                        -{formatCurrency(invoice.discountTotal.toString(), currency)}
                      </Text>
                    </View>
                  ) : null}
                  <View style={s.totalRow}>
                    <Text style={s.totalLabel}>Tax</Text>
                    <Text style={s.totalValue}>{formatCurrency(invoice.taxTotal.toString(), currency)}</Text>
                  </View>
                  <View style={s.grandTotalRow}>
                    <Text style={s.grandTotalLabel}>Total</Text>
                    <Text style={s.grandTotalValue}>{formatCurrency(invoice.total.toString(), currency)}</Text>
                  </View>
                  {Number(invoice.amountPaid.toString()) > 0 ? (
                    <>
                      <View style={[s.totalRow, { marginTop: 8 }]}>
                        <Text style={s.totalLabel}>Amount paid</Text>
                        <Text style={s.totalValue}>
                          {formatCurrency(invoice.amountPaid.toString(), currency)}
                        </Text>
                      </View>
                      <View style={s.grandTotalRow}>
                        <Text style={s.grandTotalLabel}>Balance due</Text>
                        <Text style={s.grandTotalValue}>
                          {formatCurrency(balanceDueNum.toString(), currency)}
                        </Text>
                      </View>
                    </>
                  ) : null}
                </View>
              </View>

              {invoice.notes || invoice.terms ? (
                <View style={s.notesSection}>
                  {invoice.notes ? (
                    <View style={s.notesBlock}>
                      <Text style={s.notesLabel}>Notes</Text>
                      <Text style={s.notesText}>{invoice.notes}</Text>
                    </View>
                  ) : null}
                  {invoice.terms ? (
                    <View style={s.notesBlock}>
                      <Text style={s.notesLabel}>Terms</Text>
                      <Text style={s.notesText}>{invoice.terms}</Text>
                    </View>
                  ) : null}
                </View>
              ) : null}
            </>
          ) : null}
        </Page>
      ))}
    </Document>
  );
}
