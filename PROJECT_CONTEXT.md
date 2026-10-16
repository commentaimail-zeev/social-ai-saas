# Social AI SaaS — Project Context & Handoff

## Purpose

Build a lean, automation-first SaaS for Israeli businesses that automatically generates AI-based replies to customer comments and reviews from Facebook, Instagram, and Google Business / Google Reviews.

The product should support Hebrew fully and should scale with as little manual work per customer as possible.

Long-term self-service vision:

Customer sees ad / outreach
→ lands on website
→ signs up alone
→ pays alone
→ connects social accounts alone
→ configures the business
→ comments/reviews arrive automatically
→ AI generates replies
→ system publishes immediately or after review / delay, depending on business settings
→ billing, retries, errors and routine notifications are automated as much as possible.

## Working Style

The assistant should act as Lead Full-Stack Engineer / Architect.

Important rules:
- Explain everything in simple Hebrew.
- Assume limited technical knowledge.
- Work in small, coherent mini-sprints.
- Do not dump the whole project at once.
- For each step: say which file to open, provide exact code, explain what it does, and explain how to test it.
- Do not skip “obvious” technical steps.
- Stop and debug errors before moving forward.
- Prefer exact full-file replacement when that is simpler.
- Use checkpoints after meaningful or risky changes.
- At meaningful checkpoints: update `PROJECT_STATUS.md`, run TypeScript validation, commit to Git, and push to GitHub.
- Put non-critical ideas in a Backlog instead of interrupting development.
- Full Hebrew support is mandatory.

## Product Principle: Automation First

Design every repeated customer operation so it can be automated.

The target is a lean SaaS that can grow to hundreds or thousands of customers without manual work growing linearly.

Prefer automation / self-service for:
- Signup
- Onboarding
- Social account connection
- Billing
- Subscription renewals
- Account reconnect flows
- AI reply generation
- Publishing
- Retries
- Error handling
- Customer notifications
- Monitoring
- Routine support flows

Useful design question:

> If there were 1,000 customers, would this action need to be done manually 1,000 times?

If yes, strongly consider automating it.

## Core Architecture

### Backend
- Node.js
- TypeScript
- Fastify
- ES Modules

### Database
- PostgreSQL 18.6
- Prisma 7.10.0
- Docker Desktop
- PostgreSQL container: `social-ai-postgres`

### AI
Use the OpenAI API.

Do not hard-code the architecture to one specific model name. Choose the most suitable current model later based on reply quality, Hebrew quality, latency and cost.

### Frontend
Not built yet.

The future website/dashboard will call the same backend API that social webhooks and integrations use.

## Local Project

Project path:

`C:\Users\zeev6\social-ai-saas`

PowerShell note:

Use:
- `npm.cmd`
- `npx.cmd`

Examples:

```powershell
npm.cmd run dev
npx.cmd tsc --noEmit
npx.cmd prisma generate
```

## Current Backup Strategy

### Code
Private GitHub repository:

`https://github.com/commentaimail-zeev/social-ai-saas.git`

Main branch:

`main`

### Database
PostgreSQL dump files are stored locally under:

`backups/`

and copied manually to Google Drive.

`backups/` is ignored by Git.

### Secrets
`.env` is ignored by Git.

A password-protected 7-Zip backup of `.env` is stored in Google Drive.

The archive password is stored separately and must not be committed or placed in the same Drive location.

### Recovery
`RECOVERY.md` should contain disaster-recovery instructions.

## Current Database Models

### User
Contains:
- id
- email
- name
- passwordHash
- memberships
- sessions
- timestamps

### Business
Contains:
- id
- name
- memberships
- AI settings
- timestamps

### Membership
Connects users to businesses.

Roles:
- OWNER
- ADMIN
- MEMBER

A user may belong to multiple businesses.
A business may have multiple users.

### Session
Server-side session storage.

The browser receives the raw session token in an HttpOnly cookie.
The database stores only a SHA-256 hash of the token.
Sessions expire after 7 days.

### BusinessAiSettings
Per-business AI configuration.

Current settings include:
- `replyLanguageMode`
- `defaultReplyLanguage`
- `replyTone`
- `replyMode`
- `customInstructions`

## Authentication — Completed

Email + Password authentication works end-to-end.

Implemented:
- password hashing with Node `scrypt`
- minimum password length: 8
- no uppercase / number / symbol requirement
- login by normalized email
- safe response without `passwordHash`
- server-side sessions
- HttpOnly cookie
- `/auth/me`
- logout
- session deletion
- expired-session handling

Important API behavior:

Wrong password and unknown email both return:

`401 INVALID_CREDENTIALS`

Missing / invalid session returns:

`401 UNAUTHENTICATED`

