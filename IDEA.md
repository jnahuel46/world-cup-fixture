# Mundial App — Plan de Desarrollo

## Etapa 1 (MVP)

### Objetivo
Calendario con el fixture del Mundial (desde JSON) + card de "Partidos de hoy" con resultados en tiempo real.

### Stack
- **Next.js 16** (App Router) en **Vercel**
- **shadcn/ui** para componentes (Calendar, Skeleton; Card/Badge/Tabs via Tailwind)
- **Tailwind CSS v4**
- **next-intl v4** — español (default) e inglés, prefix-all-locales
- **next-themes** — dark / light mode
- **country-flag-icons** — banderas SVG de los 48 países
- **Nunito** (Google Fonts) — fuente principal, bordes redondeados
- Fixture inicial: JSON estático en `/data/fixture.json` (sin DB todavía)
- Resultados en vivo: API pública (football-data.org) consumida desde un Route Handler de Next.js
- `fetch` con `revalidate: 30` para cachear respuestas sin cron

### Estructura de datos (fixture.json)
72 partidos de fase de grupos (Grupos A–L, 48 equipos reales, 11 jun – 3 jul 2026).
Fechas en ISO 8601 con offset `-04:00` (ET); se muestran en ART (UTC-3).

```json
{
  "groups": { "A": ["México", "Sudáfrica", "República Checa", "Corea del Sur"], "...": [] },
  "matches": [
    {
      "id": "m1",
      "date": "2026-06-11T19:00:00-04:00",
      "stage": "Grupo A",
      "home": "México",
      "away": "Sudáfrica",
      "venue": "Estadio Azteca, Ciudad de México"
    }
  ]
}
```

### Pantallas / Componentes

1. **Página principal (`/`)**
   - `TodayMatchesCard`: lista de partidos del día actual, con resultado en vivo (si está jugándose) o "vs" si aún no empezó
   - Estado de partido: `scheduled | live | finished`
   - Polling cada 30-60s con `useSWR` o `fetch` + `setInterval` para partidos en vivo

2. **Calendario (`/calendario`)**
   - Vista de calendario (shadcn `Calendar` + lista lateral o debajo con los partidos del día seleccionado)
   - Filtro por fecha, fase de grupos, etc. (opcional en MVP)

3. **API Route (`/api/live-scores`)**
   - Consulta a la API externa de resultados
   - Devuelve solo los partidos del día con su estado/resultado
   - Cachea con `revalidate: 30` o similar

### Componentes shadcn a instalar
- `card`
- `calendar`
- `badge`
- `tabs`
- `skeleton` (loading states)

### Tareas
- [x] Setup Next.js 16 + Tailwind v4 + shadcn/ui
- [x] Crear `fixture.json` con los 72 partidos reales del Mundial 2026
- [x] Componente `TodayMatchesCard` (polling 30s, banderas SVG, dark mode, banner "Próximamente")
- [x] Componente `MatchCalendar` (dots en días con partidos, panel de ancho fijo, banderas)
- [x] Route handler `/api/live-scores` con mock scores (proveedor: football-data.org)
- [x] Polling de resultados en vivo (mock hasta obtener API key)
- [x] i18n español / inglés con next-intl
- [x] Dark / light mode con next-themes
- [x] Banderas con country-flag-icons
- [x] Fuente Nunito (suave, bordes redondeados)
- [x] Favicon pelota de fútbol (SVG)
- [ ] Obtener API key de football-data.org y conectar resultados reales
- [ ] Deploy a Vercel

---

## Etapa 2 (Próximos pasos — fuera del MVP)
- PWA (instalable en celular) con `next-pwa` + manifest + service worker
- Web Push notifications (VAPID keys, suscripciones guardadas en DB)
- Bot de Telegram (BotFather, `/start` para registrar `chat_id`)
- DB (Vercel Postgres / Supabase) para suscripciones y fixture dinámico
- Vercel Cron para notificaciones automáticas (push + Telegram) antes de cada partido
- Persistencia de resultados (evitar llamadas repetidas a la API externa)

---

## Decisiones tomadas
- **Proveedor de API**: football-data.org (free tier, sin tarjeta de crédito). Env var: `FOOTBALL_DATA_API_KEY` en `.env.local`.
- **Zona horaria**: ART (America/Argentina/Buenos_Aires, UTC-3) para mostrar horarios. Datetimes guardados con offset `-04:00` (ET).