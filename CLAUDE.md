# CLAUDE.md

How to work in this repo. `spec.md` is the source of truth for *what* to build;
this file is *how* to build it.

## Stack

- Next.js (App Router), TypeScript
- Supabase — Postgres, magic-link auth, Row Level Security
- Tailwind CSS
- Vercel — hosting

## Tooling (use these MCP servers from the start)

- **Supabase MCP** — apply migrations, run SQL, inspect schema, manage the project.
- **Vercel MCP** — deploy and read deployment status and logs.
- **Chrome MCP** — drive the browser to verify each slice end-to-end (sign in,
  create league, create team, join a roster) after building it. This is how work
  is checked — there is no automated test suite.

## Conventions

- **No tests.** Do not write any tests (unit, integration, e2e) unless explicitly
  instructed. Verify behavior by driving the app in the browser via Chrome MCP.
- **Minimal comments.** No excessive comments. Comment only non-obvious *why*;
  never narrate what the code plainly does.
- **Explicit setup instructions.** When a step needs manual setup you cannot do
  via MCP or CLI — creating accounts, setting env vars / secrets, dashboard
  toggles, connecting a domain, enabling an auth provider — STOP and give exact,
  step-by-step instructions (where to click, what values to enter), then continue.
- **Build in vertical slices** in the order given in `spec.md`; verify each slice
  in the browser before starting the next.
- **Enforce rules at the data layer**, not just in app code (see the unique
  constraint and business rules in `spec.md`).

## Docs

- Keep `spec.md` and `CLAUDE.md` up to date and minimal. Update them in the same
  change that alters scope, a decision, or a convention.
- No duplication between the two: product/behavior → `spec.md`; workflow/tooling
  → `CLAUDE.md`.
