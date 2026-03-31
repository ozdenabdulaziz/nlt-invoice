# Invoice Feature

## Purpose

The invoice feature owns company-scoped invoice creation, editing, internal review, and public sharing.

## Structure

- `components/`: invoice-specific UI for list, form, detail, status badges, and prerequisite messaging
- `server/actions.ts`: dashboard-facing mutations for create and update
- `server/queries.ts`: dashboard-facing reads for list, detail, public rendering, and customer options
- `server/service.ts`: shared invoice domain logic for numbering, totals, balance due, public lookup, and company scoping

## Source Of Truth

- Invoice business rules live inside `apps/web/features/invoices`.
- Dashboard invoice routes call feature-local actions and queries directly.
- The MVP does not keep a dedicated `app/api/invoices` surface.

## Business Rules

- Every invoice read and write must be scoped by the current company.
- Invoice numbers come from company-level `invoicePrefix` and `nextInvoiceNumber`.
- Invoice creation delegates monthly Free plan enforcement to the billing feature.
- Free plan companies can create up to 10 invoices per month.
- `publicId` is generated uniquely and used by `/i/[publicId]`.
- Invoice create locks the active company row before checking plan limits and reserving the next invoice number.
- Server logic recalculates subtotal, tax, discount, total, amount paid, and balance due instead of trusting the client.
- Invoice create and update copy company and customer data into snapshot fields, and detail/public rendering reads those snapshot fields instead of live relations.
- Due date must be on or after the issue date.
- Amount paid cannot exceed the invoice total in MVP.
- Estimate conversion creates a draft invoice with `issueDate = today`, `dueDate = today + 30 days`, `amountPaid = 0`, and `balanceDue = total`.
- Conversion copies the estimate snapshot into the new invoice and stores the origin via `estimateId`.
- Conversion blocks duplicate invoice creation for the same estimate in the MVP flow.
- Conversion runs inside a serializable transaction and asks the user to retry if a concurrent conflict occurs.
- Public invoice views can move `SENT` invoices to `VIEWED`.

## MVP Limitations

- Online payment collection is intentionally excluded.
- Public invoice pages are view-only for customers. Payments are collected offline by bank transfer or e-transfer, and staff record payment manually from the dashboard.
- Stripe infrastructure remains in the codebase for future SaaS subscription billing, but it is not used for invoice collection.
- Record-payment, send, and duplicate dashboard actions remain placeholders for a later phase.
- PDF download relies on browser print from the public invoice page.
