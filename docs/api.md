# API

## Authentication

- `GET|POST /api/auth/[...nextauth]`

Auth.js route handler for credentials login and session management.

## Invoices

Invoice management is handled inside the application, not through a standalone route-handler API surface.

Canonical paths:

- `apps/web/features/invoices/server/actions.ts`
- `apps/web/features/invoices/server/queries.ts`
- `apps/web/features/invoices/server/service.ts`

Rules:

- dashboard invoice pages call feature-local actions and queries directly
- invoice numbers come from company-level `invoicePrefix` and `nextInvoiceNumber`
- create enforces the Free plan invoice limit of 10 per month
- server logic recalculates stored totals, amount paid, balance due, and line item snapshots
- due date must be on or after the issue date
- amount paid cannot exceed the invoice total in MVP
- estimate-to-invoice conversion creates a new draft invoice with `issueDate = today`, `dueDate = today + 30 days`, `amountPaid = 0`, and `balanceDue = total`
- conversion copies the estimate snapshot into invoice fields and links the new invoice through `estimateId`
- conversion prevents duplicate invoice creation for the same estimate in MVP flow
- conversion also consumes one invoice usage event for monthly Free plan enforcement
- conversion runs in a serializable transaction and returns a retry message if a concurrent write conflict occurs
- public invoice pages can move `SENT` invoices to `VIEWED`
- every read and write is scoped by the active company where authentication applies

## Estimates

Estimate management is handled inside the application, not through a standalone route-handler API surface.

Canonical paths:

- `apps/web/features/estimates/server/actions.ts`
- `apps/web/features/estimates/server/queries.ts`
- `apps/web/features/estimates/server/service.ts`

Rules:

- dashboard estimate pages call feature-local actions and queries directly
- estimate numbers come from company-level `estimatePrefix` and `nextEstimateNumber`
- create enforces the Free plan estimate limit of 10 per month
- server logic recalculates stored totals and line item snapshots
- estimate detail triggers conversion through `features/estimates/server/actions.ts`
- conversion is allowed only for `SENT`, `VIEWED`, or `ACCEPTED` estimates
- conversion does not consume a second estimate usage event
- public estimate pages can move `SENT` estimates to `VIEWED`
- every read and write is scoped by the active company where authentication applies

## Customer Domain

Customer management is handled inside the application, not through a standalone route-handler API surface.

Canonical paths:

- `apps/web/features/customers/server/actions.ts`
- `apps/web/features/customers/server/queries.ts`
- `apps/web/features/customers/server/service.ts`

Rules:

- dashboard customer pages call feature-local actions and queries directly
- customer business logic stays inside the customer feature
- create enforces the Free plan limit of 5 customers
- delete is blocked when related invoices or estimates exist
- every read and write is scoped by the active company

## Billing Domain

Billing management is handled inside the application, not through a standalone route-handler API surface.

Canonical paths:

- `apps/web/features/billing/server/plans.ts`
- `apps/web/features/billing/server/service.ts`
- `apps/web/features/billing/server/queries.ts`

Rules:

- billing page reads the active company plan and current usage from feature-local queries
- Free plan allows up to 5 customers, 10 invoices per month, and 10 estimates per month
- Pro and Business are unlimited in MVP
- enforcement runs on the server during customer, estimate, invoice, and estimate-to-invoice creation
- usage metrics use `all-time` for customer counts and `YYYY-MM` for monthly invoice and estimate tracking
- enforcement and billing page summaries read live company-scoped counts so metric drift cannot bypass limits
- billing page is informational; Stripe checkout remains deferred
