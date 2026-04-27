import type { LocalizedString } from '~/i18n/types'

/**
 * Picks N inclusions for a deal-card preview.
 *
 * Rules:
 * 1. Always skip overnight items ("X x overnachting", "1 night", etc.) — already in title.
 * 2. Prefer inclusions that OTHER deals of the same hotel don't have (differentiation).
 * 3. If fewer than N differentiated items exist, pad with the deal's own remaining
 *    items (cycling/repeating) so we always return exactly N items where possible.
 *
 * No keyword/interest scoring — pure uniqueness.
 */
export function pickSmartInclusions(
  dealInclusions: LocalizedString[],
  allDealsInclusions: LocalizedString[][],
  locale: 'nl' | 'en' = 'nl',
  count: number = 3,
): LocalizedString[] {
  const isOvernight = (text: string): boolean => {
    const t = text.toLowerCase()
    return /^\s*\d+\s*x?\s*(overnacht|night)/i.test(text) || t.includes('overnachting')
  }

  // Step 1: filter out overnight items from this deal
  const candidates = dealInclusions.filter(inc => !isOvernight(inc[locale] || ''))
  if (candidates.length === 0) return []

  // Step 2: count occurrences across ALL hotel deals (using NL/locale text as key)
  const freqMap = new Map<string, number>()
  for (const inclusions of allDealsInclusions) {
    for (const inc of inclusions) {
      if (isOvernight(inc[locale] || '')) continue
      const key = (inc[locale] || '').trim().toLowerCase()
      if (!key) continue
      freqMap.set(key, (freqMap.get(key) || 0) + 1)
    }
  }

  const totalDeals = allDealsInclusions.length || 1

  // Step 3: split candidates into "unique" (freq < totalDeals) and "common"
  const unique: LocalizedString[] = []
  const common: LocalizedString[] = []
  for (const inc of candidates) {
    const key = (inc[locale] || '').trim().toLowerCase()
    const freq = freqMap.get(key) || 1
    if (freq < totalDeals) unique.push(inc)
    else common.push(inc)
  }

  // Step 4: take unique first, then common, then pad by cycling if still short
  const result: LocalizedString[] = []
  for (const inc of unique) {
    if (result.length >= count) break
    result.push(inc)
  }
  for (const inc of common) {
    if (result.length >= count) break
    result.push(inc)
  }
  // Pad by cycling through candidates if there aren't enough distinct items
  let i = 0
  while (result.length < count && candidates.length > 0) {
    result.push(candidates[i % candidates.length])
    i++
  }

  return result.slice(0, count)
}
