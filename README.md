# World Cup 2026 ⚽

App para seguir el Mundial FIFA 2026 sin publicidad ni distracciones — solo resultados, fixture y goleadores.

🌐 **[world-cup-fixture.vercel.app](https://world-cup-fixture.vercel.app/es)**

## Features

- **Partidos de hoy** — resultados en vivo actualizados cada 30 segundos vía football-data.org
- **Calendario** — los 72 partidos de la fase de grupos (Grupos A–L, 11 jun – 3 jul 2026)
- **Goleadores** — top 10 del torneo, actualizado cada 5 minutos
- **Mi País** — elegís tu selección y ves todos sus partidos de un vistazo
- Banderas SVG para los 48 equipos, dark mode, español e inglés

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS v4 + shadcn/ui |
| i18n | next-intl v4 (es / en) |
| Temas | next-themes (dark / light) |
| API | football-data.org (free tier) |
| Deploy | Vercel |

## Desarrollo local

```bash
pnpm install
```

Creá un archivo `.env.local` con tu API key de [football-data.org](https://www.football-data.org/client/register):

```
FOOTBALL_DATA_API_KEY=tu_clave_aqui
```

Sin la key la app funciona igual con datos simulados basados en el horario de cada partido.

```bash
pnpm dev   # localhost:3000
```
