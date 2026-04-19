# NLT Invoice Business-Facing PRD

## Document Control

- Product: NLT Invoice
- Document type: Business-facing PRD / investor-style product narrative
- Version: v1.0 draft
- Date: 2026-04-18

## One-Line Summary

NLT Invoice is a focused invoicing SaaS for solo and very small Canadian businesses that need to create estimates and invoices quickly without adopting a heavyweight accounting system.

## Thesis

The market is full of tools that are either too generic, too complex, or too team-oriented for a one-person service business. NLT Invoice wins by narrowing the product around a very specific workflow:

- one operator
- one company
- one clean workflow from customer record to estimate to invoice to payment tracking

That focus makes the product easier to understand, easier to adopt, and easier to monetize through a simple Free to Pro upgrade.

## Why This Product Exists

Small business owners do not buy accounting software because they love systems. They buy it because they need to:

- look professional
- get invoices out quickly
- know what is unpaid
- avoid operational mess

Most invoicing pain is not caused by missing advanced features. It is caused by too much friction in simple tasks:

- re-entering customer details
- copying line items manually
- rebuilding an estimate into an invoice
- losing visibility into what has been viewed or paid

NLT Invoice is designed to remove exactly that friction.

## Target Customer

### Ideal Customer Profile

- Canada-based solo operator or owner-operator
- service-led business
- low-to-medium monthly document volume
- values speed and simplicity over accounting-suite breadth

Examples:

- freelancer
- consultant
- designer
- repair technician
- contractor
- bookkeeping professional
- small local agency

### Customer Characteristics

- wants a free starting point
- is price-sensitive but will pay when limits become real
- does not need team workflows initially
- prefers a product that feels obvious without training

## Market Need

The core need is not "more finance features." The need is "less overhead around billing work."

This creates a favorable entry point:

- the user can adopt NLT Invoice before they are ready for a full accounting suite
- the product can monetize on workflow frequency rather than enterprise breadth
- the product can build retention through operational habit, not just setup depth

## Value Proposition

For solo Canadian businesses, NLT Invoice offers:

- fast setup
- reusable customer and item data
- professional estimates and invoices
- public share links
- status visibility
- clean upgrade path when usage grows

What the customer gets is not just invoices. They get reduced admin time and faster cash collection behavior.

## Product Strategy

### Strategic Choice 1: Stay Narrow

The strongest product decision is to stay narrow on purpose.

Instead of trying to serve:

- teams
- accountants
- operations departments
- enterprise billing

the product serves a specific persona extremely well. This improves:

- conversion
- onboarding completion
- ease of messaging
- support burden
- roadmap discipline

### Strategic Choice 2: Monetize on Usage Simplicity

The pricing model is intentionally easy to understand:

- Free: test and start using the workflow
- Pro: remove core usage caps
- Business: reserved for future complex workflows

This model works because the value line is clear. Once the user is billing regularly, the limits become commercially meaningful and the Pro upgrade becomes easy to justify.

### Strategic Choice 3: Operational Trust Over Feature Breadth

The product should prioritize:

- correct totals
- safe document history
- reliable numbering
- clean plan enforcement

This is the right tradeoff for financial software. Trust compounds more than novelty.

## Current Product Scope

The current repository supports a credible core operating loop:

- signup and authentication
- onboarding into a company profile
- customer management
- reusable item library
- estimate creation and sharing
- invoice creation and sharing
- estimate to invoice conversion
- dashboard visibility
- billing overview and upgrade path
- manual payment recording

There is also platform groundwork for:

- Stripe subscriptions
- Stripe invoice checkout
- webhook-based payment recording
- invoice email delivery

From a business perspective, those grounded-but-not-fully-productized capabilities should be treated as expansion levers, not current headline promises.

## Product Narrative

### The Core Story

The customer signs up, sets up their business once, adds a customer, creates an estimate or invoice, shares a link, and tracks whether payment has happened.

That is the story. The product should continue to reinforce that story at every touchpoint.

### The Business Advantage

The product gets stronger as the user repeats the loop:

- customer data becomes reusable
- items become reusable
- estimates convert into invoices
- payment status becomes visible
- dashboard becomes more valuable

