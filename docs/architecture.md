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

## Rendering

- Marketing, auth, onboarding, dashboard, API routes, and public documents live in the same Next.js app.
- TanStack Query powers dashboard list screens from route handlers.
- Public invoice and estimate pages render print-friendly HTML and use browser print for PDF.
