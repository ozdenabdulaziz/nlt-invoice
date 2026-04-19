# NLT Invoice — Product Requirements Document (MVP)

**Version:** 1.1  
**Date:** April 2026  
**Status:** In Progress — Preview Stable  
**Branch Strategy:** `main` = Production, `Cloud-MVP1` = Preview

---

## 1. Product Overview

NLT Invoice is a simple, English-first invoicing SaaS for small businesses in Canada. The goal of MVP is to let a solo business owner sign up, create invoices/estimates, send them to clients, and track payment status — nothing more.

**Target user:** Solo entrepreneur or freelancer in Canada with no accounting background.  
**Core promise:** Create and send a professional invoice in under 2 minutes.

---

## 2. MVP Scope

### ✅ IN Scope (must ship)

| Area | Feature | Status |
|------|---------|--------|
| Auth | Register with email + password | ✅ Done |
| Auth | Email verification (working) | ✅ Done |
| Auth | Login / Logout | ✅ Done |
| Auth | Password reset | ✅ Done |
| Onboarding | Business profile setup | ✅ Done |
| Onboarding | Default currency (CAD), tax settings | ✅ Done |
| Customers | Add / edit / delete customers | ✅ Done |
| Customers | Customer list view | ✅ Done |
| Dashboard | Summary cards (revenue, outstanding, overdue) | ✅ Done |
| Dashboard | Recent invoices list | ✅ Done |
| Dashboard | Quick actions | ✅ Done |
| Navigation | Sidebar: Dashboard, Customers, Invoices, Estimates, Settings, Billing | ✅ Done |
| Invoices | Create invoice (line items, quantity, price, tax) | ✅ Done |
| Invoices | Invoice list view (draft, sent, paid, overdue) | ✅ Done |
| Invoices | Public shareable invoice link | ✅ Done |
| Invoices | Mark invoice as paid (manual) | ✅ Done |
| Invoices | PDF download (browser print) | ✅ Done |
| Invoices | Void / Delete draft | ✅ Done |
| Estimates | Create estimate | ✅ Done |
| Estimates | Convert estimate → invoice | ✅ Done |
| Estimates | Public shareable estimate link | ✅ Done |
| Settings | Business profile | ✅ Done |
| Settings | Billing overview | ✅ Done |
| Payments | Free plan limits enforced (server-side) | ✅ Done |
| Payments | Stripe subscription (Free → Pro upgrade) | 🔴 Not done |
| Invoice/Estimate | Professional template/design | 🔴 Not done |

### ❌ OUT of Scope (post-MVP)

- Online payment collection (client pays via invoice link)
- Multi-user / team accounts
- Automated tax calculations (HST/GST filing)
- Recurring invoices
- Email sending from app (SMTP)
- Mobile app
- Accounting integrations (QuickBooks, Wave)

---

## 3. Free vs Pro Plan

| Feature | Free | Pro ($29.99 CAD/mo) |
|---------|------|-------------|
| Invoices | 10/month | Unlimited |
| Estimates | 10/month | Unlimited |
| Customers | 5 | Unlimited |
| PDF download | ✅ | ✅ |
| Public links | ✅ | ✅ |
| Remove NLT branding | ❌ | ✅ |

---

## 4. Current Blockers (Must fix before Production)

### 🔴 P0 — Launch Blockers

| # | Issue | Status |
|---|-------|--------|
| 1 | Invoice / Estimate template design | 🔴 Not started |
| 2 | Stripe billing connected (Pro upgrade) | 🔴 Not started |

### 🟡 P1 — Required before first user

| # | Issue | Status |
|---|-------|--------|
| 3 | PDF download polish | 🟡 Partial (browser print works) |
| 4 | Empty states (no invoices yet, no customers) | 🟡 Partial |
| 5 | Mobile responsive dashboard | 🟡 Partial |

### ✅ Resolved

| # | Issue | Resolution |
|---|-------|------------|
| 6 | Email verification broken on preview | Fixed Apr 19, 2026 |
| 7 | verify-email static rendering error (Next.js 15) | Fixed Apr 19, 2026 |
| 8 | Verification URL pointing to production on preview | Fixed Apr 19, 2026 |

---

## 5. User Flow (Happy Path)

```
Register → Verify Email → Onboarding (business profile)
  → Dashboard
    → Add Customer
    → Create Invoice (select customer, add items, set tax)
    → Preview Invoice (public link)
    → Send link to client manually (email/WhatsApp)
    → Mark as Paid
```

---

## 6. Build Priority Order (Remaining)

1. **Invoice template design** — professional look for public invoice page
2. **Estimate template design** — consistent with invoice
3. **Connect Stripe** — Pro plan upgrade flow
4. **Polish + empty states** — before first real user
5. **Production deploy** — merge Cloud-MVP1 → main

---

## 7. Launch Checklist

- [x] User can register and verify their email
- [x] User can complete onboarding in under 2 minutes
- [x] User can create an invoice and share a public link
- [x] User can mark an invoice as paid
- [x] Free plan limits are enforced
- [x] App is deployed and stable on Vercel (preview)
- [ ] Invoice public page has professional design
- [ ] Estimate public page has professional design
- [ ] User can upgrade to Pro via Stripe
- [ ] App is live on production (main branch)

---

## 8. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Auth | Auth.js + Prisma Adapter (JWT) |
| Database | PostgreSQL + Prisma (Neon) |
| Payments | Stripe (placeholder — not connected) |
| Email | Resend |
| State | TanStack Query |
| Forms | React Hook Form + Zod |
| Deploy | Vercel |
| Rate Limiting | Upstash Redis |

---

## 9. Open Questions

- [ ] Invoice template style — minimal, professional, or branded?
- [ ] Stripe Pro plan price confirmed at $29.99 CAD/month?
- [ ] Will app send invoices by email or just generate a shareable link for MVP?
- [ ] GST/HST — manual entry only or auto-calculate in MVP?
