# NLT Invoice — Product Backlog

**Version:** 1.1  
**Date:** April 2026  
**Branch:** Cloud-MVP1 (Preview) → main (Production)

---

## Status Legend

- ✅ Done
- 🚧 In Progress
- 🔴 Not Started
- ❌ Deferred (post-MVP)

---

## Sprint 1 — Auth & Core Infrastructure ✅ COMPLETE

| Story | Status | Notes |
|-------|--------|-------|
| User can register with email + password | ✅ | Rate limited, field validation |
| Email verification on register | ✅ | Fixed Apr 19 — was broken on preview |
| User can sign in | ✅ | JWT session |
| User can reset password | ✅ | Token-based, 1hr expiry |
| Resend verification email | ✅ | 60s cooldown, 5/hr limit |
| Email verification URL correct on preview | ✅ | Fixed Apr 19 — was pointing to production |
| verify-email page dynamic rendering | ✅ | Fixed Apr 19 — Next.js 15 static error |
| Middleware protects /dashboard | ✅ | |
| Unverified users redirected to verify-email | ✅ | |

---

## Sprint 2 — Onboarding & Company Setup ✅ COMPLETE

| Story | Status | Notes |
|-------|--------|-------|
| User can complete onboarding (company profile) | ✅ | |
| System creates default company state | ✅ | INV prefix, 1001 start |
| Free subscription created on onboarding | ✅ | |
| User can update company profile after onboarding | ✅ | Settings page |

---

## Sprint 3 — Customer Management ✅ COMPLETE

| Story | Status | Notes |
|-------|--------|-------|
| User can create a customer | ✅ | Business + Individual types |
| User can edit a customer | ✅ | |
| User can view customer list + detail | ✅ | Search supported |
| Customer deletion protects related records | ✅ | Blocks if invoices/estimates exist |
| Free plan customer limit enforced (5) | ✅ | Server-side |

---

## Sprint 4 — Invoice Management ✅ COMPLETE

| Story | Status | Notes |
|-------|--------|-------|
| User can create invoice | ✅ | Line items, tax, discount |
| User can edit draft invoice | ✅ | |
| User can list and view invoices | ✅ | Search supported |
| User can void invoice | ✅ | |
| User can delete draft invoice | ✅ | |
| Free plan invoice limit enforced (10/mo) | ✅ | Server-side |
| Public invoice link | ✅ | /i/[publicId] |
| User can record manual payment | ✅ | |
| Invoice PDF (browser print) | ✅ | Print-friendly HTML |
| Snapshot fields (company + customer) | ✅ | Historical accuracy |

---

## Sprint 5 — Estimate Management ✅ COMPLETE

| Story | Status | Notes |
|-------|--------|-------|
| User can create estimate | ✅ | |
| User can edit estimate | ✅ | |
| User can list and view estimates | ✅ | |
| Public estimate link | ✅ | /e/[publicId] |
| Convert estimate → invoice | ✅ | Concurrent-safe transaction |
| Duplicate conversion blocked | ✅ | |
| Free plan estimate limit enforced (10/mo) | ✅ | |

---

## Sprint 6 — Dashboard ✅ COMPLETE

| Story | Status | Notes |
|-------|--------|-------|
| Dashboard KPI cards (revenue, outstanding, overdue) | ✅ | |
| Recent invoices list | ✅ | |
| Quick actions (Create Invoice, Add Customer) | ✅ | |
| Overdue alert banner | ✅ | |
| Sidebar navigation | ✅ | Dashboard, Customers, Estimates, Invoices, Settings, Billing |

---

## Sprint 7 — Invoice & Estimate Design 🔴 NOT STARTED

> **This is the current priority before production launch.**

| Story | Priority | Status | Notes |
|-------|----------|--------|-------|
| Professional invoice template (public page) | P0 | 🔴 | /i/[publicId] redesign |
| Professional estimate template (public page) | P0 | 🔴 | /e/[publicId] redesign |
| Invoice PDF matches new template design | P1 | 🔴 | |
| Empty state: no invoices yet | P1 | 🔴 | |
| Empty state: no customers yet | P1 | 🔴 | |
| Empty state: no estimates yet | P1 | 🔴 | |

---

## Sprint 8 — Stripe & Billing 🔴 NOT STARTED

| Story | Priority | Status | Notes |
|-------|----------|--------|-------|
| Stripe Pro plan checkout session | P0 | 🔴 | $29.99 CAD/mo |
| Checkout success → subscription activated | P0 | 🔴 | Webhook |
| Billing page shows real plan + usage | ✅ | Done | UI exists, Stripe not wired |
| Upgrade CTA on billing page | ✅ | Done | Button exists, action placeholder |
| Free plan limits enforced correctly | ✅ | Done | |

---

## Sprint 9 — Pre-Launch Polish 🔴 NOT STARTED

| Story | Priority | Status |
|-------|----------|--------|
| Mobile responsive dashboard | P1 | 🔴 |
| Email verification banner dismiss on verify | P1 | 🔴 |
| Production env variables confirmed | P0 | 🔴 |
| main branch deploy (production) | P0 | 🔴 |

---

## Deferred (Post-MVP) ❌

| Feature | Reason |
|---------|--------|
| Online payment collection (Stripe invoice pay) | Complexity, post-launch |
| Email sending from app (send invoice by email) | Infrastructure is built, UX not finalized |
| Multi-user / team accounts | Out of MVP scope |
| Recurring invoices | Post-launch |
| QuickBooks / Wave integration | Post-launch |
| Advanced tax automation (HST/GST filing) | Post-launch |
| Mobile app | Post-launch |
| Reminder workflows | Post-launch |

---

## Velocity Notes

- Sprint 1–6: Core product loop complete
- Sprint 7 (Invoice/Estimate Design): ~3–5 days estimated
- Sprint 8 (Stripe): ~2–3 days estimated
- Sprint 9 (Polish): ~1–2 days estimated
- **Estimated production launch: 1–2 weeks from April 19, 2026**
