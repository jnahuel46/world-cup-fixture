// Regenera data/fixture.json desde football-data.org
// Uso: node scripts/rebuild-fixture.mjs

import { writeFileSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const API_KEY = process.env.FOOTBALL_DATA_API_KEY

if (!API_KEY) {
  console.error("Falta FOOTBALL_DATA_API_KEY en el entorno")
  process.exit(1)
}

const EN_TO_ES = {
  "Mexico": "México",
  "South Africa": "Sudáfrica",
  "Czech Republic": "República Checa",
  "South Korea": "Corea del Sur",
  "Canada": "Canadá",
  "Bosnia and Herzegovina": "Bosnia-Herzegovina",
  "Qatar": "Catar",
  "Switzerland": "Suiza",
  "Brazil": "Brasil",
  "Haiti": "Haití",
  "Morocco": "Marruecos",
  "Scotland": "Escocia",
  "USA": "EE.UU.",
  "United States": "EE.UU.",
  "Paraguay": "Paraguay",
  "Turkey": "Turquía",
  "Australia": "Australia",
  "Germany": "Alemania",
  "Ecuador": "Ecuador",
  "Curaçao": "Curazao",
  "Ivory Coast": "Costa de Marfil",
  "Côte d'Ivoire": "Costa de Marfil",
  "Netherlands": "Países Bajos",
  "Japan": "Japón",
  "Sweden": "Suecia",
  "Tunisia": "Túnez",
  "Belgium": "Bélgica",
  "Egypt": "Egipto",
  "Iran": "Irán",
  "New Zealand": "Nueva Zelanda",
  "Spain": "España",
  "Saudi Arabia": "Arabia Saudita",
  "Uruguay": "Uruguay",
  "Cape Verde": "Cabo Verde",
  "France": "Francia",
  "Iraq": "Irak",
  "Norway": "Noruega",
  "Senegal": "Senegal",
  "Argentina": "Argentina",
  "Algeria": "Argelia",
  "Austria": "Austria",
  "Jordan": "Jordania",
  "Portugal": "Portugal",
  "Colombia": "Colombia",
  "DR Congo": "R.D. Congo",
  "Congo DR": "R.D. Congo",
  "Cape Verde Islands": "Cabo Verde",
  "Czechia": "República Checa",
  "Uzbekistan": "Uzbekistán",
  "England": "Inglaterra",
  "Croatia": "Croacia",
  "Ghana": "Ghana",
  "Panama": "Panamá",
}

function toES(name) {
  return EN_TO_ES[name] ?? name
}

function stageLabel(group) {
  if (!group) return "Fase de Grupos"
  return `Grupo ${group.replace("GROUP_", "")}`
}

console.log("Fetching matches from football-data.org...")

const res = await fetch(
  "https://api.football-data.org/v4/competitions/WC/matches?stage=GROUP_STAGE",
  { headers: { "X-Auth-Token": API_KEY } }
)

if (!res.ok) {
  console.error(`API error: ${res.status} ${res.statusText}`)
  const body = await res.text()
  console.error(body)
  process.exit(1)
}

const data = await res.json()
const apiMatches = data.matches ?? []
console.log(`Recibidos ${apiMatches.length} partidos`)

// Construir grupos
const groupsMap = {}
for (const m of apiMatches) {
  const g = m.group?.replace("GROUP_", "")
  if (!g) continue
  if (!groupsMap[g]) groupsMap[g] = new Set()
  const home = toES(m.homeTeam?.name)
  const away = toES(m.awayTeam?.name)
  if (home) groupsMap[g].add(home)
  if (away) groupsMap[g].add(away)
}

const groups = {}
for (const [k, v] of Object.entries(groupsMap).sort()) {
  groups[k] = [...v]
}

// Construir partidos
const matches = apiMatches.map((m, i) => ({
  id: `m${i + 1}`,
  date: m.utcDate,
  stage: stageLabel(m.group),
  home: toES(m.homeTeam?.name ?? ""),
  away: toES(m.awayTeam?.name ?? ""),
  venue: m.venue ?? "",
}))

const fixture = { groups, matches }
const outPath = resolve(__dirname, "../data/fixture.json")
writeFileSync(outPath, JSON.stringify(fixture, null, 2), "utf-8")

console.log(`✓ fixture.json escrito con ${matches.length} partidos en ${Object.keys(groups).length} grupos`)
console.log("Grupos:", Object.keys(groups).join(", "))
