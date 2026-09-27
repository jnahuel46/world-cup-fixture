import { getTranslations } from "next-intl/server"
import { getSession } from "@/auth"
import { redirect } from "@/i18n/navigation"
import { db } from "@/lib/db"
import { getUserCompetitions } from "@/lib/preferences"
import { Dashboard } from "@/components/sports/Dashboard"
import { DashboardEditor } from "@/components/sports/DashboardEditor"
import { COMPETITIONS } from "@/lib/sports/catalog"

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const session = await getSession()
  if (!session?.user?.id) return redirect({ href: "/login", locale })

  const t = await getTranslations("dashboard")
  const competitions = await getUserCompetitions(session.user.id)
  const firstName = session.user.name?.split(" ")[0]

  return (
    <main className="flex flex-1 flex-col items-center px-4 pt-8 pb-16 bg-muted/30">
      <div className="w-full max-w-5xl flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {firstName ? t("greeting", { name: firstName }) : t("title")}
            </h1>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
          <DashboardEditor
            // Remount with fresh state after a save revalidates the page
            key={competitions.join(",")}
            all={COMPETITIONS.map((c) => c.id)}
            selected={competitions}
            canSave={db !== null}
          />
        </div>

        {competitions.length > 0 ? (
          <Dashboard competitions={competitions} />
        ) : (
          <p className="py-16 text-center text-sm text-muted-foreground">{t("empty")}</p>
        )}
      </div>
    </main>
  )
}
