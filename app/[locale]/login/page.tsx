import { getTranslations } from "next-intl/server"
import { getSession, signIn } from "@/auth"
import { redirect } from "@/i18n/navigation"

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations("auth")

  if (await getSession()) redirect({ href: "/dashboard", locale })

  const configured = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_SECRET)

  async function signInWithGoogle() {
    "use server"
    await signIn("google", { redirectTo: `/${locale}/dashboard` })
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16 bg-muted/30">
      <div className="w-full max-w-sm rounded-2xl bg-card border border-border/60 shadow-sm p-8 text-center">
        <p className="text-3xl">🏆</p>
        <h1 className="mt-3 text-xl font-bold">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>

        {configured ? (
          <form action={signInWithGoogle} className="mt-6">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-semibold hover:bg-muted transition-colors"
            >
              <GoogleIcon />
              {t("google")}
            </button>
          </form>
        ) : (
          <p className="mt-6 text-sm text-amber-700 dark:text-amber-400">{t("notConfigured")}</p>
        )}
      </div>
    </main>
  )
}

function GoogleIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.94l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  )
}
