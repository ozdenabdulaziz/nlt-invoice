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
- `publicId` is generated uniquely and used by `/i/[publicId]`.
- Server logic recalculates subtotal, tax, discount, total, amount paid, and balance due instead of trusting the client.
- Due date must be on or after the issue date.
- Amount paid cannot exceed the invoice total in MVP.
- Public invoice views can move `SENT` invoices to `VIEWED`.

## MVP Limitations

- Online payment collection is intentionally excluded.
- Record-payment, send, and duplicate dashboard actions remain placeholders for a later phase.
- PDF download relies on browser print from the public invoice page.
