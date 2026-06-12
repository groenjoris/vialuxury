type Lang = 'nl' | 'en' | 'de'

/**
 * Return a count + "night(s)" label in the given language.
 *
 * @param n - Number of nights.
 * @param lang - Language code (default "nl").
 * @returns e.g. "1 nacht", "3 nachten", "2 nights".
 */
export function nightsLabel(n: number, lang: Lang = 'nl'): string {
  if (lang === 'en') return `${n} ${n === 1 ? 'night' : 'nights'}`
  if (lang === 'de') return `${n} ${n === 1 ? 'Nacht' : 'Nächte'}`
  return `${n} ${n === 1 ? 'nacht' : 'nachten'}`
}

const NL_NIGHT_WORDS = ['nul', 'één', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven']

/**
 * Return a spelled-out Dutch nights label (e.g. "Twee nachten").
 * Falls back to the digit form for values above 7.
 *
 * @param n - Number of nights (0-7 for word form, otherwise digits).
 * @param capitalise - Whether to capitalise the first letter (default true).
 * @returns e.g. "Twee nachten", "één nacht".
 */
export function nightsWord(n: number, capitalise = true): string {
  const word = NL_NIGHT_WORDS[n]
  if (!word) return nightsLabel(n, 'nl')
  const head = capitalise ? word.charAt(0).toUpperCase() + word.slice(1) : word
  return `${head} ${n === 1 ? 'nacht' : 'nachten'}`
}

/**
 * Return a count + "person(s)" label in the given language.
 *
 * @param p - Number of persons.
 * @param lang - Language code (default "nl").
 * @returns e.g. "1 persoon", "2 personen", "3 persons".
 */
export function personsLabel(p: number, lang: Lang = 'nl'): string {
  if (lang === 'en') return `${p} ${p === 1 ? 'person' : 'persons'}`
  if (lang === 'de') return `${p} ${p === 1 ? 'Person' : 'Personen'}`
  return `${p} ${p === 1 ? 'persoon' : 'personen'}`
}

/**
 * Return a count + "room(s)" label in the given language.
 *
 * @param r - Number of rooms.
 * @param lang - Language code (default "nl").
 * @returns e.g. "1 kamer", "2 kamers", "1 room".
 */
export function roomsLabel(r: number, lang: Lang = 'nl'): string {
  if (lang === 'en') return `${r} ${r === 1 ? 'room' : 'rooms'}`
  if (lang === 'de') return `${r} Zimmer`
  return `${r} ${r === 1 ? 'kamer' : 'kamers'}`
}
