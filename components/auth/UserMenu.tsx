import { getTranslations } from "next-intl/server"
import { LogOut } from "lucide-react"
import { getSession, signOut } from "@/auth"
import { Link } from "@/i18n/navigation"

export async function UserMenu({ locale }: { locale: string }) {
  const t = await getTranslations("auth")
  const session = await getSession()

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="text-xs font-semibold rounded-full px-3 py-1.5 bg-foreground text-background hover:opacity-90 transition-opacity"
      >
        {t("login")}
      </Link>
    )
  }

  async function logout() {
    "use server"
    await signOut({ redirectTo: `/${locale}` })
  }

  const { name, image } = session.user

  return (
    <div className="flex items-center gap-1">
      <Link href="/dashboard" title={name ?? undefined} className="shrink-0">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element -- Google avatar
          <img src={image} alt={name ?? ""} referrerPolicy="no-referrer" className="size-7 rounded-full ring-1 ring-border" />
        ) : (
          <span className="size-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
            {name?.[0]?.toUpperCase() ?? "?"}
          </span>
        )}
      </Link>
      <form action={logout}>
        <button
          type="submit"
          title={t("logout")}
          aria-label={t("logout")}
          className="w-7 h-7 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <LogOut className="size-3.5" />
        </button>
      </form>
    </div>
  )
}
