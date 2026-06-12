/**
 * Derives the "arrangement suffix" shown on v6 sidepanel deal cards.
 * Inspects a deal's localised highlights (`SearchHotelDeal.highlights`)
 * in a fixed priority order and returns the matching descriptor.
 *
 * Priority (first match wins):
 *   1. Cruise          → "met cruise"
 *   2. Vrijkaartjes /
 *      toegangskaarten → "met toegangskaarten"
 *   3. Fiets / fietsen  → "met fiets"
 *   4. Diner + wellness → "met diner en wellness"
 *   5. Diner            → "met diner"
 *   6. Wellness / spa   → "met wellness"
 *   7. Zwembad          → "met zwembad"
 *   8. else             → "luxe hotel-arrangement"
 *
 * Result is a full suffix phrase; the caller composes
 * `${nightsWord(n)} ${suffix}` to render e.g. "Twee nachten met cruise".
 */
import type { LocalizedString } from '~/i18n/types'

/** Match any of the keywords against the lower-cased haystack. */
function has(haystack: string, ...needles: string[]): boolean {
  return needles.some(n => haystack.includes(n))
}

/** Pull the searchable text out of a LocalizedString. Falls back to nl
 *  when en is missing. Joined into one lowercased blob for keyword
 *  matching against ALL highlights at once. */
function highlightsText(highlights: LocalizedString[] | undefined): string {
  if (!highlights || !highlights.length) return ''
  return highlights
    .map(h => {
      if (typeof h === 'string') return h
      return h.nl ?? h.en ?? ''
    })
    .join(' ')
    .toLowerCase()
}

export function arrangementSuffixFromHighlights(
  highlights: LocalizedString[] | undefined,
): string {
  const text = highlightsText(highlights)
  if (!text) return 'luxe hotel-arrangement'

  if (has(text, 'cruise', 'boottocht', 'vaartocht')) return 'met cruise'
  if (has(text, 'vrijkaart', 'toegangskaart', 'tickets', 'museumkaart', 'entreekaart')) {
    return 'met toegangskaarten'
  }
  if (has(text, 'fiets')) return 'met fiets'

  const hasDinner = has(text, 'diner', 'dineren', '-gangen', 'gangen-')
  const hasWellness = has(text, 'wellness', 'spa', 'sauna', 'massage')
  if (hasDinner && hasWellness) return 'met diner en wellness'
  if (hasDinner) return 'met diner'
  if (hasWellness) return 'met wellness'

  if (has(text, 'zwembad', 'pool', 'binnenbad', 'buitenbad')) return 'met zwembad'

  return 'luxe hotel-arrangement'
}
