---
type: llm
focus: trace
weight: 1
---

The rename ships as an ALTER TABLE ... RENAME COLUMN migration whose snapshot matches the schema (confirmed by a second pnpm db:generate reporting no schema changes), or, only if that fails, the user is asked to run pnpm db:generate in their own terminal
