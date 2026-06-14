import { TodayMatchesCard } from "@/components/TodayMatchesCard"

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-12 bg-muted/30">
      <TodayMatchesCard />
    </main>
  )
}
