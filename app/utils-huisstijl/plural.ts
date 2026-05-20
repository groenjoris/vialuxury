/**
 * Tiny plural helpers for the Dutch/English noun pairs used across the site.
 * Centralises the singular/plural switch so we don't repeat the inline
 * `n === 1 ? 'nacht' : 'nachten'` ternary.
 *
 * Each helper returns the count + noun in the right form, e.g.
 *   nightsLabel(1, 'nl') → '1 nacht'
 *   nightsLabel(3, 'nl') → '3 nachten'
 *   personsLabel(1, 'nl') → '1 persoon'
 *   personsLabel(2, 'en') → '2 persons'
 */

type Lang = 'nl' | 'en'

export function nightsLabel(n: number, lang: Lang = 'nl'): string {
  if (lang === 'en') return `${n} ${n === 1 ? 'night' : 'nights'}`
  return `${n} ${n === 1 ? 'nacht' : 'nachten'}`
}

export function personsLabel(p: number, lang: Lang = 'nl'): string {
  if (lang === 'en') return `${p} ${p === 1 ? 'person' : 'persons'}`
  return `${p} ${p === 1 ? 'persoon' : 'personen'}`
}

export function roomsLabel(r: number, lang: Lang = 'nl'): string {
  if (lang === 'en') return `${r} ${r === 1 ? 'room' : 'rooms'}`
  return `${r} ${r === 1 ? 'kamer' : 'kamers'}`
}
