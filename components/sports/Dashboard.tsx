import { Suspense } from "react"
import { getCompetition, type CompetitionId } from "@/lib/sports/catalog"
import { F1Card } from "./F1Card"
import { FootballCard } from "./FootballCard"
import { SportCardSkeleton } from "./SportCard"

function CompetitionCard({ id }: { id: CompetitionId }) {
  const competition = getCompetition(id)
  if (!competition) return null
  if (competition.sport === "motorsport") return <F1Card />
  return <FootballCard competition={id} code={competition.code!} />
}

/** Grid of competition cards; each one streams in independently so a slow API doesn't block the rest. */
export function Dashboard({ competitions }: { competitions: CompetitionId[] }) {
  return (
    <div className="grid w-full gap-6 md:grid-cols-2 items-start">
      {competitions.map((id) => (
        <Suspense key={id} fallback={<SportCardSkeleton />}>
          <CompetitionCard id={id} />
        </Suspense>
      ))}
    </div>
  )
}
