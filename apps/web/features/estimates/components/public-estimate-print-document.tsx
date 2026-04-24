import type { PublicEstimateRecord } from "@/features/estimates/server/queries";
import { paginateInvoiceItems as paginateEstimateItems } from "@/features/invoices/print/pagination";

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



export function PublicEstimatePrintDocument({
  estimate,
  previewMode = false,
}: {
  estimate: PublicEstimateRecord;
  previewMode?: boolean;
}) {
  const pages = paginateEstimateItems(estimate.items);
  const totalPages = pages.length;
  const companyAddress = formatAddress([
    estimate.companyAddressLine1,
    estimate.companyAddressLine2,
    estimate.companyCity,
    estimate.companyProvince,
    estimate.companyPostalCode,
    estimate.companyCountry,
  ]);
  const billingAddress = formatAddress([
    estimate.customerBillingAddressLine1,
    estimate.customerBillingAddressLine2,
    estimate.customerBillingCity,
    estimate.customerBillingProvince,
    estimate.customerBillingPostalCode,
    estimate.customerBillingCountry,
  ]);
  const shippingAddress = estimate.customerShippingSameAsBilling
    ? billingAddress
    : formatAddress([
        estimate.customerShippingAddressLine1,
        estimate.customerShippingAddressLine2,
        estimate.customerShippingCity,
        estimate.customerShippingProvince,
        estimate.customerShippingPostalCode,
        estimate.customerShippingCountry,
      ]);


  return (
    <div className={`invoice-print-root ${previewMode ? "" : "invoice-print-only"}`}>
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
                        <p className="invoice-print-eyebrow">Public estimate</p>
                        <h1 className="invoice-print-title">
                          {estimate.companyName || "NLT Estimate"}
                        </h1>
                        <p className="invoice-print-subtitle">
                          Estimate {estimate.estimateNumber}
                        </p>
                      </td>
                      <td className="invoice-print-align-right">
                        <p className="invoice-print-status">{estimate.status}</p>
                        <p className="invoice-print-muted">
                          Page {pageNumber} of {totalPages}
                        </p>
                        <p className="invoice-print-muted">
                          Issue: {formatDate(estimate.issueDate)}
                        </p>
                        <p className="invoice-print-muted">
                          Due: {formatDate(estimate.expiryDate)}
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
                          {estimate.companyName || "NLT Estimate"}
                        </p>
                        {estimate.companyEmail ? (
                          <p className="invoice-print-muted">{estimate.companyEmail}</p>
                        ) : null}
                        {estimate.companyPhone ? (
                          <p className="invoice-print-muted">{estimate.companyPhone}</p>
                        ) : null}
                        {estimate.companyWebsite ? (
                          <p className="invoice-print-muted">{estimate.companyWebsite}</p>
                        ) : null}
                        {companyAddress ? (
                          <p className="invoice-print-muted">{companyAddress}</p>
                        ) : null}
                        {estimate.companyTaxNumber ? (
                          <p className="invoice-print-muted">
                            Tax number: {estimate.companyTaxNumber}
                          </p>
                        ) : null}
                      </td>
                      <td className="invoice-print-no-break">
                        <p className="invoice-print-section-label">Bill to</p>
                        <p className="invoice-print-strong">
                          {estimate.customerName || "Customer"}
                        </p>
                        {estimate.customerCompanyName ? (
                          <p className="invoice-print-muted">
                            {estimate.customerCompanyName}
                          </p>
                        ) : null}
                        {estimate.customerEmail ? (
                          <p className="invoice-print-muted">{estimate.customerEmail}</p>
                        ) : null}
                        {estimate.customerPhone ? (
                          <p className="invoice-print-muted">{estimate.customerPhone}</p>
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
                        <p className="invoice-print-section-label">Estimate details</p>
                        <p className="invoice-print-muted">
                          Number: {estimate.estimateNumber}
                        </p>
                        <p className="invoice-print-muted">
                          Currency: {estimate.currency}
                        </p>
                        <p className="invoice-print-muted">
                          Status: {estimate.status}
                        </p>
                        <p className="invoice-print-muted">
                          Public route: /i/{estimate.publicId}
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
                        {estimate.companyName || "NLT Estimate"}
                      </p>
                      <p className="invoice-print-muted">
                        Estimate {estimate.estimateNumber} continuation
                      </p>
                    </td>
                    <td className="invoice-print-align-right">
                      <p className="invoice-print-strong">
                        Page {pageNumber} of {totalPages}
                      </p>
                      <p className="invoice-print-muted">
                        Customer: {estimate.customerName || "Customer"}
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
                      {formatCurrency(item.unitPrice.toString(), estimate.currency)}
                    </td>
                    <td className="invoice-print-col-tax">
                      {item.taxRate.toString()}%
                    </td>
                    <td className="invoice-print-col-total">
                      {formatCurrency(item.lineTotal.toString(), estimate.currency)}
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
                      {estimate.notes ? (
                        <div className="invoice-print-summary-box invoice-print-no-break">
                          <p className="invoice-print-section-label">Notes</p>
                          <p className="invoice-print-muted">{estimate.notes}</p>
                        </div>
                      ) : null}

                      {estimate.terms ? (
                        <div className="invoice-print-summary-box invoice-print-no-break">
                          <p className="invoice-print-section-label">Terms</p>
                          <p className="invoice-print-muted">{estimate.terms}</p>
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
                                  estimate.subtotal.toString(),
                                  estimate.currency,
                                )}
                              </td>
                            </tr>
                            <tr>
                              <td>Discount</td>
                              <td className="invoice-print-align-right">
                                {formatCurrency(
                                  estimate.discountTotal.toString(),
                                  estimate.currency,
                                )}
                              </td>
                            </tr>
                            <tr>
                              <td>Tax</td>
                              <td className="invoice-print-align-right">
                                {formatCurrency(
                                  estimate.taxTotal.toString(),
                                  estimate.currency,
                                )}
                              </td>
                            </tr>
                            <tr className="invoice-print-total-row">
                              <td>Total</td>
                              <td className="invoice-print-align-right">
                                {formatCurrency(
                                  estimate.total.toString(),
                                  estimate.currency,
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
