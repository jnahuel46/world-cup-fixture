import type { Metadata } from "next"
import { Nunito } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"
import { routing } from "@/i18n/routing"
import { Link } from "@/i18n/navigation"
import { NavLinks } from "@/components/NavLinks"
import { LocaleSwitcher } from "@/components/LocaleSwitcher"
import { ThemeProvider } from "@/components/ThemeProvider"
import { ThemeToggle } from "@/components/ThemeToggle"
import "../globals.css"

const nunito = Nunito({ variable: "--font-sans", subsets: ["latin"], display: "swap" })

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "meta" })
  return {
    title: t("title"),
    description: t("description"),
    icons: { icon: "/favicon.svg" },
  }
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound()
  }

  const messages = await getMessages()
  const t = await getTranslations({ locale, namespace: "nav" })

  return (
    <html
      lang={locale}
      className={`${nunito.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-gradient-to-br from-emerald-50/60 via-background to-green-50/30 dark:from-emerald-950/20 dark:via-background dark:to-green-950/10">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <NextIntlClientProvider messages={messages}>
            {/* Navbar */}
            <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-md">
              <nav className="max-w-4xl mx-auto px-4 flex h-14 items-center gap-4">
                <Link href="/" className="flex items-center gap-2 mr-2 shrink-0">
                  <span className="text-lg leading-none">⚽</span>
                  <span className="font-bold text-sm tracking-tight">{t("title")}</span>
                </Link>
                <NavLinks today={t("today")} calendar={t("calendar")} />
                <div className="ml-auto flex items-center gap-2">
                  <ThemeToggle />
                  <LocaleSwitcher />
                </div>
              </nav>
            </header>

            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
