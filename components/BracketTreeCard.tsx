import { getTranslations } from "next-intl/server"
import fixture from "@/data/fixture.json"
import { FlagIcon } from "@/components/FlagIcon"
import type { Match } from "@/lib/types"

// ─── FIFA 2026 knockout stage — read straight from fixture.json ────────────
// Round of 32 is finished; from here the bracket is drawn as a tree that
// fills in with real teams as each round's results come in ("Por definir"
// until then).

const DEFAULT_TZ = "America/Argentina/Buenos_Aires"
const CARD_WIDTH = 220
const SLOT_HEIGHT = 120
const COLUMN_GAP = 48

const ROUND_STAGES = [
  { stage: "Octavos de final", key: "octavos" },
  { stage: "Cuartos de final", key: "cuartos" },
  { stage: "Semifinal", key: "semifinal" },
  { stage: "Final", key: "final" },
] as const

function formatMatchDate(iso: string) {
  const d = new Date(iso)
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: DEFAULT_TZ,
    day: "2-digit",
    month: "2-digit",
  }).formatToParts(d)
  const day = parts.find((p) => p.type === "day")?.value
  const month = parts.find((p) => p.type === "month")?.value
  const time = d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", timeZone: DEFAULT_TZ })
  return `${day}/${month} · ${time}`
}

function TeamRow({ team, tbdLabel }: { team: string; tbdLabel: string }) {
  const isTbd = team === "Por definir"
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 min-w-0">
      <div className="shrink-0 w-6 h-4 flex items-center justify-center">
        {isTbd ? (
          <div className="w-6 h-4 rounded-[2px] bg-muted-foreground/15" />
        ) : (
          <FlagIcon team={team} className="w-6 h-4 rounded-[2px] object-cover shadow-sm" />
        )}
      </div>
      <span
        className={`text-[13px] truncate ${
          isTbd ? "italic text-muted-foreground/60" : "font-semibold text-foreground"
        }`}
      >
        {isTbd ? tbdLabel : team}
      </span>
    </div>
  )
}

function MatchCard({
  match,
  tbdLabel,
  isFinal,
  fixedWidth = true,
}: {
  match: Match
  tbdLabel: string
  isFinal?: boolean
  fixedWidth?: boolean
}) {
  return (
    <div
      style={fixedWidth ? { width: CARD_WIDTH } : undefined}
      className={`rounded-lg border bg-card shadow-sm overflow-hidden ${
        fixedWidth ? "" : "w-full"
      } ${
        isFinal
          ? "border-amber-300 dark:border-amber-700 ring-1 ring-amber-200/50 dark:ring-amber-800/30"
          : "border-border/60"
      }`}
    >
      {isFinal && (
        <div className="bg-amber-50 dark:bg-amber-950/30 px-3 py-0.5 text-[9px] font-black uppercase tracking-wide text-amber-700 dark:text-amber-400 text-center">
          🏆 Final
        </div>
      )}
      <TeamRow team={match.home} tbdLabel={tbdLabel} />
      <div className="mx-3 border-t border-border/50" />
      <TeamRow team={match.away} tbdLabel={tbdLabel} />
      <div className="px-3 py-1 bg-muted/30 text-[9px] text-muted-foreground truncate">
        {formatMatchDate(match.date)}
        {match.venue ? ` · ${match.venue}` : ""}
      </div>
    </div>
  )
}

// Elbow connector joining the two feeder matches (previous round) into this
// match's vertical center. Pure CSS: each round column shares the same fixed
// height, so every match's own container is an exact 1/N fraction of it,
// which makes these percentages line up across rounds without any JS math.
function Connector() {
  return (
    <>
      <div
        className="absolute border-l-2 border-border"
        style={{ left: -COLUMN_GAP / 2, top: "25%", height: "50%", width: 0 }}
      />
      <div
        className="absolute border-t-2 border-border"
        style={{ left: -COLUMN_GAP, top: "25%", width: COLUMN_GAP / 2, height: 0 }}
      />
      <div
        className="absolute border-t-2 border-border"
        style={{ left: -COLUMN_GAP, top: "75%", width: COLUMN_GAP / 2, height: 0 }}
      />
      <div
        className="absolute border-t-2 border-border"
        style={{ left: -COLUMN_GAP / 2, top: "50%", width: COLUMN_GAP / 2, height: 0 }}
      />
    </>
  )
}

