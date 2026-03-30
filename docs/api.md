# API

## Authentication

- `GET|POST /api/auth/[...nextauth]`

Auth.js route handler for credentials login and session management.

## Customers

- `GET /api/customers`
- `POST /api/customers`
- `GET /api/customers/:id`
- `PATCH /api/customers/:id`
- `DELETE /api/customers/:id`

Rules:

- requires authenticated company context
- delegates to `apps/web/features/customers/server/service.ts`
- uses the same validation and normalization rules as dashboard customer actions
- enforces Free plan customer limit on create
- blocks delete when related invoices or estimates exist
- decrements customer usage metric on delete only after a successful delete
- scopes every read and write by both `customerId` and `companyId` where relevant

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
