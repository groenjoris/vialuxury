/**
 * Multi Hotel Trip — reisduur-opties (aantal nachten) voor alle pickers.
 *
 * R1 kende '1'…'4' + '5+'. Vakanties (twee of drie hotels achter elkaar)
 * duren langer, dus de reisduur is uitgebreid naar losse categorieën
 * 5, 6, 7 en 8 nachten — overal (zoekbalk, mobiele modal, filterpaneel,
 * pills, kaart, hotelpagina). '8' dekt ook langere verblijven.
 */
export const NIGHT_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8'] as const
export type NightKey = (typeof NIGHT_KEYS)[number]

/** De reisduren die bij "Vakanties" horen — automatisch voorgeselecteerd
 *  wanneer de gebruiker via de hoofdnavigatie op Vakanties klikt. */
export const TRIP_NIGHT_KEYS: NightKey[] = ['5', '6', '7', '8']

/**
 * Reisduur in twee groepen i.p.v. één lange lijst van acht: "Kort verblijf"
 * (1 t/m 4 nachten) en "Vakantie" (5 t/m 8 nachten). Alle pickers
 * (zoekbalk, filterpaneel, mobiele modal, hotelpagina) tonen de groep als
 * kop (zonder bereik-toelichting) met de losse nachten als verticale lijst
 * eronder; de opgeslagen state blijft de lijst night-keys.
 */
export type NightGroupId = 'short' | 'long'
export interface NightGroup {
  id: NightGroupId
  keys: NightKey[]
  /** i18n-key voor de groepsnaam. */
  labelKey: string
}
export const NIGHT_GROUPS: NightGroup[] = [
  { id: 'short', keys: ['1', '2', '3', '4'], labelKey: 'nights.group.short' },
  { id: 'long', keys: ['5', '6', '7', '8'], labelKey: 'nights.group.long' },
]

/** Hoeveel van de groep is geselecteerd: niets, een deel of alles. */
export function nightGroupState(selected: readonly string[], group: NightGroup): 'none' | 'some' | 'all' {
  const n = group.keys.filter(k => selected.includes(k)).length
  if (n === 0) return 'none'
  return n === group.keys.length ? 'all' : 'some'
}

/** Groepstoggle: alles aan → groep leeg; anders de hele groep aan. Geeft de
 *  nieuwe selectie terug (andere groep blijft ongemoeid). */
export function toggleNightGroup(selected: readonly string[], group: NightGroup): string[] {
  const rest = selected.filter(k => !(group.keys as string[]).includes(k))
  return nightGroupState(selected, group) === 'all' ? rest : [...rest, ...group.keys]
}

/**
 * Korte samenvatting van een selectie voor veldwaarden en pills:
 * een volledige groep heet bij haar naam ("Kort verblijf", "Vakantie",
 * beide → "Kort of lang verblijf"); anders de losse nachten ("5, 6 of 7
 * nachten"). `t` levert de vertalingen.
 */
export function summarizeNightKeys(
  keys: readonly string[],
  t: (key: string) => string,
  words: { night: string; nights: string; or: string },
): string {
  if (keys.length === 0) return ''
  const full = NIGHT_GROUPS.filter(g => nightGroupState(keys, g) === 'all')
  const covered = full.flatMap(g => g.keys as string[])
  if (full.length === NIGHT_GROUPS.length) return t('nights.group.both')
  if (full.length === 1 && keys.every(k => covered.includes(k))) return t(full[0]!.labelKey)
  if (keys.length === 1) return nightKeyLabel(keys[0]!, words.night, words.nights)
  return `${joinNightKeys(keys, words.or)} ${words.nights}`
}

const MAX_NIGHT_KEY = 8

/** Reisduur-key voor een deal: 1…7 exact, 8 = acht nachten of langer. */
export function nightKeyFor(nights: number): string {
  if (nights >= MAX_NIGHT_KEY) return String(MAX_NIGHT_KEY)
  return String(Math.max(1, nights))
}

/** Voldoet een verblijfsduur aan de geselecteerde reisduur-keys? Lege
 *  selectie = alles matcht. */
export function matchesNightKeys(nights: number, selected: readonly string[]): boolean {
  if (!selected || selected.length === 0) return true
  return selected.includes(nightKeyFor(nights))
}

export function isNightKey(value: string): value is NightKey {
  return (NIGHT_KEYS as readonly string[]).includes(value)
}

/** "1 nacht" / "6 nachten" — locale-agnostisch via de meegegeven woorden. */
export function nightKeyLabel(key: string, nightWord: string, nightsWord: string): string {
  return key === '1' ? `1 ${nightWord}` : `${key} ${nightsWord}`
}

/** "5, 6, 7 of 8" — sorted keys joined with commas and the locale's "or"
 *  before the last one (single key returns as-is). */
export function joinNightKeys(keys: readonly string[], orWord: string): string {
  const sorted = [...keys].sort((a, b) => Number(a) - Number(b))
  if (sorted.length <= 1) return sorted[0] ?? ''
  return `${sorted.slice(0, -1).join(', ')} ${orWord} ${sorted[sorted.length - 1]}`
}
