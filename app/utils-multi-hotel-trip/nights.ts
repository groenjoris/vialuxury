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
