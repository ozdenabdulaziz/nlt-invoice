# Data Model

## Company Numbering

- `Company.estimatePrefix` is used when generating new estimate numbers.
- `Company.nextEstimateNumber` is incremented only after a successful estimate create.
- Estimate numbering is company-scoped and formatted with `formatDocumentNumber()`.

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
- Stored totals are treated as the source for internal detail views and public estimate rendering.
- Client-side totals are preview-only and are never trusted as final persisted values.

## Public Sharing

- `Estimate.publicId` is the only public lookup key used by `/e/[publicId]`.
- Public estimate views can move `SENT` records to `VIEWED`.
- Public rendering uses the stored company, customer, and line item snapshot data.

## MVP Limitations

- Estimate acceptance, rejection, duplication, and invoice conversion are not fully implemented in the dashboard yet.
- PDF generation is browser print-based rather than a dedicated document service.
