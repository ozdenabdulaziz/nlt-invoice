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
- Free plan limits are enforced in backend route handlers using `UsageMetric`.

## Feature Boundaries

- Route files stay thin inside `apps/web/app`.
- Customer business logic lives in `apps/web/features/customers`.
- `features/customers/server/actions.ts` and `features/customers/server/queries.ts` are the primary dashboard entry points for customer workflows.
- `features/customers/server/service.ts` holds shared customer domain rules so dashboard flows and compatibility route handlers use the same implementation.
- `app/api/customers` remains available, but only as a thin compatibility layer over the customer feature. It is not a second source of truth.

## Rendering

- Marketing, auth, onboarding, dashboard, API routes, and public documents live in the same Next.js app.
- Dashboard routes call feature-local queries and actions on the server.
- Some older dashboard screens may still use route handlers, but customer screens are feature-first and server-rendered.
- Public invoice and estimate pages render print-friendly HTML and use browser print for PDF.
