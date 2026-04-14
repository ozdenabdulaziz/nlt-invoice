import type { PublicInvoiceRecord } from "@/features/invoices/server/queries";
import { paginateInvoiceItems } from "@/features/invoices/print/pagination";

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
  }).format(value);
}

function formatAddress(parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(", ");
}

function getPaymentLines(invoice: PublicInvoiceRecord) {
  if (Number(invoice.balanceDue.toString()) <= 0) {
    return [
      invoice.paidAt ? `Paid on ${formatDate(invoice.paidAt)}` : "Marked as paid",
      invoice.paymentMethod ? `Method: ${invoice.paymentMethod}` : null,
      invoice.paymentNote ? `Note: ${invoice.paymentNote}` : null,
    ].filter(Boolean) as string[];
  }

  return [
    "Pay offline by bank transfer or e-transfer.",
    `Reference: ${invoice.invoiceNumber}`,
    invoice.companyEmail ? `Contact: ${invoice.companyEmail}` : null,
    invoice.companyPhone ? `Phone: ${invoice.companyPhone}` : null,
  ].filter(Boolean) as string[];
}

export function PublicInvoicePrintDocument({
  invoice,
}: {
  invoice: PublicInvoiceRecord;
}) {
  const pages = paginateInvoiceItems(invoice.items);
  const totalPages = pages.length;
  const companyAddress = formatAddress([
    invoice.companyAddressLine1,
    invoice.companyAddressLine2,
    invoice.companyCity,
    invoice.companyProvince,
    invoice.companyPostalCode,
    invoice.companyCountry,
  ]);
  const billingAddress = formatAddress([
    invoice.customerBillingAddressLine1,
    invoice.customerBillingAddressLine2,
    invoice.customerBillingCity,
    invoice.customerBillingProvince,
    invoice.customerBillingPostalCode,
    invoice.customerBillingCountry,
  ]);
  const shippingAddress = invoice.customerShippingSameAsBilling
    ? billingAddress
    : formatAddress([
        invoice.customerShippingAddressLine1,
        invoice.customerShippingAddressLine2,
        invoice.customerShippingCity,
        invoice.customerShippingProvince,
        invoice.customerShippingPostalCode,
        invoice.customerShippingCountry,
      ]);
  const paymentLines = getPaymentLines(invoice);

  return (
    <div className="invoice-print-only invoice-print-root">
      {pages.map((pageItems, pageIndex) => {
        const pageNumber = pageIndex + 1;
        const isFirstPage = pageIndex === 0;
        const isLastPage = pageIndex === totalPages - 1;

        return (
          <section
            key={`invoice-print-page-${pageNumber}`}
            className="invoice-print-page"
          >
            {isFirstPage ? (
              <>
                <table className="invoice-print-header-table">
                  <tbody>
                    <tr>
                      <td>
                        <p className="invoice-print-eyebrow">Public invoice</p>
                        <h1 className="invoice-print-title">
                          {invoice.companyName || "NLT Invoice"}
                        </h1>
                        <p className="invoice-print-subtitle">
                          Invoice {invoice.invoiceNumber}
                        </p>
                      </td>
                      <td className="invoice-print-align-right">
                        <p className="invoice-print-status">{invoice.status}</p>
                        <p className="invoice-print-muted">
                          Page {pageNumber} of {totalPages}
                        </p>
                        <p className="invoice-print-muted">
                          Issue: {formatDate(invoice.issueDate)}
                        </p>
                        <p className="invoice-print-muted">
                          Due: {formatDate(invoice.dueDate)}
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <table className="invoice-print-meta-table">
                  <tbody>
                    <tr>
                      <td className="invoice-print-no-break">
                        <p className="invoice-print-section-label">From</p>
                        <p className="invoice-print-strong">
                          {invoice.companyName || "NLT Invoice"}
                        </p>
                        {invoice.companyEmail ? (
                          <p className="invoice-print-muted">{invoice.companyEmail}</p>
                        ) : null}
                        {invoice.companyPhone ? (
                          <p className="invoice-print-muted">{invoice.companyPhone}</p>
                        ) : null}
                        {invoice.companyWebsite ? (
                          <p className="invoice-print-muted">{invoice.companyWebsite}</p>
                        ) : null}
                        {companyAddress ? (
                          <p className="invoice-print-muted">{companyAddress}</p>
                        ) : null}
                        {invoice.companyTaxNumber ? (
                          <p className="invoice-print-muted">
                            Tax number: {invoice.companyTaxNumber}
                          </p>
                        ) : null}
                      </td>
                      <td className="invoice-print-no-break">
                        <p className="invoice-print-section-label">Bill to</p>
                        <p className="invoice-print-strong">
                          {invoice.customerName || "Customer"}
                        </p>
                        {invoice.customerCompanyName ? (
                          <p className="invoice-print-muted">
                            {invoice.customerCompanyName}
                          </p>
                        ) : null}
                        {invoice.customerEmail ? (
                          <p className="invoice-print-muted">{invoice.customerEmail}</p>
                        ) : null}
                        {invoice.customerPhone ? (
                          <p className="invoice-print-muted">{invoice.customerPhone}</p>
                        ) : null}
                        {billingAddress ? (
                          <p className="invoice-print-muted">{billingAddress}</p>
                        ) : null}
                        {shippingAddress && shippingAddress !== billingAddress ? (
                          <p className="invoice-print-muted">
                            Ship to: {shippingAddress}
                          </p>
                        ) : null}
                      </td>
                      <td className="invoice-print-no-break">
                        <p className="invoice-print-section-label">Invoice details</p>
                        <p className="invoice-print-muted">
                          Number: {invoice.invoiceNumber}
                        </p>
                        <p className="invoice-print-muted">
                          Currency: {invoice.currency}
                        </p>
                        <p className="invoice-print-muted">
                          Status: {invoice.status}
                        </p>
                        <p className="invoice-print-muted">
                          Public route: /i/{invoice.publicId}
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </>
            ) : (
              <table className="invoice-print-continuation-table">
                <tbody>
                  <tr>
                    <td>
                      <p className="invoice-print-strong">
                        {invoice.companyName || "NLT Invoice"}
                      </p>
                      <p className="invoice-print-muted">
                        Invoice {invoice.invoiceNumber} continuation
                      </p>
                    </td>
                    <td className="invoice-print-align-right">
                      <p className="invoice-print-strong">
                        Page {pageNumber} of {totalPages}
                      </p>
                      <p className="invoice-print-muted">
                        Customer: {invoice.customerName || "Customer"}
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            )}

            <table
              className={`invoice-print-items-table ${
                isFirstPage
                  ? "invoice-print-items-table--first"
                  : "invoice-print-items-table--continuation"
              }`}
            >
              <thead>
                <tr>
                  <th>Item</th>
                  <th className="invoice-print-col-qty">Qty</th>
                  <th className="invoice-print-col-unit">Unit</th>
                  <th className="invoice-print-col-tax">Tax</th>
                  <th className="invoice-print-col-total">Total</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((item) => (
                  <tr key={item.id} className="invoice-print-item-row">
                    <td>
                      <p className="invoice-print-item-name">{item.name}</p>
                      {item.description ? (
                        <p className="invoice-print-item-description">
                          {item.description}
                        </p>
                      ) : null}
                      <p className="invoice-print-item-description">Per {item.unitType}</p>
                    </td>
                    <td className="invoice-print-col-qty">
                      {item.quantity.toString()}
                    </td>
                    <td className="invoice-print-col-unit">
                      {formatCurrency(item.unitPrice.toString(), invoice.currency)}
                    </td>
                    <td className="invoice-print-col-tax">
                      {item.taxRate.toString()}%
                    </td>
                    <td className="invoice-print-col-total">
                      {formatCurrency(item.lineTotal.toString(), invoice.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {isLastPage ? (
              <table className="invoice-print-final-table">
                <tbody>
                  <tr>
                    <td className="invoice-print-final-notes-cell">
                      <div className="invoice-print-summary-box invoice-print-no-break">
                        <p className="invoice-print-section-label">Payment</p>
                        {paymentLines.map((line) => (
                          <p key={line} className="invoice-print-muted">
                            {line}
                          </p>
                        ))}
                      </div>

                      {invoice.notes ? (
                        <div className="invoice-print-summary-box invoice-print-no-break">
                          <p className="invoice-print-section-label">Notes</p>
                          <p className="invoice-print-muted">{invoice.notes}</p>
                        </div>
                      ) : null}

                      {invoice.terms ? (
                        <div className="invoice-print-summary-box invoice-print-no-break">
                          <p className="invoice-print-section-label">Terms</p>
                          <p className="invoice-print-muted">{invoice.terms}</p>
                        </div>
                      ) : null}
                    </td>
                    <td className="invoice-print-final-totals-cell">
                      <div className="invoice-print-summary-box invoice-print-no-break">
                        <table className="invoice-print-totals-table">
                          <tbody>
                            <tr>
                              <td>Subtotal</td>
                              <td className="invoice-print-align-right">
                                {formatCurrency(
                                  invoice.subtotal.toString(),
                                  invoice.currency,
                                )}
                              </td>
                            </tr>
                            <tr>
                              <td>Discount</td>
                              <td className="invoice-print-align-right">
                                {formatCurrency(
                                  invoice.discountTotal.toString(),
                                  invoice.currency,
                                )}
                              </td>
                            </tr>
                            <tr>
                              <td>Tax</td>
                              <td className="invoice-print-align-right">
                                {formatCurrency(
                                  invoice.taxTotal.toString(),
                                  invoice.currency,
                                )}
                              </td>
                            </tr>
                            <tr className="invoice-print-total-row">
                              <td>Total</td>
                              <td className="invoice-print-align-right">
                                {formatCurrency(
                                  invoice.total.toString(),
                                  invoice.currency,
                                )}
                              </td>
                            </tr>
                            <tr>
                              <td>Amount paid</td>
                              <td className="invoice-print-align-right">
                                {formatCurrency(
                                  invoice.amountPaid.toString(),
                                  invoice.currency,
                                )}
                              </td>
                            </tr>
                            <tr>
                              <td>Balance due</td>
                              <td className="invoice-print-align-right">
                                {formatCurrency(
                                  invoice.balanceDue.toString(),
                                  invoice.currency,
                                )}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
