# NLT Invoice Product Backlog

## Document Control

- Product: NLT Invoice
- Document type: Product backlog with epics, user stories, and acceptance criteria
- Version: v1.0 draft
- Date: 2026-04-18

## Backlog Framing

This backlog is organized around the current product direction in the repository. Stories are grouped by epic and tagged by delivery intent:

- `Now`: required for GA MVP
- `Next`: recommended after GA stabilization
- `Later`: future expansion

Priority labels:

- `P0`: launch-critical
- `P1`: high-value
- `P2`: useful but deferrable

## Epic 1: Acquisition and Activation

### Objective

Convert visitors into activated companies that complete onboarding and create their first operational record.

### US-1.1 Landing page communicates core value

- Type: Now
- Priority: P1
- As a prospective customer, I want to understand the product quickly so I can decide whether to sign up.

Acceptance criteria:

- landing page clearly states that the product is for Canadian small businesses
- landing page includes a primary CTA to register
- landing page includes a secondary CTA to view pricing
- landing page communicates simplicity and solo-business positioning

### US-1.2 Pricing page explains Free vs Pro vs Business

- Type: Now
- Priority: P0
- As a prospective customer, I want to see limits and upgrade options so I can choose the right plan.

Acceptance criteria:

- Free plan shows customer, invoice, and estimate limits
- Pro plan shows unlimited core usage
- Business plan is presented as contact-sales or future scope
- pricing page includes a CTA to register or upgrade

### US-1.3 Activation journey is low-friction

- Type: Now
- Priority: P0
- As a new user, I want to move from registration to first use quickly so the product feels immediately useful.

Acceptance criteria:

- new user can register without a credit card
- user is routed to onboarding if company setup is incomplete
- onboarding can be completed in a single flow
- successful onboarding redirects user into dashboard

## Epic 2: Authentication and Account Security

### Objective

Provide a secure and understandable account lifecycle with minimal friction.

### US-2.1 User can register with email and password

- Type: Now
- Priority: P0
- As a new user, I want to create an account so I can use the product.

Acceptance criteria:

- registration requires name, email, password, and password confirmation
- duplicate email registration is rejected
- invalid inputs return field-level validation
- registration is rate-limited by IP

### US-2.2 User can verify email

- Type: Now
- Priority: P0
- As a user, I want to verify my email so my account is trusted and system emails are reliable.

Acceptance criteria:

- verification email is generated on signup
- verification link is token-based and expiring
- resend action is available
- resend action enforces cooldown and hourly rate limit
- unverified users see a banner prompting verification

### US-2.3 User can sign in

- Type: Now
- Priority: P0
- As a returning user, I want to sign in securely so I can access my dashboard.

Acceptance criteria:

- valid credentials create a session
- invalid credentials return a clear error
- authenticated users can access protected routes
- unauthenticated users are redirected away from protected routes

### US-2.4 User can reset password

- Type: Now
- Priority: P0
- As a user who forgot my password, I want to reset it securely so I can regain access.

Acceptance criteria:

- forgot password flow accepts email
- reset email is token-based and expiring
- reset form validates new password rules
- expired or invalid tokens are rejected

## Epic 3: Onboarding and Company Setup

### Objective

Establish a valid company context and document defaults in one step.

### US-3.1 User can create company profile during onboarding

- Type: Now
- Priority: P0
- As a first-time user, I want to set up my business profile so I can start creating documents.

Acceptance criteria:

- onboarding collects company name, email, phone, website, address, tax number, and currency
- country defaults to Canada
- company is created successfully on valid submission
- company is linked to the current user

### US-3.2 System creates default business state during onboarding

- Type: Now
- Priority: P0
- As the product, I want onboarding to create all required records so the user lands in a usable state.

Acceptance criteria:

- owner membership is created
- Free subscription is created with active status
- invoice prefix defaults to `INV`
- estimate prefix defaults to `EST`
- next invoice number defaults to `1001`
- next estimate number defaults to `1001`
- onboarding completed flag is set

## Epic 4: Company Settings

### Objective

Allow the user to maintain the business details that feed future documents.

### US-4.1 User can update company profile after onboarding

- Type: Now
- Priority: P1
- As a business owner, I want to edit my company details so future documents stay accurate.

Acceptance criteria:

- settings page pre-fills current company data
- updates persist successfully
- future document creation uses updated company fields
- existing documents remain historically unchanged due to snapshot storage

## Epic 5: Customer Management

### Objective

Give the user a reusable customer database for invoicing workflows.

### US-5.1 User can create a customer

- Type: Now
- Priority: P0
- As a business owner, I want to create a customer so I can issue documents to them.

Acceptance criteria:

