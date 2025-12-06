# Vercel + Postgres Setup (Quick Steps)

This project requires a persistent database in production. The recommended approach for Vercel is to use Vercel Postgres (or another managed Postgres provider).

1. Create a Postgres instance
   - Option A (recommended): Create a Vercel Postgres database in your Vercel project.
   - Option B: Use Supabase, ElephantSQL, PlanetScale (MySQL alternative), or any managed Postgres.

2. Add environment variables in Vercel
   - In your Vercel project settings, add the following environment variables (Environment = Production):
     - `DATABASE_URL` = your postgres connection string (e.g. `postgresql://user:pass@host:5432/dbname`)
     - `JWT_SECRET` = a long random secret used to sign JWTs

3. Update Prisma (locally or in CI)
   - Locally (with `DATABASE_URL` pointing to the hosted Postgres):
```bash
npm install
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

4. Redeploy on Vercel
   - Trigger a new deployment. The app will use the `DATABASE_URL` from Vercel env.

Notes & troubleshooting
- If you keep a local SQLite URL for development, set `DATABASE_URL` locally to `file:./dev.db` in a `.env` and keep the Postgres `DATABASE_URL` on Vercel only.
- If you changed `prisma/schema.prisma` provider to `postgresql`, ensure `DATABASE_URL` points to a Postgres server before running `prisma:push`.
- Check Vercel logs if you see an error thrown from `lib/prisma.ts` or `lib/auth.ts` — those guards will fail fast and help you see missing envs or use of SQLite in production.

Example `DATABASE_URL` (Postgres):
```
postgresql://username:password@db-host.example.com:5432/quocbank
```

Example `JWT_SECRET` (generate with `openssl rand -base64 32`):
```
_A_LONG_RANDOM_SECRET_STRING_
```
