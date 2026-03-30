# API

## Authentication

- `GET|POST /api/auth/[...nextauth]`

Auth.js route handler for credentials login and session management.

## Invoices

- `GET /api/invoices`
- `POST /api/invoices`
- `GET /api/invoices/:id`
- `PATCH /api/invoices/:id`
- `DELETE /api/invoices/:id`
- `POST /api/invoices/:id/send`
- `POST /api/invoices/:id/mark-paid`
- `POST /api/invoices/:id/duplicate`

Rules:

- requires authenticated company context
- generates company-scoped invoice numbers
- enforces monthly invoice limits on create and duplicate
- persists calculated totals and line item snapshots

## Estimates

- `GET /api/estimates`
- `POST /api/estimates`
- `GET /api/estimates/:id`
- `PATCH /api/estimates/:id`
- `DELETE /api/estimates/:id`
- `POST /api/estimates/:id/send`
- `POST /api/estimates/:id/accept`
- `POST /api/estimates/:id/reject`
- `POST /api/estimates/:id/duplicate`

Rules:

- requires authenticated company context
- generates company-scoped estimate numbers
- enforces monthly estimate limits on create and duplicate
- public estimate pages can move `SENT` to `VIEWED`

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
