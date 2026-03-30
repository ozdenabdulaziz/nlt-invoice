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
- `publicId`
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
- Invoice balance due is recalculated from stored totals and amount paid on every create and update.
- Stored totals are treated as the source for internal detail views and public invoice and estimate rendering.
- Client-side totals are preview-only and are never trusted as final persisted values.

## Public Sharing

- `Invoice.publicId` is the only public lookup key used by `/i/[publicId]`.
- Public invoice views can move `SENT` records to `VIEWED`.
- `Estimate.publicId` is the only public lookup key used by `/e/[publicId]`.
- Public estimate views can move `SENT` records to `VIEWED`.
- Public rendering uses the stored company, customer, and line item snapshot data.

## MVP Limitations

- Online payment collection, payment capture, and duplicate/send actions are not fully implemented in the dashboard yet.
- Estimate acceptance, rejection, duplication, and invoice conversion are not fully implemented in the dashboard yet.
- PDF generation is browser print-based rather than a dedicated document service.