- customer form supports business or individual type
- customer form supports email, phone, billing, and shipping details
- shipping can be copied from billing
- valid customer creates successfully

### US-5.2 User can edit a customer

- Type: Now
- Priority: P1
- As a business owner, I want to update customer details so new documents stay accurate.

Acceptance criteria:

- customer edit page loads current values
- edits persist on save
- updated customer appears correctly in list and detail views

### US-5.3 User can view customer list and detail

- Type: Now
- Priority: P1
- As a business owner, I want to browse customers so I can manage my client base.

Acceptance criteria:

- customer list shows core identity fields
- customer detail shows customer data and related activity context
- search supports common customer lookup fields

### US-5.4 Free plan customer limit is enforced

- Type: Now
- Priority: P0
- As a Free user, I should be prevented from exceeding plan limits so pricing remains consistent.

Acceptance criteria:

- sixth customer creation attempt on Free is blocked
- limit messaging explains that upgrade to Pro removes the cap
- enforcement runs on the server

### US-5.5 Customer deletion protects related records

- Type: Now
- Priority: P0
- As the product, I must prevent destructive deletes that break document history.

Acceptance criteria:

- customer with related invoice cannot be deleted
- customer with related estimate cannot be deleted
- system returns a clear blocking message

## Epic 6: Items Library

### Objective

Reduce repetitive line-item entry through reusable product and service templates.

### US-6.1 User can create a saved item

- Type: Now
- Priority: P1
- As a business owner, I want to save common items so I can invoice faster.

Acceptance criteria:

- item captures name, description, default rate, unit type, and tax rate
- saved item appears in the items library after creation

### US-6.2 User can edit and delete saved items

- Type: Now
- Priority: P1
- As a business owner, I want to manage saved items so my reusable catalog stays current.

Acceptance criteria:

- item edit updates persisted values
- item delete removes the saved item
- deleting a saved item does not mutate historical document line items

### US-6.3 User can reuse saved items in document forms

- Type: Now
- Priority: P1
- As a business owner, I want saved items to prefill line items so document creation is faster.

Acceptance criteria:

- invoice and estimate forms can select saved items
- selected item prepopulates default values into the line row
- user can still change copied values in the document row

## Epic 7: Estimate Management

### Objective

Allow users to prepare and share professional estimates as a precursor to invoicing.

### US-7.1 User can create an estimate

- Type: Now
- Priority: P0
- As a business owner, I want to create an estimate so I can quote work professionally.

Acceptance criteria:

- estimate requires valid company and customer context
- estimate number is generated automatically
- totals are computed on the server
- estimate persists line-item and snapshot data

### US-7.2 User can edit an estimate

- Type: Now
- Priority: P1
- As a business owner, I want to update an estimate before acceptance so I can keep it accurate.

Acceptance criteria:

- edit form loads persisted estimate values
- updated totals are recalculated on the server
- saved changes appear on detail and public views

### US-7.3 User can list and view estimates

- Type: Now
- Priority: P1
- As a business owner, I want to browse estimates so I can manage active quotes.

Acceptance criteria:

- estimate list shows status and customer context
- estimate detail shows amounts, dates, items, and sharing actions
- search supports estimate number and customer identity

### US-7.4 User can share a public estimate link

- Type: Now
- Priority: P1
- As a business owner, I want to share an estimate externally so the customer can review it without login.

Acceptance criteria:

- each estimate has a unique public link
- public page renders snapshot data only
- public page is mobile-friendly and print-friendly
- viewing a sent estimate may move status to viewed

### US-7.5 Free plan estimate limit is enforced

- Type: Now
- Priority: P0
- As a Free user, I should be prevented from exceeding estimate limits.

Acceptance criteria:

- eleventh estimate in same UTC month is blocked on Free
- server returns upgrade messaging
- Pro plan does not apply the same limit

## Epic 8: Invoice Management

### Objective

Support the full lifecycle of creating, sharing, tracking, and closing invoices.

### US-8.1 User can create an invoice

- Type: Now
- Priority: P0
- As a business owner, I want to create an invoice so I can bill my customer.

Acceptance criteria:

- invoice requires valid company and customer context
- invoice number is generated automatically
- totals, amount paid, and balance due are calculated on the server
- due date cannot be earlier than issue date

### US-8.2 User can edit an invoice

- Type: Now
- Priority: P1
- As a business owner, I want to edit a draft or editable invoice so I can correct details.

Acceptance criteria:

- editable invoice values load correctly
- server recalculates totals on save
- invalid states are rejected with clear messaging

### US-8.3 User can list and view invoices

- Type: Now
- Priority: P1
- As a business owner, I want to browse invoices so I can track what has been issued and paid.

Acceptance criteria:

