# Atelier Store

Next.js (App Router) + TypeScript + Tailwind CSS v4 + Better Auth + Drizzle ORM + Neon Postgres.

## Setup

```bash
pnpm install
cp .env.example .env.local   # fill in DATABASE_URL, BETTER_AUTH_SECRET, ...
pnpm dev
```

## Scripts

| Script | Purpose |
| --- | --- |
| `dev` / `build` / `start` | Next.js |
| `lint` / `typecheck` | ESLint / `next typegen && tsc` |
| `db:generate` / `db:migrate` | Create / apply SQL migrations in `drizzle/` |
| `db:push` / `db:studio` | Push schema directly / open Drizzle Studio |

## Structure

```
src/
  app/
    api/auth/[...all]/route.ts  # Better Auth handler
  components/                   # shared UI (empty)
  db/
    index.ts                    # Drizzle client (neon-http)
    schema/index.ts             # schema entry (empty)
  lib/
    env.ts                      # zod-validated server env
    auth.ts                     # Better Auth server instance
    auth-client.ts              # Better Auth React client
drizzle/                        # generated migrations
drizzle.config.ts
```

Better Auth tables are not created yet: run `pnpm dlx @better-auth/cli generate` to emit the Drizzle schema, then `pnpm db:generate && pnpm db:migrate`.
