import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"
import { routing } from "@/i18n/routing"
import { Link } from "@/i18n/navigation"
import { LocaleSwitcher } from "@/components/LocaleSwitcher"
import "../globals.css"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "meta" })
  return { title: t("title"), description: t("description") }
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <header className="border-b">
            <nav className="max-w-4xl mx-auto px-4 flex h-14 items-center gap-6">
              <Link href="/" className="font-bold text-base">
                {t("title")}
              </Link>
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("today")}
              </Link>
              <Link
                href="/calendario"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("calendar")}
              </Link>
              <div className="ml-auto">
                <LocaleSwitcher />
              </div>
            </nav>
          </header>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
