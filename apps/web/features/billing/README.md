# Billing Feature

## Purpose

The billing feature owns plan definitions, usage summaries, and server-side Free plan enforcement.

## Structure

- `components/`: billing page presentation
- `server/plans.ts`: plan catalog, limits, and user-facing limit messages
- `server/service.ts`: usage metric helpers, active-plan resolution, enforcement, and billing summaries
- `server/queries.ts`: dashboard-facing reads for the billing page

## Source Of Truth

- Billing rules live inside `apps/web/features/billing`.
- Customer, estimate, invoice, and conversion flows call billing helpers instead of duplicating plan checks.
- The MVP does not expose a standalone billing API surface beyond Auth.js.

## Business Rules

- Free plan allows up to 5 customers, 10 invoices per month, and 10 estimates per month.
- Pro and Business are unlimited in MVP.
- Usage is enforced on the server for customer, estimate, and invoice creation.
- Enforcement reads live company-scoped counts; `UsageMetric` is maintained in parallel as the tracked usage ledger.
- Estimate to invoice conversion counts as an invoice creation event.
- Conversion does not add an extra estimate usage event.
- Billing page shows real plan and usage data from the active company.

## MVP Limitations

- Stripe checkout and webhooks are intentionally deferred.
- Upgrade CTAs are informational links for now.
- Monthly usage is keyed in UTC with `YYYY-MM`.
