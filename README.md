# NLT Invoice

NLT Invoice is an English-first invoicing SaaS for small businesses in Canada.

This repository is now a `pnpm` + Turbo monorepo. The active web application lives in `apps/web`.

## Workspace

```txt
new/
├── apps/
│   └── web/
├── docs/
├── packages/
│   ├── config/
│   └── ui/
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- shadcn/ui primitives in `packages/ui`
- Auth.js with Prisma Adapter and JWT sessions
- PostgreSQL + Prisma
- TanStack Query
- React Hook Form + Zod

## Key Routes

- Marketing: `/`, `/features`, `/pricing`, `/support`
- Auth: `/login`, `/register`
- Onboarding: `/onboarding`
- Protected app: `/dashboard`, `/dashboard/customers`, `/dashboard/estimates`, `/dashboard/invoices`, `/dashboard/settings`, `/dashboard/settings/billing`
- Public documents: `/i/[publicId]`, `/e/[publicId]`

## Local Setup

1. Install dependencies:

```bash
pnpm install
```

2. Copy the app env file:

```bash
cp apps/web/.env.example apps/web/.env.local
```

3. Generate Prisma client and run migrations:

```bash
pnpm db:generate
pnpm db:migrate
```

4. Start the app:

```bash
pnpm dev
```

## Scripts

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm db:generate
pnpm db:migrate
pnpm db:studio
pnpm --filter web build
```

## Current Foundation

- Monorepo workspace with `apps/web`, `packages/ui`, and `packages/config`
- Auth.js credentials auth with JWT session strategy
- Onboarding flow that creates `Company`, `Membership`, `Subscription`, and document numbering defaults
- Canonical route handler surface for customers, invoices, and estimates
- Public invoice and estimate pages with print-friendly HTML
- Backend-enforced Free plan limits through `UsageMetric`

## Notes

- The legacy app is intentionally outside this workspace and not part of this monorepo.
- Stripe billing remains placeholder-only in this phase.
- Online payments, multi-user access, and advanced tax automation stay out of MVP.
