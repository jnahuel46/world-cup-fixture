# Mundial App — Plan de Desarrollo

## Etapa 1 (MVP)

### Objetivo
Calendario con el fixture del Mundial (desde JSON) + card de "Partidos de hoy" con resultados en tiempo real.

### Stack
- **Next.js 15** (App Router) en **Vercel**
- **shadcn/ui** para componentes (Card, Calendar, Badge, Tabs)
- **Tailwind CSS**
- Fixture inicial: JSON estático en `/data/fixture.json` (sin DB todavía)
- Resultados en vivo: API pública (API-Football o football-data.org) consumida desde un Route Handler de Next.js
- **Vercel Cron** (opcional incluso en MVP) o simplemente `fetch` con `revalidate` corto (ej. 60s) para actualizar resultados sin cron

### Estructura de datos (fixture.json)
```json
{
  "matches": [
    {
      "id": "m1",
      "date": "2026-06-15T18:00:00-04:00",
      "stage": "Grupo A",
      "home": "Equipo A",
      "away": "Equipo B",
      "venue": "Estadio X"
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
- [ ] Setup Next.js 15 + Tailwind + shadcn
- [ ] Crear `fixture.json` con partidos del Mundial 2026
- [ ] Componente `TodayMatchesCard`
- [ ] Componente `MatchCalendar`
- [ ] Route handler `/api/live-scores` (elegir proveedor de API y obtener API key)
- [ ] Polling de resultados en vivo
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

## Decisiones pendientes
- Proveedor de API de resultados en vivo (API-Football vs football-data.org — revisar costos/límites del free tier)
- Zona horaria a usar para mostrar horarios (ART por defecto)