import * as Flags from "country-flag-icons/react/3x2"

type FlagKey = keyof typeof Flags

const CODES: Record<string, string> = {
  "Argentina":           "AR",
  "Alemania":            "DE",
  "Arabia Saudita":      "SA",
  "Argelia":             "DZ",
  "Australia":           "AU",
  "Austria":             "AT",
  "Bélgica":             "BE",
  "Bosnia-Herzegovina":  "BA",
  "Brasil":              "BR",
  "Canadá":              "CA",
  "Catar":               "QA",
  "Corea del Sur":       "KR",
  "Costa de Marfil":     "CI",
  "Croacia":             "HR",
  "Curazao":             "CW",
  "Ecuador":             "EC",
  "Egipto":              "EG",
  "Escocia":             "GB_SCT",
  "España":              "ES",
  "EE.UU.":              "US",
  "Francia":             "FR",
  "Ghana":               "GH",
  "Haití":               "HT",
  "Inglaterra":          "GB_ENG",
  "Irak":                "IQ",
  "Irán":                "IR",
  "Japón":               "JP",
  "Jordania":            "JO",
  "Marruecos":           "MA",
  "México":              "MX",
  "Noruega":             "NO",
  "Nueva Zelanda":       "NZ",
  "Países Bajos":        "NL",
  "Panamá":              "PA",
  "Paraguay":            "PY",
  "Portugal":            "PT",
  "R.D. Congo":          "CD",
  "República Checa":     "CZ",
  "Senegal":             "SN",
  "Suecia":              "SE",
  "Suiza":               "CH",
  "Sudáfrica":           "ZA",
  "Túnez":               "TN",
  "Turquía":             "TR",
  "Uruguay":             "UY",
  "Uzbekistán":          "UZ",
  "Cabo Verde":          "CV",
}

export function FlagIcon({ team, className = "w-6 h-4 rounded-[2px] object-cover" }: { team: string; className?: string }) {
  const code = CODES[team] as FlagKey | undefined
  if (!code) return <span className="text-lg">🏳️</span>
  const Flag = Flags[code]
  if (!Flag) return <span className="text-lg">🏳️</span>
  return <Flag className={className} title={team} />
}
