# Customer Feature

## Purpose

The customer feature owns company-scoped customer records used by invoices and estimates.

## Structure

- `components/`: customer-specific UI such as the list, detail view, form, and delete button
- `server/actions.ts`: dashboard-facing mutations for create, update, and delete
- `server/queries.ts`: dashboard-facing reads for list and detail pages
- `server/service.ts`: shared customer domain rules used by both dashboard flows and compatibility API routes

## Source Of Truth

- Customer business rules must live inside `apps/web/features/customers`.
- `app/api/customers` may exist for compatibility, but it should delegate to this feature instead of reimplementing customer logic.

## Business Rules

- Every customer read and write must be scoped by the current company.
- Free plan companies can create up to 5 customers.
- Pro and Business plans are unlimited for customers.
- Customers with related invoices or estimates cannot be deleted.
- Shipping fields can differ from billing fields, or inherit them when `shippingSameAsBilling` is true.
