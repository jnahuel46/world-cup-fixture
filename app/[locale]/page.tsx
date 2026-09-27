import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { getSession } from "@/auth"
import { Dashboard } from "@/components/sports/Dashboard"
import { DEFAULT_COMPETITIONS } from "@/lib/sports/catalog"

export default async function Home() {
  const t = await getTranslations("home")
  const session = await getSession()

  return (
    <main className="flex flex-1 flex-col items-center px-4 pt-8 pb-16 bg-muted/30">
      <div className="w-full max-w-5xl flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
          <Link
            href={session ? "/dashboard" : "/login"}
            className="self-start sm:self-auto text-sm font-semibold px-4 py-2 rounded-full bg-foreground text-background hover:opacity-90 transition-opacity"
          >
            {session ? t("goToDashboard") : t("customizeCta")}
          </Link>
        </div>

        <Dashboard competitions={DEFAULT_COMPETITIONS} />
      </div>
    </main>
  )
}