## Multi-Tenant Authorization — Completed

Protected routes are implemented.

The server checks:

Request
→ valid session
→ user identity
→ business membership
→ role permission
→ requested action

Users cannot access businesses they do not belong to.

Unauthorized access to another business returns:

`404 BUSINESS_NOT_FOUND`

This avoids revealing whether another tenant’s business exists.

Role behavior verified:
- OWNER → management actions allowed
- ADMIN → allowed management actions allowed
- MEMBER → read access allowed where appropriate, management actions blocked

Insufficient role returns:

`403 INSUFFICIENT_PERMISSIONS`

## Business AI Settings — Completed

Per-business AI settings and API are working.

Endpoints:
- `GET /businesses/:businessId/ai-settings`
- `PATCH /businesses/:businessId/ai-settings`

Permissions:
- OWNER → read + update
- ADMIN → read + update
- MEMBER → read only

### Language behavior

Default:

`MATCH_CUSTOMER`

Meaning:
- Hebrew comment → Hebrew reply
- English comment → English reply
- Arabic comment → Arabic reply
- Russian comment → Russian reply
- other supported languages → same-language reply where possible

Fallback language:

`he`

Used when language cannot be reliably detected.

The architecture is intentionally open to additional languages.

### Reply tones

Current:
- BALANCED
- FRIENDLY
- PROFESSIONAL

### Reply mode

Current:
- REVIEW_REQUIRED
- AUTOMATIC

Default:

`REVIEW_REQUIRED`

### Custom instructions

Businesses can store free-text AI instructions.
Hebrew persistence was tested successfully.

## Important Product Decisions

### Language
Replies should normally match the customer’s language.

Do not force Hebrew if the customer wrote in another language.

### Publishing safety
Start with review-required behavior by default.

Automatic publishing should require explicit business choice / consent.

### Stable machine-readable errors
Backend APIs should return stable codes.
Future frontend translates them into user-facing Hebrew messages.

### Security
Never return:
- password hashes
- session token hashes
- raw secrets

Do not commit `.env`.

## Current API / Feature Status

Completed:
- PostgreSQL + Prisma
- Docker development database
- Core data models
- Onboarding
- User creation
- Business creation
- OWNER membership creation
- Password hashing
- Validation
- Stable API error codes
- Login
- Sessions
- Cookies
- `/auth/me`
- Logout
- Protected routes
- Multi-tenant isolation
- OWNER / ADMIN / MEMBER authorization
- Business AI settings
- Hebrew custom instructions

## Current Development Position

Estimated overall completion toward a full production product:

Approximately 20%.

This is only a rough planning estimate.

Major product layers still needed:
- AI reply engine
- comment/review storage
- Meta integrations
- Google Business integration
- OAuth
- webhooks
- jobs / queues
- delayed publishing
- retries
- logs
- monitoring
- billing
- frontend / dashboard
- deployment
- production hardening

## Exact Next Step

Build the first AI Reply Engine.

Goal:

Input:
- businessId
- customer comment / review text

Flow:
1. Authenticate / authorize business access where relevant.
2. Load the business AI settings.
3. Detect the customer language.
4. Use the customer language when `MATCH_CUSTOMER`.
5. Use fallback language when language cannot be detected.
6. Apply reply tone.
7. Apply custom business instructions.
8. Generate an AI reply.
9. Initially return it as a suggestion for review.
10. Do not publish automatically yet.

Later:
- connect this engine to real Facebook / Instagram / Google events,
- store incoming comments/reviews,
- publish approved or automatic replies.

## Product Backlog / Ideas

Do not stop current development for these unless they become architectural blockers.

- Smart handling of mixed-language comments
- Additional reply tones
- Refine AI settings UX during frontend work
- Additional business-specific AI preferences
- Configurable automatic reply timing:
  - immediate
  - after X minutes
  - potentially smart / natural timing
- Self-service reconnect flows for expired social permissions
- Automated retries and customer notifications
- Strong monitoring / alerting so the owner only handles real exceptions

## Business Vision

The product should remain lean and relatively affordable.

Preferred growth path:
- validate with first paying customers,
- automate aggressively,
- delay hiring until customer scale genuinely justifies it,
- keep manual intervention rate low,
- allow revenue to scale faster than operating effort.

The aim is not to avoid employees forever.

The aim is to avoid needing employees too early because routine operations were not automated.

## If This File Is Used in Another Chat / Model / Tool

Start by reading:

1. `PROJECT_CONTEXT.md`
2. `PROJECT_STATUS.md`
3. `RECOVERY.md`

Then inspect the current code before making architecture-changing edits.

Continue from:

**AI Reply Engine**

Do not rebuild completed authentication, authorization, or AI-settings work unless current code shows otherwise.
