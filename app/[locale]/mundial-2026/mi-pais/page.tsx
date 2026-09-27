import { getTranslations } from "next-intl/server"
import { MyCountryCard } from "@/components/MyCountryCard"
import fixture from "@/data/fixture.json"
import type { Match } from "@/lib/types"

export default async function MiPaisPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "myCountry" })

  return (
    <main className="flex flex-1 flex-col items-center px-4 pt-10 pb-20 bg-muted/30">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-8">{t("title")}</h1>
        <MyCountryCard matches={fixture.matches as Match[]} />
      </div>
    </main>
  )
}