- invoice list shows invoice number, customer, status, and amount context
- invoice detail shows full snapshot data
- search supports invoice number and customer identity

### US-8.4 User can void or delete invoice safely

- Type: Now
- Priority: P1
- As a business owner, I want safe destructive controls so I can clean up drafts and invalidate bad invoices.

Acceptance criteria:

- draft invoice can be deleted
- non-draft, non-paid, non-void invoice can be voided
- paid or void invoices cannot be voided again
- destructive actions show confirmation and clear result state

### US-8.5 Free plan invoice limit is enforced

- Type: Now
- Priority: P0
- As a Free user, I should be prevented from exceeding invoice limits.

Acceptance criteria:

- eleventh invoice in same UTC month is blocked on Free
- server returns upgrade messaging
- Pro plan does not apply the same limit

## Epic 9: Estimate to Invoice Conversion

### Objective

Turn approved or reviewed estimates into invoices without duplicated work.

### US-9.1 User can convert eligible estimate to invoice

- Type: Now
- Priority: P0
- As a business owner, I want to convert an estimate into an invoice so I do not have to recreate it manually.

Acceptance criteria:

- only eligible estimate statuses can be converted
- conversion creates a new invoice draft
- invoice copies estimate snapshot and line items
- invoice receives a new reserved invoice number
- invoice links back to estimate

### US-9.2 Duplicate conversion is blocked

- Type: Now
- Priority: P0
- As the product, I must prevent duplicate invoices from the same estimate in the MVP flow.

Acceptance criteria:

- if estimate is already linked to an invoice, conversion action is blocked or replaced by navigation to linked invoice
- concurrent conversion attempts do not create duplicate invoices
- conflict messaging is safe and retryable

### US-9.3 Conversion consumes invoice usage correctly

- Type: Now
- Priority: P0
- As the billing system, I want conversion to count correctly so plan enforcement remains accurate.

Acceptance criteria:

- conversion increments invoice monthly usage
- conversion does not increment estimate monthly usage again

## Epic 10: Public Documents and Client Experience

### Objective

Deliver a clean no-login client experience for reviewing documents.

### US-10.1 Client can view public invoice

- Type: Now
- Priority: P0
- As a customer, I want to open an invoice link without logging in so paying and reviewing are easy.

Acceptance criteria:

- public invoice is accessible through `publicId`
- page includes company, customer, item, and total details from snapshot data
- page supports print and PDF access
- sent invoice can move to viewed when opened by a non-crawler

### US-10.2 Client can view public estimate

- Type: Now
- Priority: P1
- As a customer, I want to review an estimate without logging in so the quoting process is frictionless.

Acceptance criteria:

- public estimate is accessible through `publicId`
- page includes estimate detail, items, and total details from snapshot data
- page supports print and PDF access
- sent estimate can move to viewed when opened by a non-crawler

### US-10.3 Public documents expose only share-safe data

- Type: Now
- Priority: P0
- As the product, I must avoid leaking internal-only information through public links.

Acceptance criteria:

- public pages use snapshot data only
- public lookup is by `publicId`, not internal ID
- internal dashboard-only actions are not exposed publicly

## Epic 11: Payment Collection and Tracking

### Objective

Allow the business owner to track payment completion accurately.

### US-11.1 User can record offline payment manually

- Type: Now
- Priority: P0
- As a business owner, I want to mark an invoice paid so my books stay current.

Acceptance criteria:

- dashboard invoice detail offers manual payment recording when allowed
- user can provide payment method
- user can provide internal payment note
- system updates amount paid and balance due correctly
- paid invoices are shown as paid

### US-11.2 Client sees offline payment instructions

- Type: Now
- Priority: P1
- As a customer, I want to know how to pay if online payment is not available.

Acceptance criteria:

- public invoice displays offline payment instructions
- instructions include relevant company contact details when available

### US-11.3 Online payment capability can be rolled out safely

- Type: Next
- Priority: P1
- As the product team, I want online payment to remain optional until officially supported.

Acceptance criteria:

- online payment only appears for payable invoices
- payment success and cancel states are handled clearly
- webhook processing is idempotent
- payment cannot be applied twice for same checkout session

## Epic 12: Billing and Monetization

### Objective

Create a clear, enforceable, and self-serve path from Free to Pro.

### US-12.1 User can see current plan and usage

- Type: Now
- Priority: P0
- As a customer, I want to see what plan I am on and how much of my allowance I have used.

Acceptance criteria:

- billing page shows current plan
- billing page shows customer, invoice, and estimate usage
- usage displays limits and current consumption

### US-12.2 Server enforces plan limits

- Type: Now
- Priority: P0
- As the business model, I want usage caps to be enforced accurately.

