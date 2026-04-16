import type { LocalizedString } from '~/i18n/types'

/**
 * Picks the N most distinguishing inclusions for a deal within a hotel context.
 *
 * Algorithm:
 * 1. Count how often each inclusion appears across all deals of the hotel
 * 2. Skip overnight/room inclusions (already in the title)
 * 3. Score by: uniqueness (appears in fewer deals = higher) + interest (dinner/wellness rank higher)
 * 4. Return top N by score
 */
export function pickSmartInclusions(
  dealInclusions: LocalizedString[],
  allDealsInclusions: LocalizedString[][],
  locale: 'nl' | 'en' = 'nl',
  count: number = 3,
): LocalizedString[] {
  if (dealInclusions.length <= count) return dealInclusions

  // Count frequency of each inclusion across all deals (by NL text as key)
  const freqMap = new Map<string, number>()
  for (const inclusions of allDealsInclusions) {
    for (const inc of inclusions) {
      const key = inc[locale]
      freqMap.set(key, (freqMap.get(key) || 0) + 1)
    }
  }

  const totalDeals = allDealsInclusions.length

  // Score each inclusion of THIS deal
  const scored = dealInclusions.map((inc) => {
    const text = inc[locale].toLowerCase()
    let score = 0

    // Skip overnight inclusions (they're already in the card title)
    if (text.includes('overnacht') || text.match(/^\d+x?\s*(night|nacht)/i)) {
      return { inc, score: -100 }
    }

    // Uniqueness: appears in fewer deals = more distinguishing
    const freq = freqMap.get(inc[locale]) || 1
    if (freq < totalDeals) {
      score += (totalDeals - freq) * 10 // Big bonus for unique items
    } else {
      score -= 5 // Penalty for appearing in ALL deals
    }

    // Interest bonus: certain types are more appealing to highlight
    if (text.includes('diner') || text.includes('dinner') || text.includes('gangenmenu') || text.includes('course')) score += 8
    if (text.includes('wellness') || text.includes('spa') || text.includes('sauna')) score += 7
    if (text.includes('zwembad') || text.includes('pool')) score += 6
    if (text.includes('bubbel') || text.includes('champagne') || text.includes('prosecco')) score += 5
    if (text.includes('lunch')) score += 4
    if (text.includes('ontbijt') || text.includes('breakfast')) score += 3
    if (text.includes('late check') || text.includes('uitslapen')) score += 3
    if (text.includes('fiets') || text.includes('wandel') || text.includes('bike') || text.includes('hik')) score += 2

    return { inc, score }
  })

  // Sort by score descending, take top N
  scored.sort((a, b) => b.score - a.score)

  const result = scored.slice(0, count).map((s) => s.inc)

  // If we got items with very low scores (all common), fall back to first N non-overnight
  if (result.length < count) {
    const fallback = dealInclusions.filter(
      (inc) => !inc[locale].toLowerCase().includes('overnacht') && !inc[locale].match(/^\d+x?\s*(night|nacht)/i),
    )
    return fallback.slice(0, count)
  }

  return result
}
