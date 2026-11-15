# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

`AGENTS.md` is rewritten by `next dev`; put project rules here, not inside its BEGIN/END block. Next.js here is 16.x — check `node_modules/next/dist/docs/` before using framework APIs.

## Commands

```bash
pnpm dev          # Next.js dev server (Turbopack)
pnpm build
pnpm lint         # ESLint (flat config)
pnpm typecheck    # next typegen && tsc --noEmit — typegen is required, it generates globals like LayoutProps
pnpm db:generate  # drizzle-kit: write SQL migrations to drizzle/ from src/db/schema
pnpm db:migrate   # apply migrations to Neon
pnpm db:push      # push schema without migrations (prototyping only)
pnpm db:studio
```

No test framework is set up yet.

Env lives in `.env.local` (template: `.env.example`). `drizzle.config.ts` loads `.env.local` via dotenv; the app loads it via Next.js.

## Architecture

Stack: Next.js App Router (`src/`, alias `@/*` → `src/*`), TypeScript, Tailwind v4, Better Auth, Drizzle ORM, Neon Postgres.

Server-side dependency chain:

```
src/lib/env.ts  →  src/db/index.ts  →  src/lib/auth.ts  →  src/app/api/auth/[...all]/route.ts
```

- `src/lib/env.ts` — zod-validates server env at import time and throws on invalid values. Add new server env vars to its schema and to `.env.example`. Read env through `env`, not `process.env`.
- `src/db/index.ts` — Drizzle over `drizzle-orm/neon-http` (stateless HTTP; no interactive transactions). Exports `db` with the full schema attached.
- `src/db/schema/` — table definitions; every table must be re-exported from `schema/index.ts` (both `db` and drizzle-kit read that entry). Currently empty.
- `src/lib/auth.ts` — Better Auth with `drizzleAdapter(db, { provider: "pg" })`. `nextCookies()` must remain the last plugin. Server code gets sessions via `auth.api.getSession({ headers })`.
- `src/lib/auth-client.ts` — browser client (`better-auth/react`), uses `NEXT_PUBLIC_APP_URL`.

`env.ts`, `db`, and `auth.ts` import `server-only`; importing them from a Client Component fails the build.

Better Auth tables do not exist yet — the auth route errors at runtime until they are generated (`pnpm dlx @better-auth/cli generate` into `src/db/schema/`) and migrated.
