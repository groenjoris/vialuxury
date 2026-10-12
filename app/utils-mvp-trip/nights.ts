/**
 * MVP — reisduur-opties (aantal nachten) voor alle pickers, precies als in het
 * Redesign-prototype (R1): 1, 2, 3, 4 nachten en "5+" (5 nachten of meer), als
 * platte lijst zonder categorieën. De vakantie-reisduren 5/6/7/8 uit MHT komen later.
 */
export const NIGHT_KEYS = ['1', '2', '3', '4', '5+'] as const
export type NightKey = (typeof NIGHT_KEYS)[number]

/** De reisduur die bij de vakanties hoort (6 nachten → "5+"). */
export const TRIP_NIGHT_KEYS: NightKey[] = ['5+']

const PLUS_KEY = '5+'
const PLUS_FROM = 5

/** Reisduur-key voor een deal: 1…4 exact, 5 nachten of meer = "5+". */
export function nightKeyFor(nights: number): string {
  if (nights >= PLUS_FROM) return PLUS_KEY
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

/** "1 nacht" / "3 nachten" / "5+ nachten" — locale-agnostisch via de meegegeven woorden. */
export function nightKeyLabel(key: string, nightWord: string, nightsWord: string): string {
  if (key === PLUS_KEY) return `${PLUS_KEY} ${nightsWord}`
  return key === '1' ? `1 ${nightWord}` : `${key} ${nightsWord}`
}

const keyNum = (k: string) => (k === PLUS_KEY ? PLUS_FROM : Number(k))

/** "2, 3 of 5+" — gesorteerde keys met komma's en het "of" van de taal ervoor. */
export function joinNightKeys(keys: readonly string[], orWord: string): string {
  const sorted = [...keys].sort((a, b) => keyNum(a) - keyNum(b))
  if (sorted.length <= 1) return sorted[0] ?? ''
  return `${sorted.slice(0, -1).join(', ')} ${orWord} ${sorted[sorted.length - 1]}`
}

/**
 * Korte samenvatting van een selectie voor veldwaarden en pills: alleen "5+" →
 * "5 nachten of meer"; één nacht → "3 nachten"; anders de losse nachten
 * ("2, 4 of 5+ nachten"). `t` levert de vertalingen.
 */
export function summarizeNightKeys(
  keys: readonly string[],
  t: (key: string) => string,
  words: { night: string; nights: string; or: string },
): string {
  if (keys.length === 0) return ''
  if (keys.length === 1) return keys[0] === PLUS_KEY ? t('header.duration.5plusLong') : nightKeyLabel(keys[0]!, words.night, words.nights)
  return `${joinNightKeys(keys, words.or)} ${words.nights}`
}