Acceptance criteria:

- customer create checks customer limit
- estimate create checks estimate limit
- invoice create checks invoice limit
- estimate conversion checks invoice limit
- all enforcement is server-side

### US-12.3 Free user can upgrade to Pro

- Type: Now
- Priority: P1
- As a Free user, I want a clear upgrade action so I can remove limits.

Acceptance criteria:

- billing page contains upgrade CTA
- upgrade flow starts a subscription checkout session
- checkout success and cancel routes are defined

### US-12.4 Subscription state is synchronized

- Type: Next
- Priority: P1
- As the platform, I want subscription state to stay aligned with Stripe so plan access is correct.

Acceptance criteria:

- webhook events update subscription status
- company and stripe customer linkage is stored
- subscription changes revalidate relevant dashboard pages

## Epic 13: Dashboard and Business Visibility

### Objective

Give the user an immediate operational overview.

### US-13.1 Dashboard shows KPI overview

- Type: Now
- Priority: P1
- As a business owner, I want to see the state of my receivables at a glance.

Acceptance criteria:

- dashboard shows paid revenue
- dashboard shows outstanding amount
- dashboard shows overdue amount
- dashboard shows current month invoiced amount

### US-13.2 Dashboard shows recent invoices

- Type: Now
- Priority: P1
- As a business owner, I want quick access to recent invoices so I can continue work fast.

Acceptance criteria:

- dashboard lists recent invoices
- list shows customer context, due date, status, and amount

### US-13.3 Dashboard exposes quick actions

- Type: Now
- Priority: P1
- As a business owner, I want one-click navigation to common tasks.

Acceptance criteria:

- create invoice quick action exists
- add customer quick action exists
- payment-related shortcut exists

## Epic 14: Email Delivery and Reminders

### Objective

Turn manual link sharing into a more complete delivery workflow.

### US-14.1 User can send invoice by email from dashboard

- Type: Next
- Priority: P1
- As a business owner, I want to send an invoice directly from the product so delivery is more professional.

Acceptance criteria:

- invoice detail includes a send action
- send action validates recipient email availability
- send action validates sender company email availability
- successful send updates `sentAt`
- draft invoice transitions to sent when email is delivered

### US-14.2 PDF attachment failure degrades gracefully

- Type: Next
- Priority: P2
- As the product, I want email sending to continue when PDF generation fails so the workflow does not break unnecessarily.

Acceptance criteria:

- invoice email is still sent if attachment generation fails
- system logs the attachment failure

### US-14.3 Reminder workflows can be added later

- Type: Later
- Priority: P2
- As a business owner, I want reminders so I can follow up on overdue invoices faster.

Acceptance criteria:

- reminder system can target sent, viewed, or overdue invoices
- reminder actions preserve auditability

## Epic 15: Platform Integrity and Operational Safety

### Objective

Keep the product safe under concurrent operations and edge cases.

### US-15.1 Document numbering is concurrency-safe

- Type: Now
- Priority: P0
- As the system, I want numbering to remain unique even under concurrent requests.

Acceptance criteria:

- company row is locked or equivalent transaction guard is used before reserving next number
- no duplicate document number is created within the same company

### US-15.2 Financial values are server-authoritative

- Type: Now
- Priority: P0
- As the system, I want server-side calculations to be authoritative so totals cannot be tampered with.

Acceptance criteria:

- invoice totals are recalculated on server create and update
- estimate totals are recalculated on server create and update
- client-side values are not trusted as persisted truth

### US-15.3 Protected data is always company-scoped

- Type: Now
- Priority: P0
- As the system, I want every dashboard read and write scoped to the active company so data isolation is preserved.

Acceptance criteria:

- customer queries are company-scoped
- estimate queries are company-scoped
- invoice queries are company-scoped
- billing queries are company-scoped

## Release Buckets

### Release A: GA MVP

- Epics 1 through 13
- Epic 15
- manual payment workflow
- plan enforcement

### Release B: Monetization and Delivery

- Epic 14
- stronger subscription lifecycle visibility
- decision on official online invoice payment rollout

### Release C: Team Expansion

- multi-user
- roles and permissions
- business plan productization

## Suggested Delivery Order

1. Auth and onboarding stability
2. Customer and item setup loop
3. Estimate and invoice creation loop
4. Public document and payment tracking loop
5. Billing enforcement and upgrade flow
6. Dashboard polish
7. Email delivery and reminder expansion

## Notes

This backlog is intentionally aligned with the current repository architecture:

- thin route layer in `apps/web/app`
- domain logic inside feature folders
- server-side billing enforcement
- snapshot-based document model

It should be used as the basis for sprint planning, epic tracking, and release scoping.