This means retention should be driven by workflow repetition, not by feature sprawl.

## Monetization Model

### Free Plan

Purpose:

- remove adoption friction
- let the customer experience the end-to-end workflow
- create a natural upgrade trigger

Included:

- 1 user
- 1 company
- 5 customers
- 10 invoices per month
- 10 estimates per month
- public links
- print / PDF access

### Pro Plan

Price:

- 29.99 CAD per month

Purpose:

- monetize repeat operational users
- remove the main growth constraints without changing the product shape

Included:

- unlimited customers
- unlimited invoices
- unlimited estimates

### Business Plan

Purpose:

- preserve enterprise-looking pricing architecture
- create future room for multi-user and advanced workflow expansion

Current business stance:

- not yet a true product tier
- contact-driven positioning only

## Why the Pricing Works

The pricing model is coherent because it maps cleanly to user maturity:

- very early user: Free
- real operator with repeating invoice flow: Pro
- more complex org with team or special needs: Business later

This avoids pricing confusion and keeps the purchase decision simple.

## Go-To-Market Implications

The product is well suited to:

- self-serve web acquisition
- SEO around invoicing and estimating for Canadian small businesses
- positioning around simplicity and speed
- low-friction pricing page conversion

Messaging should emphasize:

- built for Canadian businesses
- send your first invoice fast
- professional documents without complexity
- start free, upgrade only when volume grows

## Key Business Metrics

### Funnel Metrics

- landing page to registration conversion
- registration to onboarding completion
- onboarding completion to first customer
- onboarding completion to first estimate or invoice

### Product Metrics

- documents created per active company
- estimate to invoice conversion rate
- percentage of companies using saved items
- percentage of companies with repeat monthly activity

### Revenue Metrics

- Free to Pro conversion
- average time from signup to upgrade
- active Pro subscriber retention

### Cash Collection Proxy Metrics

- public invoice view rate
- paid invoice rate
- overdue rate

## Moat and Defensibility

This is not a classic deep-tech moat. The defensibility comes from:

- strong product clarity
- a narrow and well-served persona
- repeat workflow adoption
- trust in financial correctness
- simple monetization users do not need explained twice

Over time, defensibility can improve through:

- better workflow data reuse
- better payment and reminder automation
- richer customer history
- multi-user and role expansion for larger accounts

## Risks

### Risk 1: Overexpansion too early

If the product starts chasing teams, accounting integrations, and enterprise requirements too early, it will lose the clarity that makes it commercially attractive.

### Risk 2: Marketing features that are not yet fully productized

Stripe payments and invoice email capability exist in the codebase, but if promoted too aggressively before UX and support are complete, trust can erode.

### Risk 3: Commodity perception

Invoicing software can look crowded. The answer is not feature bloat. The answer is sharper positioning and a better first-run experience.

## Business Requirements

The product must:

- keep Free plan value high enough to drive adoption
- keep Free plan caps low enough to create a real upgrade trigger
- ensure upgrade value is obvious and immediate
- maintain a clear scope line between GA and expansion capabilities
- preserve data correctness and reliability as core trust drivers

## Expansion Thesis

If the core loop proves strong, expansion should follow this order:

1. polish monetization and upgrade lifecycle
2. expose invoice sending and reminders
3. formalize online payment collection
4. add stronger reporting and workflow automation
5. expand into multi-user and role-based collaboration

This sequence preserves the current product identity while opening new revenue layers.

## Investor / Stakeholder Summary

NLT Invoice is attractive because it is not trying to be everything.

It targets a clear pain point, a clear user, and a clear monetization trigger:

- small Canadian businesses
- simple, repeatable billing workflow
- usage-based upgrade from Free to Pro

The product already has a solid operational core. The next business challenge is not inventing more scope. It is tightening packaging, activation, and monetization so the existing workflow becomes commercially repeatable.

## Decision Recommendation

For the next phase, the business should optimize for:

- sharper positioning
- better activation
- stronger Free to Pro conversion
- disciplined scope control

That is the highest-quality path to turning the current product foundation into a durable SaaS business.
