# Architecture

## Monorepo

- `apps/web`: Next.js application
- `packages/ui`: shared UI primitives
- `packages/config`: shared TypeScript configuration

## Route Map

### Public

- `/`
- `/features`
- `/pricing`
- `/support`
- `/login`
- `/register`
- `/onboarding`
- `/i/[publicId]`
- `/e/[publicId]`

### Protected

- `/dashboard`
- `/dashboard/customers`
- `/dashboard/customers/new`
- `/dashboard/customers/[id]`
- `/dashboard/customers/[id]/edit`
- `/dashboard/invoices`
- `/dashboard/invoices/new`
- `/dashboard/invoices/[id]`
- `/dashboard/invoices/[id]/edit`
- `/dashboard/estimates`
- `/dashboard/estimates/new`
- `/dashboard/estimates/[id]`
- `/dashboard/settings`
- `/dashboard/settings/billing`

## Auth Flow

1. User registers with email and password.
2. Registration creates only the `User`.
3. User signs in through Auth.js credentials auth.
4. JWT session is enriched with `userId`, `activeCompanyId`, `membershipRole`, `plan`, and `hasCompletedOnboarding`.
5. Middleware protects `/dashboard/*`.
6. If onboarding is incomplete, dashboard access redirects to `/onboarding`.
7. Onboarding creates:
   - `Company`
   - `Membership(role=OWNER)`
   - `Subscription(plan=FREE, status=ACTIVE)`
   - `invoicePrefix=INV`
   - `estimatePrefix=EST`
   - `nextInvoiceNumber=1001`
   - `nextEstimateNumber=1001`

## Data Rules

- All protected data is scoped by `companyId`.
- Every customer, invoice, estimate, and usage metric belongs to one company.
- Public document routes expose only intended document data via `publicId`.
- Free plan limits are enforced in backend feature logic using `UsageMetric`.

## Feature Boundaries

- Route files stay thin inside `apps/web/app`.
- Customer business logic lives in `apps/web/features/customers`.
- Invoice business logic lives in `apps/web/features/invoices`.
- Estimate business logic lives in `apps/web/features/estimates`.
- `features/customers/server/actions.ts` and `features/customers/server/queries.ts` are the primary dashboard entry points for customer workflows.
- `features/customers/server/service.ts` holds shared customer domain rules used by customer actions and queries.
- Customer does not maintain a separate `app/api` surface in the MVP because dashboard flows are internal application flows, not a public API product.
- `features/invoices/server/actions.ts` and `features/invoices/server/queries.ts` are the primary dashboard entry points for invoice workflows.
- `features/invoices/server/service.ts` owns invoice numbering, totals recalculation, balance due, public invoice lookup, and company scoping.
- `features/invoices/server/service.ts` also owns transactional estimate-to-invoice conversion so invoice creation rules stay in one place.
- Invoice does not maintain a separate `app/api` surface in the MVP because dashboard flows are internal application flows, not a public API product.
- `features/estimates/server/actions.ts` and `features/estimates/server/queries.ts` are the primary dashboard entry points for estimate workflows.
- `features/estimates/server/service.ts` owns estimate numbering, totals recalculation, public estimate lookup, and company scoping.
- `features/estimates/server/actions.ts` triggers estimate-to-invoice conversion from the estimate detail flow while delegating invoice creation to the invoice feature.
- Estimate does not maintain a separate `app/api` surface in the MVP because dashboard flows are internal application flows, not a public API product.

## Rendering

- Marketing, auth, onboarding, dashboard, API routes, and public documents live in the same Next.js app.
- Dashboard routes call feature-local queries and actions on the server.
- Customer, invoice, and estimate screens are feature-first and server-rendered with no feature-specific API wrapper.
- Public invoice and estimate pages render print-friendly HTML and use browser print for PDF.
- Estimate detail can convert eligible estimates into draft invoices and then redirect to invoice detail.
- Concurrent conversion attempts are handled transactionally and surfaced as retryable user-facing errors instead of raw failures.
