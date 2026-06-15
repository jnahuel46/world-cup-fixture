import type { Match } from "@/lib/types"

function fmtUtc(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
}

function icsEscape(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;")
}

export function generateICS(matches: Match[]): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Mundial 2026//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ]

  for (const m of matches) {
    const start = new Date(m.date)
    const end = new Date(start.getTime() + 105 * 60 * 1000)
    lines.push(
      "BEGIN:VEVENT",
      `UID:wc26-${m.id}@mundial2026`,
      `DTSTART:${fmtUtc(start)}`,
      `DTEND:${fmtUtc(end)}`,
      `SUMMARY:${icsEscape(m.home)} vs ${icsEscape(m.away)}`,
      `LOCATION:${icsEscape(m.venue)}`,
      `DESCRIPTION:${icsEscape(m.stage)} - FIFA World Cup 2026`,
      "END:VEVENT"
    )
  }

  lines.push("END:VCALENDAR")
  return lines.join("\r\n")
}

export function downloadICS(matches: Match[], filename = "mundial-2026.ics"): void {
  const content = generateICS(matches)
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function googleCalendarUrl(match: Match): string {
  const start = new Date(match.date)
  const end = new Date(start.getTime() + 105 * 60 * 1000)
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${match.home} vs ${match.away}`,
    dates: `${fmtUtc(start)}/${fmtUtc(end)}`,
    details: `${match.stage} — FIFA World Cup 2026`,
    location: match.venue,
  })
  return `https://calendar.google.com/calendar/render?${params}`
}
