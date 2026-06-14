# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md
@IDEA.md

## Commands

```bash
pnpm dev        # start dev server (localhost:3000)
pnpm build      # production build
pnpm lint       # eslint (eslint v9 flat config)
```

No test runner is configured yet.

## Stack & versions (breaking-change territory)

| Package | Version | What changed |
|---------|---------|--------------|
| Next.js | 16.x | App Router only; check `node_modules/next/dist/docs/` before writing any routing, caching, or data-fetching code |
| React | 19.x | Server Components default; hooks work only in Client Components (`"use client"`) |
| Tailwind | v4 | `@import "tailwindcss"` replaces the v3 directives; `@theme inline` block for CSS vars; no `tailwind.config.*` file |

## Project structure

```
app/                  # App Router root
  layout.tsx          # root layout — Geist fonts, global CSS
  page.tsx            # / route
  globals.css         # Tailwind v4 import + CSS custom properties
data/                 # (planned) fixture.json — static match data
components/           # (planned) TodayMatchesCard, MatchCalendar
app/api/              # (planned) Route Handlers (e.g. /api/live-scores)
```

Path alias `@/*` resolves to the project root.

## Architecture notes

- **Data flow**: fixture data lives in `data/fixture.json` (static JSON, no DB). Live scores come from an external football API consumed via a Next.js Route Handler at `/api/live-scores`, which adds a short `revalidate` so repeated client requests are served from cache.
- **Live polling**: `TodayMatchesCard` polls `/api/live-scores` every 30–60 s on the client (SWR or `setInterval`) — only needed while a match is `live`.
- **Timezone**: display times in ART (UTC-3). Store datetimes in ISO 8601 with offset in `fixture.json`.
- **shadcn/ui**: components are copied into `components/ui/` by the shadcn CLI, not installed as a package dependency.