export async function BracketTreeCard() {
  const t = await getTranslations("bracket")

  const byStage = new Map<string, Match[]>()
  for (const m of fixture.matches as Match[]) {
    if (!byStage.has(m.stage)) byStage.set(m.stage, [])
    byStage.get(m.stage)!.push(m)
  }
  for (const list of byStage.values()) {
    list.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))
  }

  const rounds = ROUND_STAGES.map(({ stage, key }) => ({
    key,
    label: t(key),
    matches: byStage.get(stage) ?? [],
  }))

  const thirdPlace = (byStage.get("Tercer puesto") ?? [])[0]
  const totalHeight = (rounds[0]?.matches.length || 1) * SLOT_HEIGHT
  const totalWidth = rounds.length * CARD_WIDTH + (rounds.length - 1) * COLUMN_GAP

  return (
    <div className="w-full space-y-6">
      {/* Page header */}
      <div className="rounded-2xl overflow-hidden bg-card shadow-sm border border-emerald-100/80 dark:border-emerald-900/40 ring-1 ring-black/5 dark:ring-white/5">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/20 px-5 py-4">
          <p className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-[0.15em]">
            ⚽ FIFA World Cup 2026
          </p>
          <h1 className="text-foreground font-bold text-xl leading-tight mt-1">{t("title")}</h1>
          <p className="text-muted-foreground text-xs mt-1">{t("subtitle")}</p>
        </div>
      </div>

      {/* Mobile: simple stacked rounds, plain vertical scroll — no tree, no horizontal scroll */}
      <div className="md:hidden space-y-6">
        {rounds.map((round) => (
          <div key={round.key}>
            <p className="text-center text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">
              {round.label}
            </p>
            <div className="space-y-3 max-w-sm mx-auto">
              {round.matches.map((m) => (
                <MatchCard
                  key={m.id}
                  match={m}
                  tbdLabel={t("tbd")}
                  isFinal={round.key === "final"}
                  fixedWidth={false}
                />
              ))}
            </div>
          </div>
        ))}
        {thirdPlace && (
          <div>
            <p className="text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
              {t("thirdPlace")}
            </p>
            <div className="max-w-sm mx-auto">
              <MatchCard match={thirdPlace} tbdLabel={t("tbd")} fixedWidth={false} />
            </div>
          </div>
        )}
      </div>

      {/* Desktop: bracket tree with connectors */}
      <div className="hidden md:block overflow-x-auto pb-2">
        <div style={{ minWidth: totalWidth }} className="px-1">
          {/* Round labels */}
          <div className="flex" style={{ gap: COLUMN_GAP }}>
            {rounds.map((round) => (
              <p
                key={round.key}
                style={{ flex: `0 0 ${CARD_WIDTH}px` }}
                className="text-center text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400"
              >
                {round.label}
              </p>
            ))}
          </div>

          {/* Bracket body */}
          <div className="flex mt-3" style={{ gap: COLUMN_GAP, height: totalHeight }}>
            {rounds.map((round, ri) => (
              <div
                key={round.key}
                className="flex flex-col"
                style={{ flex: `0 0 ${CARD_WIDTH}px` }}
              >
                {round.matches.map((m) => (
                  <div key={m.id} className="relative flex items-center justify-center" style={{ flex: 1 }}>
                    {ri > 0 && <Connector />}
                    <MatchCard match={m} tbdLabel={t("tbd")} isFinal={round.key === "final"} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Third place — desktop */}
      {thirdPlace && (
        <div className="hidden md:block max-w-[220px] mx-auto">
          <p className="text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
            {t("thirdPlace")}
          </p>
          <MatchCard match={thirdPlace} tbdLabel={t("tbd")} />
        </div>
      )}

      {/* Footer note */}
      <p className="text-center text-[11px] text-muted-foreground/70 pb-2">{t("note")}</p>
    </div>
  )
}
