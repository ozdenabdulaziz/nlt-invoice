# Routes

## Public

- `/`: marketing landing page
- `/features`: product overview
- `/pricing`: plan comparison and upgrade entry point
- `/support`: support and contact entry point
- `/login`: credentials sign-in
- `/register`: credentials registration
- `/onboarding`: first-company setup after registration
- `/i/[publicId]`: public invoice view
- `/e/[publicId]`: public estimate view

## Protected Dashboard

- `/dashboard`: company-scoped dashboard home
- `/dashboard/customers`: customer list with search and success feedback
- `/dashboard/customers/new`: create customer form
- `/dashboard/customers/[id]`: customer detail, document activity, and delete flow
- `/dashboard/customers/[id]/edit`: edit customer form
- `/dashboard/invoices`: invoice list
- `/dashboard/invoices/new`: create invoice
- `/dashboard/invoices/[id]`: invoice detail
- `/dashboard/invoices/[id]/edit`: edit invoice
- `/dashboard/estimates`: estimate list
- `/dashboard/estimates/new`: create estimate
- `/dashboard/estimates/[id]`: estimate detail and conversion entry point
- `/dashboard/estimates/[id]/edit`: edit estimate
- `/dashboard/settings`: company settings and onboarding completion path
- `/dashboard/settings/billing`: billing overview, real usage summary, and upgrade guidance

## Route Responsibilities

- Files under `apps/web/app` should compose feature UI and call feature-local server helpers.
- Customer routes are thin wrappers around `apps/web/features/customers`.
- Invoice routes are thin wrappers around `apps/web/features/invoices`.
- Estimate routes are thin wrappers around `apps/web/features/estimates`.
- Billing route is a thin wrapper around `apps/web/features/billing`.
- Public document routes expose only share-safe data by `publicId`.
- Estimate detail can redirect into invoice detail after successful conversion.
- Customer does not expose a dedicated `app/api/customers` surface in the MVP.
- Invoice does not expose a dedicated `app/api/invoices` surface in the MVP.
- Estimate does not expose a dedicated `app/api/estimates` surface in the MVP.
