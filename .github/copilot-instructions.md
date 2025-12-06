<!-- GitHub Copilot instructions tailored for the QuocBankV4 codebase -->
# QuocBank — AI Coding Agent Quick-Start

This file contains repo-specific guidance to help AI coding agents be immediately productive.

Summary
- Stack: Next.js 14 (App Router) + TypeScript, Prisma (SQLite by default), React Three Fiber (3D UI), Tailwind.
- Server model: Next.js Server Actions in `actions/*` (each action is `"use server"`).
- Auth: JWT tokens stored in an HttpOnly cookie named `session` (see `lib/auth.ts`).

Key patterns & where to look
- Server Actions: `actions/*.ts` — business logic lives here and calls `prisma` directly. Example: `actions/auth.ts` implements `login`, `register`, `logout`.
- Prisma client & models: `lib/prisma.ts` and `prisma/schema.prisma` — DB models (14 models) and default `sqlite` datasource. Use transactions (`prisma.$transaction`) for money transfers.
- Middleware & routing: `middleware.ts` — protects routes and redirects based on the `session` cookie. `protectedRoutes` are defined here (e.g. `/dashboard`, `/transfer`).
- Auth helpers: `lib/auth.ts` — JWT creation/verification (`jose`), cookie handling (`next/headers`), password hashing (`bcrypt-ts`). Token secret comes from `process.env.JWT_SECRET`.
- 3D UI: `components/3d/*` and `app/dashboard` — React Three Fiber scenes and visual components. Keep heavy rendering client-side.
- App Router: `app/layout.tsx` and `app/*` pages — SSR/Server Components by default; use client components where needed.

Important developer workflows
- Install & run dev:
  - `npm install`
  - `npm run dev` (Next dev server)
- Prisma tasks:
  - `npm run prisma:generate` (runs on `postinstall` automatically)
  - `npm run prisma:push` (apply schema to DB)
  - `npm run prisma:seed` (uses `tsx prisma/seed.ts` — note `tsx` dev dependency)
  - Use `npm run prisma:studio` to inspect DB
- Build & prod:
  - `npm run build` then `npm start`

Repository conventions & gotchas
- Server Actions: Each action file begins with `'use server'`. These functions are intended to be called from client components or server components via Next.js Server Actions.
- Cookie name and session shape: The cookie key is `session`. The token payload has `{ user }` where `user` matches `SessionUser` in `lib/auth.ts`.
- Use of `bcrypt-ts` instead of `bcryptjs` for edge compatibility (see `lib/auth.ts`). Avoid replacing with native `bcrypt` unless you handle runtime differences.
- Next config: `next.config.js` enables `serverActions` experimental feature and sets `bodySizeLimit: '2mb'`. Keep server action payloads small.
- Images: `next.config.js` allows `localhost` domain.
- Data flows:
  - UI -> Server Action (in `actions/*`) -> `prisma` -> create Transaction + Notification(s).
  - Notifications are stored in DB (`Notification` model) and polled/displayed in the UI (see `components/NotificationBell.tsx`).

Files to inspect when changing behavior
- Auth flow: `actions/auth.ts`, `lib/auth.ts`, `middleware.ts`
- Transfer logic & ACID transactions: `actions/banking.ts` (uses `prisma.$transaction`), `prisma/schema.prisma`
- Savings and scheduled transfers: `actions/savings.ts`, `actions/scheduled-transfers.ts`, `prisma/schema.prisma`
- QR payments: `actions/qr-payment.ts`, `components/QRCodeDisplay.tsx`
- 3D components & performance: `components/3d/*`, `app/dashboard/dashboard-client.tsx`

Environment & secrets
- `DATABASE_URL`: This project now uses PostgreSQL in `prisma/schema.prisma` by default. For production set `DATABASE_URL` to a managed Postgres connection string (Vercel Postgres, Supabase, etc.).
- Local dev: you may keep a SQLite `DATABASE_URL` locally (e.g. `file:./dev.db`) in your `.env` while production uses Postgres.

Quick change example to use Postgres in `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

See `VERCEL_POSTGRES_SETUP.md` for step-by-step instructions to create a Postgres DB on Vercel and push/seed the schema.
- `JWT_SECRET` must be set in env for production. `lib/auth.ts` falls back to `'your-secret-key'` for local dev — replace before deploying.

Testing & verification pointers
- After seeding, demo credentials are documented in `README.md` (e.g. `quocadmin` / `123456`). Use these to exercise login, transfers, notifications, and savings flows.
- To validate transactions: check `transactions`, `accounts`, and `notifications` tables in Prisma Studio.

Examples (common edits)
- Add a new protected route: update `middleware.ts` `protectedRoutes` and add server-side checks where necessary.
- Modify interest calculation: look at `actions/savings.ts` and `prisma/schema.prisma` for savings types and rates.
- Increase server action payload limit: edit `next.config.js` experimental `serverActions.bodySizeLimit`.

If you need more context
- Start with `README.md` for high-level features and `package.json` scripts.
- Inspect `actions/*` to see canonical server action patterns.
- Ask for specific files to review before making large behavioral changes.

Feedback
- If anything here is unclear or incomplete, tell me which area to expand (auth, transfers, 3D, prisma models, or build/deploy steps).
