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

| Package | Version | Notes |
|---------|---------|-------|
| Next.js | 16.x | App Router only; check `node_modules/next/dist/docs/` before writing any routing, caching, or data-fetching code |
| React | 19.x | Server Components default; hooks work only in Client Components (`"use client"`) |
| Tailwind | v4 | `@import "tailwindcss"` replaces the v3 directives; `@theme inline` block for CSS vars; no `tailwind.config.*` file |
| next-intl | v4 | `defineRouting`, `createNavigation`, `getRequestConfig`; middleware renamed to `proxy.ts` in Next.js 16 |
| next-themes | — | `ThemeProvider` wraps the locale layout; `attribute="class"` triggers `.dark` on `<html>` |
| react-day-picker | v10 | Breaking: `fromDate`/`toDate` → `startMonth`/`endMonth`; `table` key removed from `ClassNames` |

## Project structure

```
app/
  layout.tsx                  # root layout — returns children only (no html/body)
  [locale]/
    layout.tsx                # locale layout — Nunito font, ThemeProvider, navbar, NextIntlClientProvider
    page.tsx                  # / → TodayMatchesCard
    globals.css               # Tailwind v4 import + shadcn CSS custom properties (light + dark)
    calendario/
      page.tsx                # /calendario → MatchCalendar (server component, reads fixture.json)
api/
  live-scores/
    route.ts                  # GET → today's matches in ART, mock scores when no API key
data/
  fixture.json                # 72 group-stage matches, Groups A–L, June 11 – July 3
components/
  TodayMatchesCard.tsx        # client, polls /api/live-scores every 30s
  MatchCalendar.tsx           # client, shadcn Calendar + fixed-width match list panel
  FlagIcon.tsx                # SVG flags via country-flag-icons (GB_ENG / GB_SCT supported)
  NavLinks.tsx                # client, active pill state via usePathname
  LocaleSwitcher.tsx          # client, swaps locale preserving path
  ThemeProvider.tsx           # thin wrapper around next-themes ThemeProvider
  ThemeToggle.tsx             # sun/moon icon button, mounted-guarded to avoid hydration flash
  ui/                         # shadcn components (calendar, skeleton, …)
i18n/
  routing.ts                  # locales: ["es", "en"], defaultLocale: "es"
  navigation.ts               # createNavigation exports (Link, usePathname, …)
  request.ts                  # getRequestConfig for next-intl
messages/
  es.json                     # Spanish translations
  en.json                     # English translations
lib/
  types.ts                    # Match, LiveMatch, MatchStatus
proxy.ts                      # next-intl middleware (Next.js 16 renamed from middleware.ts)
public/
  favicon.svg                 # soccer ball emoji SVG
```

Path alias `@/*` resolves to the project root.

## Architecture notes

- **Data flow**: `data/fixture.json` is the source of truth (static, 72 matches). The `/api/live-scores` Route Handler filters today's matches by ART date, then either calls the real API (when `FOOTBALL_DATA_API_KEY` is set in `.env.local`) or returns mock statuses derived from the current time vs match start + 105 min.
- **Live polling**: `TodayMatchesCard` uses `setInterval(fetch, 30_000)`. The route has `export const revalidate = 30`.
- **Timezone**: all datetimes stored as ISO 8601 with `-04:00` (ET) offset. Display and date-filtering use `America/Argentina/Buenos_Aires` (ART, UTC-3) via `Intl.DateTimeFormat`.
- **Dark mode**: `.dark` class on `<html>` (next-themes `attribute="class"`). shadcn CSS variables cover most components automatically; custom pastel colors in `TodayMatchesCard` use explicit `dark:` variants. `suppressHydrationWarning` on `<html>` prevents mismatch.
- **Flags**: `FlagIcon` component uses `country-flag-icons/react/3x2`. Country code map lives in `components/FlagIcon.tsx`. All 48 WC teams mapped; England = `GB_ENG`, Scotland = `GB_SCT`.
- **i18n**: prefix-all-locales (`/es/…`, `/en/…`), default = `es`. Root layout (`app/layout.tsx`) is a passthrough. Locale layout wraps everything in `NextIntlClientProvider`.
- **Calendar layout**: `MatchCalendar` uses CSS grid `grid-cols-[auto_320px]` so the match list panel stays fixed-width when the selected date changes.
- **shadcn/ui**: components are copied into `components/ui/` by the CLI — not installed as a package.
