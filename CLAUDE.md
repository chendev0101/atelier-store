# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

`AGENTS.md` is rewritten by `next dev`; put project rules here, not inside its BEGIN/END block. Next.js here is 16.x — check `node_modules/next/dist/docs/` before using framework APIs.

## Language

- 一律用繁體中文（台灣用語）回應。
- 程式碼、指令、檔名、commit message 和程式碼註解維持英文。

## Commands

```bash
pnpm dev          # Next.js dev server (Turbopack)
pnpm build
pnpm lint         # ESLint (flat config)
pnpm typecheck    # next typegen && tsc --noEmit — typegen is required, it generates globals like LayoutProps
pnpm db:generate  # drizzle-kit: write SQL migrations to drizzle/ from src/db/schema
pnpm db:migrate   # apply migrations to Neon
pnpm db:push      # push schema without migrations (prototyping only)
pnpm db:seed      # upsert the starting catalogue (src/db/seed); re-runnable, resets stock
pnpm db:studio
```

No test framework is set up yet.

`pnpm build` reads the catalogue (for `generateStaticParams` and cached pages), so the build environment needs `DATABASE_URL` pointing at a migrated, seeded database.

## Git

Branches: `<type>/<short-name>`, e.g. `feat/homepage`, `chore/project-setup`.

Commits follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <imperative, lowercase subject, ~50 chars, no period>

<optional body: why the change was made and any caveats, wrapped at ~72.
Not a file-by-file list of what changed — the diff shows that.>
```

- Types: `feat`, `fix`, `refactor`, `chore`, `docs`, `style`, `test`, `perf`.
- Scope is the area touched: `home`, `products`, `catalog`, `auth`, `db`, `ui`.
- One concern per commit: split refactors from the feature that needs them, and make sure each commit passes `pnpm typecheck` and `pnpm lint` on its own.

Env lives in `.env.local` (template: `.env.example`). `drizzle.config.ts` loads `.env.local` via dotenv; the app loads it via Next.js.

## Architecture

Stack: Next.js App Router (`src/`, alias `@/*` → `src/*`), TypeScript, Tailwind v4, Better Auth, Drizzle ORM, Neon Postgres.

Server-side dependency chain:

```
src/lib/env.ts  →  src/db/index.ts  →  src/lib/auth.ts  →  src/app/api/auth/[...all]/route.ts
```

- `src/lib/env.ts` — zod-validates server env at import time and throws on invalid values. Add new server env vars to its schema and to `.env.example`. Read env through `env`, not `process.env`.
- `src/db/index.ts` — Drizzle over `drizzle-orm/neon-http` (stateless HTTP; no interactive transactions). Exports `db` with the full schema attached.
- `src/db/schema/` — table definitions; every table must be re-exported from `schema/index.ts` (both `db` and drizzle-kit read that entry). `catalog.ts` holds `categories`, `products` (price in cents) and 1:1 `inventory`. Schema files must not import `server-only`: drizzle-kit and the seed script load them outside Next.js.
- `src/db/queries/catalog.ts` — the only place pages read the catalogue. Each function is `"use cache"` + `cacheLife("minutes")` + `cacheTag("catalog")` (required under `cacheComponents`); call `updateTag("catalog")` after catalogue or stock writes. Rows are mapped to the domain types in `src/lib/catalog.ts` (types + pure helpers like `formatPrice`, `toStockStatus`, safe to import anywhere).
- `src/lib/storefront-content.ts` — editorial homepage content (imagery, copy, hand-picked product slugs); not in the DB.
- `src/db/seed/` — `pnpm db:seed` builds its own Neon client (it can't import `@/db`, which is `server-only`).
- `src/lib/auth.ts` — Better Auth with `drizzleAdapter(db, { provider: "pg" })`. `nextCookies()` must remain the last plugin. Server code gets sessions via `auth.api.getSession({ headers })`.
- `src/lib/auth-client.ts` — browser client (`better-auth/react`), uses `NEXT_PUBLIC_APP_URL`.

`env.ts`, `db`, and `auth.ts` import `server-only`; importing them from a Client Component fails the build.

Better Auth tables do not exist yet — the auth route errors at runtime until they are generated (`pnpm dlx @better-auth/cli generate` into `src/db/schema/`) and migrated.
