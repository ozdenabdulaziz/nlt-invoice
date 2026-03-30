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
- create enforces the Free plan invoice limit of 5 per month
- server logic recalculates stored totals, amount paid, balance due, and line item snapshots
- due date must be on or after the issue date
- amount paid cannot exceed the invoice total in MVP
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
- create enforces the Free plan estimate limit of 3 per month
- server logic recalculates stored totals and line item snapshots
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
