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

/**
 * Dutch word-form nights label: "één nacht" / "twee nachten" / "drie
 * nachten" / "vier nachten" / "vijf nachten" / "zes nachten" / "zeven
 * nachten". Falls back to the digit form for n > 7.
 *
 * Capitalised first letter so it can lead a sentence (e.g. "Twee
 * nachten wellnessarrangement"). Pass `capitalise: false` for
 * mid-sentence use.
 */
const NL_NIGHT_WORDS = ['nul', 'één', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven']

export function nightsWord(n: number, capitalise = true): string {
  const word = NL_NIGHT_WORDS[n]
  if (!word) return nightsLabel(n, 'nl')
  const head = capitalise ? word.charAt(0).toUpperCase() + word.slice(1) : word
  return `${head} ${n === 1 ? 'nacht' : 'nachten'}`
}

export function personsLabel(p: number, lang: Lang = 'nl'): string {
  if (lang === 'en') return `${p} ${p === 1 ? 'person' : 'persons'}`
  return `${p} ${p === 1 ? 'persoon' : 'personen'}`
}

export function roomsLabel(r: number, lang: Lang = 'nl'): string {
  if (lang === 'en') return `${r} ${r === 1 ? 'room' : 'rooms'}`
  return `${r} ${r === 1 ? 'kamer' : 'kamers'}`
}
