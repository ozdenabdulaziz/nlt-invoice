# Data Model

## Company Numbering

- `Company.invoicePrefix` is used when generating new invoice numbers.
- `Company.nextInvoiceNumber` is incremented only after a successful invoice create.
- `Company.estimatePrefix` is used when generating new estimate numbers.
- `Company.nextEstimateNumber` is incremented only after a successful estimate create.
- Invoice and estimate numbering are company-scoped and formatted with `formatDocumentNumber()`.

## Invoice

The invoice record stores a full document snapshot for MVP rendering and future payment workflows.

Important fields:

- `invoiceNumber`
- `estimateId`
- `publicId`
- `companyName`
- `companyEmail`
- `companyPhone`
- `companyWebsite`
- `companyAddressLine1`
- `companyAddressLine2`
- `companyCity`
- `companyProvince`
- `companyPostalCode`
- `companyCountry`
- `companyTaxNumber`
- `customerName`
- `customerCompanyName`
- `customerEmail`
- `customerPhone`
- `customerBillingAddressLine1`
- `customerBillingAddressLine2`
- `customerBillingCity`
- `customerBillingProvince`
- `customerBillingPostalCode`
- `customerBillingCountry`
- `customerShippingSameAsBilling`
- `customerShippingAddressLine1`
- `customerShippingAddressLine2`
- `customerShippingCity`
- `customerShippingProvince`
- `customerShippingPostalCode`
- `customerShippingCountry`
- `status`
- `issueDate`
- `dueDate`
- `currency`
- `subtotal`
- `taxTotal`
- `discountType`
- `discountValue`
- `discountTotal`
- `total`
- `amountPaid`
- `balanceDue`
- `notes`
- `terms`

## InvoiceLineItem

Each line item stores its own snapshot values:

- `name`
- `description`
- `quantity`
- `unitPrice`
- `taxRate`
- `lineTotal`
- `sortOrder`

## Estimate

The estimate record stores a full document snapshot for MVP rendering and future invoice conversion.

Important fields:

- `estimateNumber`
- `publicId`
- `companyName`
- `companyEmail`
- `companyPhone`
- `companyWebsite`
- `companyAddressLine1`
- `companyAddressLine2`
- `companyCity`
- `companyProvince`
- `companyPostalCode`
- `companyCountry`
- `companyTaxNumber`
- `customerName`
- `customerCompanyName`
- `customerEmail`
- `customerPhone`
- `customerBillingAddressLine1`
- `customerBillingAddressLine2`
- `customerBillingCity`
- `customerBillingProvince`
- `customerBillingPostalCode`
- `customerBillingCountry`
- `customerShippingSameAsBilling`
- `customerShippingAddressLine1`
- `customerShippingAddressLine2`
- `customerShippingCity`
- `customerShippingProvince`
- `customerShippingPostalCode`
- `customerShippingCountry`
- `status`
- `issueDate`
- `expiryDate`
- `currency`
- `subtotal`
- `taxTotal`
- `discountType`
- `discountValue`
- `discountTotal`
- `total`
- `notes`
- `terms`

## EstimateLineItem

Each line item stores its own snapshot values:

- `name`
- `description`
- `quantity`
- `unitPrice`
- `taxRate`
- `lineTotal`
- `sortOrder`

## Snapshot Rules

- The server recalculates line totals and document totals on create and update.
- Company and customer fields are copied into invoice and estimate snapshot columns on create and update.
- Invoice balance due is recalculated from stored totals and amount paid on every create and update.
- Estimate-to-invoice conversion copies the estimate snapshot into a new invoice snapshot instead of requiring manual re-entry.
- Converted invoices default to `issueDate = conversion date`, `dueDate = conversion date + 30 days`, `status = DRAFT`, `amountPaid = 0`, and `balanceDue = total`.
- Stored totals are treated as the source for internal detail views and public invoice and estimate rendering.
- Client-side totals are preview-only and are never trusted as final persisted values.

## Estimate To Invoice Linkage

- `Invoice.estimateId` stores the originating estimate when conversion is used.
- The Prisma schema intentionally keeps `estimateId` non-unique for future recovery flexibility.
- The MVP conversion flow enforces one estimate → one invoice at the application level before creating a new invoice.
- Conversion increments invoice usage for the current month and does not increment estimate usage again.

## Usage Metrics

- `UsageMetric` stores server-side plan usage counters.
- Customer usage is tracked under `metricType = CUSTOMERS_COUNT` with `periodKey = all-time`.
- Invoice usage is tracked under `metricType = INVOICES_THIS_MONTH` with `periodKey = YYYY-MM`.
- Estimate usage is tracked under `metricType = ESTIMATES_THIS_MONTH` with `periodKey = YYYY-MM`.
- Billing summaries and plan enforcement read live company-scoped counts, while `UsageMetric` remains the tracked usage ledger for writes and future reporting.

## Public Sharing

- `Invoice.publicId` is the only public lookup key used by `/i/[publicId]`.
- Public invoice views can move `SENT` records to `VIEWED`.
- `Estimate.publicId` is the only public lookup key used by `/e/[publicId]`.
- Public estimate views can move `SENT` records to `VIEWED`.
- Public rendering uses the stored company, customer, totals, and line item snapshot data.

## MVP Limitations

- Online payment collection, payment capture, and duplicate/send actions are not fully implemented in the dashboard yet.
- Estimate acceptance, rejection, and duplication are not fully implemented in the dashboard yet.
- PDF generation is browser print-based rather than a dedicated document service.
