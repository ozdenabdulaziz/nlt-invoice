# Estimate Feature

## Purpose

The estimate feature owns company-scoped estimate creation, editing, internal review, and public sharing.

## Structure

- `components/`: estimate-specific UI for list, form, detail, status badges, and prerequisite messaging
- `server/actions.ts`: dashboard-facing mutations for create, update, and estimate-to-invoice conversion
- `server/queries.ts`: dashboard-facing reads for list, detail, public rendering, and customer options
- `server/service.ts`: shared estimate domain logic for numbering, totals, public lookup, and company scoping

## Source Of Truth

- Estimate business rules live inside `apps/web/features/estimates`.
- Dashboard estimate routes call feature-local actions and queries directly.
- The MVP does not keep a dedicated `app/api/estimates` surface.

## Business Rules

- Every estimate read and write must be scoped by the current company.
- Estimate numbers come from company-level `estimatePrefix` and `nextEstimateNumber`.
- `publicId` is generated uniquely and used by `/e/[publicId]`.
- Server logic recalculates subtotal, tax, discount, and total values instead of trusting the client.
- Estimate detail can convert eligible estimates into draft invoices.
- Conversion is allowed only for `SENT`, `VIEWED`, or `ACCEPTED` estimates in the MVP.
- If an estimate is already linked to an invoice, the detail page shows the linked invoice instead of allowing another conversion.
- Concurrent conversion conflicts return a retry message instead of exposing a raw server failure.
- Public estimate views can move `SENT` estimates to `VIEWED`.

## MVP Limitations

- Advanced send, accept, reject, and duplicate dashboard actions are not implemented yet.
- PDF download relies on browser print from the public estimate page.
