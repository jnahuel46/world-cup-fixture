import { getTranslations } from "next-intl/server"
import { WorldCupNav } from "@/components/WorldCupNav"

export default async function WorldCupLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("nav")
  const base = "/mundial-2026"

  return (
    <>
      <WorldCupNav
        links={[
          { href: base, label: t("today") },
          { href: `${base}/calendario`, label: t("calendar") },
          { href: `${base}/grupos`, label: t("groups") },
          { href: `${base}/llaves`, label: t("bracket") },
          { href: `${base}/mi-pais`, label: t("myCountry") },
        ]}
      />
      {children}
    </>
  )
}
