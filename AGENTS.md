# Codex Agent Rules (NLT Invoice MVP)

Strict repository rules for AI coding agents. Follow these unless the user explicitly overrides them.

## 1. Project Structure
- Main app: `apps/web`
- Prisma schema: `apps/web/prisma/schema.prisma`
- Server actions: `apps/web/server/actions`
- Auth logic: `apps/web/lib/auth` and `apps/web/server/actions/auth.ts`
- Email logic uses Resend

## 2. Commands
- Run dev server: `cd apps/web && pnpm dev`
- Run tests: `pnpm --filter web test`
- Typecheck: `pnpm --filter web typecheck`
- Prisma Studio: `cd apps/web && pnpm exec prisma studio`

## 3. Critical Rules
- NEVER run Prisma commands from repo root.
- ALWAYS run Prisma commands from `apps/web`.
- DO NOT break the existing email verification flow.
- Registration must remain fail-safe: user creation must still succeed even if email sending fails.
- Keep email sender exactly: `NLT Invoice <noreply@mail.nltinvoice.com>`.
- Keep `reply_to` exactly: `info@nltinvoice.com`.
- Do not introduce new dependencies unless absolutely necessary.
- Do not refactor unrelated files.

## 4. Coding Principles
- Prefer minimal changes over large refactors.
- Fix root cause, not symptoms.
- Keep logic explicit and readable.
- Avoid duplicate logic between register and resend flows.

## 5. Email Verification Rules
- Register flow MUST always attempt to send email.
- Resend flow MUST enforce a 60-second cooldown.
- Resend flow MUST include abuse protection.
- Token handling must remain consistent across flows.

## 6. Output Requirements
When making changes, always:
- Explain root cause first.
- List files changed.
- Show exact logic changes.
- Show commands run.
- Confirm behavior after the fix.

## 7. Testing Rules
- Always run:
  - `pnpm --filter web test`
  - `pnpm --filter web typecheck`
- Do not rely only on mocked tests if UI behavior is involved.
- Prefer verifying the real flow when possible.

## 8. Safety
- Do not log secrets (API keys, tokens).
- Keep debug logs behind `NODE_ENV !== "production"`.
