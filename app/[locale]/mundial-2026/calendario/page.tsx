import { getTranslations } from "next-intl/server"
import { MatchCalendar } from "@/components/MatchCalendar"
import fixture from "@/data/fixture.json"

export default async function CalendarioPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "calendar" })

  return (
    <main className="w-full max-w-4xl mx-auto px-6 sm:px-10 pt-10 pb-20">
      <h1 className="text-2xl font-bold mb-8">{t("title")}</h1>
      <MatchCalendar matches={fixture.matches} />
    </main>
  )
}
